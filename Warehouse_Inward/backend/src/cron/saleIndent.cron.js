import cron from 'node-cron'
import { prisma } from '../utilities/import.config.js'
import { PREFIX, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'

cron.schedule('* * * * *', async () => {
  console.log('Starting indent expiry cron job at:', new Date())
  await createPurchaseIndents();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
})

async function createPurchaseIndents() {
  try {
    const openSalesIndents = await prisma.salesIndent.findMany({
      where: {
        status: STATUS.OPEN,
        expired_at: null
      },
      include: {
        salesOrders: {
          select: {
            sales_order_id: true
          }
        }
      }
    });

    if (!openSalesIndents.length) {
      console.log("No OPEN SalesIndents found.");
      return;
    }

    const allSalesOrderIds = [
      ...new Set(
        openSalesIndents.flatMap(indent => 
          indent.salesOrders.map(so => so.sales_order_id)
        )
      )
    ];
    
    const allSalesOrderProducts = await prisma.salesOrderProduct.findMany({
      where: {
        sales_order_id: { in: allSalesOrderIds },
        remaining_qty: { gt: 0 }
      },
      select: {
        product_id: true,
        vendor_id: true,
        remaining_qty: true,
        total_amount: true,
        sales_order_id: true,
        salesOrder: {
          select: {
            order_type: true
          }
        }
      }
    });

    const globalVendorMap = new Map();

    for (const sIndent of openSalesIndents) {
  
      const indentSalesOrderIds = sIndent.salesOrders.map(so => so.sales_order_id);

      const salesOrderProducts = allSalesOrderProducts.filter(
        p => p.product_id === sIndent.product_id && 
             indentSalesOrderIds.includes(p.sales_order_id)
      );

      if (!salesOrderProducts.length) {
        continue;
      }
      for (const p of salesOrderProducts) {
        if (!globalVendorMap.has(p.vendor_id)) {
          globalVendorMap.set(p.vendor_id, {
            B2B: 0,
            B2C: 0,
            total_amount: 0,
            products: new Map() 
          });
        }

        const v = globalVendorMap.get(p.vendor_id);

        if (p.salesOrder.order_type === "B2B") {
          v.B2B += p.remaining_qty;
        } else if (p.salesOrder.order_type === "B2C") {
          v.B2C += p.remaining_qty;
        }

        v.total_amount += p.total_amount;

        if (!v.products.has(p.product_id)) {
          v.products.set(p.product_id, { qty: 0, amount: 0 });
        }
        const productData = v.products.get(p.product_id);
        productData.qty += p.remaining_qty;
        productData.amount += p.total_amount;
      }
    }

    console.log("Global VendorMap:", globalVendorMap);

    const tx = [];

    for (const [vendorId, v] of globalVendorMap.entries()) {
      const purchaseIndentNumber = generateRandom(PREFIX.PURCHASE_IDENT);

      const items = Array.from(v.products.entries()).map(([productId, data]) => ({
        product_id: productId,
        qty_to_be_order: data.qty,
        total_amount: decimalConversion(data.amount)
      }));

      tx.push(
        prisma.purchaseIndent.create({
          data: {
            purchase_indent_number: purchaseIndentNumber,
            vendor_id: vendorId,
            B2B_order_qty: v.B2B,
            B2C_order_qty: v.B2C,
            total_qty_to_be_order: v.B2B + v.B2C,
            total_amount: decimalConversion(v.total_amount),
            status: STATUS.PENDING,
            items: {
              create: items
            }
          }
        })
      );
    }

    for (const sIndent of openSalesIndents) {
      tx.push(
        prisma.salesIndent.update({
          where: { id: sIndent.id },
          data: { 
            status: STATUS.CLOSED, 
            expired_at: new Date() 
          }
        })
      );
    }

    if (tx.length === 0) {
      console.log("No purchase indents to create.");
      return;
    }

    await prisma.$transaction(tx);
    console.log(`✅ Created ${globalVendorMap.size} PurchaseIndents with items.`);
    console.log(`✅ Closed ${openSalesIndents.length} SalesIndents.`);
  } catch (err) {
    console.error("Error creating PurchaseIndents:", err);
    throw err;
  }
}
