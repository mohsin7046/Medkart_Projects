import cron from 'node-cron'
import { prisma } from '../utilities/import.config.js'
import { PREFIX, STATUS } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'

cron.schedule('* * * * *', async () => {
  console.log('Starting indent expiry cron job at:', new Date())
  await createPurchaseIndents();
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
})

// async function createPurchaseIndents() {
//   try {
//     const openSalesIndents = await prisma.salesIndent.findMany({
//       where: {
//         status: STATUS.OPEN,
//         expired_at: null
//       },
//     });

//     if (!openSalesIndents.length) {
//       console.log("No OPEN SalesIndents found.");
//       return;
//     }

//     const tx = [];

//     for (const sIndent of openSalesIndents) {

//       const salesOrderProducts = await prisma.salesOrderProduct.findMany({
//         where: {
//           product_id: sIndent.product_id,
//           sales_order_id: { in: sIndent.sale_order_IDs },
//           remaining_qty: { gt: 0 }
//         },
//         select: {
//           product_id: true,
//           vendor_id: true,
//           ordered_qty: true,
//           remaining_qty: true,
//           allocated_qty: true,
//           total_amount: true,
//           salesOrder: {
//             select: {
//               order_type: true
//             }
//           }
//         },

//       });

//       const vendorMap = new Map();

//       for (const p of salesOrderProducts) {
//         const key = `${p.product_id}_${p.vendor_id}`;

//         if (!vendorMap.has(key)) {
//           vendorMap.set(key, { B2B: 0, B2C: 0, total_amount: 0, product_id: p.product_id, vendor_id: p.vendor_id, sale_ident_ids: [] });
//         }

//         const v = vendorMap.get(key);

//         if (p.salesOrder.order_type === "B2B") {
//           v.B2B += p.remaining_qty;
//         } else if (p.salesOrder.order_type === "B2C") {
//           v.B2C += p.remaining_qty;
//         }

//         v.total_amount += p.total_amount;
//         if (!v.sale_ident_ids.includes(sIndent.id)) {
//           v.sale_ident_ids.push(sIndent.id);
//         }
//       }

//       console.log("VendorMap : ", vendorMap);

//       for (const [key, v] of vendorMap.entries()) {
//         tx.push(
//           prisma.purchaseIndent.create({
//             data: {
//               purchase_indent_number: generateRandom(PREFIX.PURCHASE_IDENT),
//               product_id: v.product_id,
//               vendor_id: v.vendor_id,
//               sale_ident_ids: v.sale_ident_ids,
//               B2B_order_qty: v.B2B,
//               B2C_order_qty: v.B2C,
//               total_order_qty: v.B2B + v.B2C,
//               total_amount: v.total_amount,
//               status: STATUS.PENDING
//             }
//           })
//         );
//       }
//       tx.push(
//         prisma.salesIndent.update({
//           where: { id: sIndent.id },
//           data: { status: STATUS.CLOSED, expired_at: new Date() }
//         })
//       );
//     }

//     await prisma.$transaction(tx);
//     console.log(`✅ Created ${tx.length} PurchaseIndents.`);
//   } catch (err) {
//     console.error("Error creating PurchaseIndents:", err);
//   }
// }

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
            salesOrderId: true
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
          indent.salesOrders.map(so => so.salesOrderId)
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

    const tx = [];

    for (const sIndent of openSalesIndents) {
  
      const indentSalesOrderIds = sIndent.salesOrders.map(so => so.salesOrderId);

     
      const salesOrderProducts = allSalesOrderProducts.filter(
        p => p.product_id === sIndent.product_id && 
             indentSalesOrderIds.includes(p.sales_order_id)
      );

      if (!salesOrderProducts.length) {
        continue;
      }

      const vendorMap = new Map();

      for (const p of salesOrderProducts) {
        if (!vendorMap.has(p.vendor_id)) {
          vendorMap.set(p.vendor_id, {
            B2B: 0,
            B2C: 0,
            total_amount: 0,
            products: new Map() 
          });
        }

        const v = vendorMap.get(p.vendor_id);

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

      console.log("VendorMap for indent", sIndent.indent_number, ":", vendorMap);

      for (const [vendorId, v] of vendorMap.entries()) {
        const purchaseIndentNumber = generateRandom(PREFIX.PURCHASE_IDENT);

        const items = Array.from(v.products.entries()).map(([productId, data]) => ({
          product_id: productId,
          order_qty: data.qty,
          total_amount: data.amount
        }));

        tx.push(
          prisma.purchaseIndent.create({
            data: {
              purchase_indent_number: purchaseIndentNumber,
              vendor_id: vendorId,
              B2B_order_qty: v.B2B,
              B2C_order_qty: v.B2C,
              total_order_qty: v.B2B + v.B2C,
              total_amount: v.total_amount,
              status: STATUS.PENDING,
              items: {
                create: items
              }
            }
          })
        );
      }

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
    console.log(`✅ Created ${tx.length / 2} PurchaseIndents with items.`);
  } catch (err) {
    console.error("Error creating PurchaseIndents:", err);
    throw err;
  }
}
