import cron from 'node-cron'
import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'


cron.schedule('* * * * *', async () => {
    console.log('Starting indent expiry cron job at:', new Date())
    await processExpiredIndents()
     await createPurchaseIndents(); 
  await createPurchaseOrders();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
})

const processExpiredIndents = async () => {
    try {
        const openIndents = await prisma.salesIndent.findMany({
            where: {
                status: STATUS.OPEN,
                expired_at:null
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        if (!openIndents.length) {
            console.log('No open indents found')
            return
        }

        console.log(`Found ${openIndents.length} open indents to process`)

        const operations = []

        for (const indent of openIndents) {
            const { sale_order_IDs } = indent

            console.log(`Processing indent ${indent.indent_number}`)
            console.log(`total Sales Order${indent.total_sales_order}`);
            console.log(`Needed: ${indent.total_remain_product}`)

            if (!sale_order_IDs.length) {
                console.log(`No sales orders found for indent ${indent.indent_number}`)
                continue
            }

            const salesOrderProducts = await prisma.salesOrderProduct.findMany({
                where: {
                    sales_order_id: { in: sale_order_IDs },
                    product_id: indent.product_id,
                    remaining_qty: { gt: 0 }
                },
                include: {
                    salesOrder: true
                },
                orderBy: [
                    { salesOrder: { order_type: 'desc' } },
                    { salesOrder: { priority: 'desc' } },  
                    { created_at: 'asc' }                  
                ]
            })


            for (const salesOrderProduct of salesOrderProducts) {

                operations.push(
                    prisma.salesOrderProduct.update({
                        where: { id: salesOrderProduct.id },
                        data: {
                            allocated_qty: salesOrderProduct.ordered_qty,
                            remaining_qty: 0
                        }
                    })
                )

                operations.push(
                    prisma.salesOrder.update({
                        where: { id: salesOrderProduct.sales_order_id },
                        data: {
                            status: STATUS.ALLOCATED,
                            processed_date: new Date()
                        }
                    })
                )
            }
             operations.push(
            prisma.salesIndent.update({
                where: { id: indent.id },
                data: {
                    status: STATUS.CLOSED,
                    expired_at: new Date()
                }
            })
        )
         console.log(`Processed indent ${indent.indent_number} is completed`)
        }

         await prisma.$transaction(operations)

    }
    catch (error) {
        console.error('Error processing expired indents:', error)
        throw error
    }
}


async function createPurchaseIndents() {
  try {
    const openSalesIndents = await prisma.salesIndent.findMany({
      where: {
        status: STATUS.OPEN,
        expired_at: null
      },
      include: { product: true }
    });

    if (!openSalesIndents.length) {
      console.log("No OPEN SalesIndents found.");
      return;
    }

    const tx = [];

    for (const sIndent of openSalesIndents) {
        
      const salesOrderProducts = await prisma.salesOrderProduct.findMany({
        where: {
          product_id: sIndent.product_id,
          sales_order_id: { in: sIndent.sale_order_IDs },
          remaining_qty: { gt: 0 }
        },
        include: { salesOrder: true, vendor: true }
      });

      const vendorMap = new Map();
      for (const p of salesOrderProducts) {
        if (!vendorMap.has(p.vendor_id)) {
          vendorMap.set(p.vendor_id, { qty: 0, amount: 0 });
        }
        const v = vendorMap.get(p.vendor_id);
        v.qty += p.remaining_qty;
        v.amount += p.total_amount;
      }

      for (const [vendorId, v] of vendorMap.entries()) {
        tx.push(
          prisma.purchaseIndent.create({
            data: {
              purchase_indent_number: `PI-${uuidv4().slice(0, 8)}`,
              product_id: sIndent.product_id,
              vendor_id: vendorId,
              sale_ident_id: sIndent.id,
              total_order_qty: v.qty,
              total_amount: v.amount,
              status: "pending"
            }
          })
        );
      }
    }

    await prisma.$transaction(tx);
    console.log(`✅ Created ${tx.length} PurchaseIndents.`);
  } catch (err) {
    console.error("Error creating PurchaseIndents:", err);
  }
}



async function createPurchaseOrders() {
  try {
    const pendingIndents = await prisma.purchaseIndent.findMany({
      where: { status: "pending" },
      include: {
        product: true,
        vendor: true,
        salesIndent: {
          include: { product: true }
        }
      }
    });

    if (!pendingIndents.length) {
      console.log("No pending PurchaseIndents to convert.");
      return;
    }

    const vendorGroups = new Map();
    for (const indent of pendingIndents) {
      if (!vendorGroups.has(indent.vendor_id)) vendorGroups.set(indent.vendor_id, []);
      vendorGroups.get(indent.vendor_id).push(indent);
    }

    const tx = [];

    for (const [vendorId, indents] of vendorGroups.entries()) {
      let totalAmount = 0;
      let totalB2B = 0;
      let totalB2C = 0;

      for (const indent of indents) {
        totalAmount += indent.total_amount;
        const salesOrders = await prisma.salesOrder.findMany({
          where: { id: { in: indent.salesIndent.sale_order_IDs } },
          select: { order_type: true, total_order_qty: true }
        });

        for (const order of salesOrders) {
          if (order.order_type === "B2B") totalB2B += order.total_order_qty;
          else totalB2C += order.total_order_qty;
        }
      }

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          order_number: `PO-${uuidv4().slice(0, 8)}`,
          vendor_id: vendorId,
          order_date: new Date(),
          total_amount: totalAmount,
          total_B2B: totalB2B,
          total_B2C: totalB2C,
          status: "pending"
        }
      });

      for (const indent of indents) {
        tx.push(
          prisma.purchaseOrderProduct.create({
            data: {
              purchaseOrderId: purchaseOrder.id,
              product_id: indent.product_id,
              ordered_qty: indent.total_order_qty,
              price: indent.total_amount / Math.max(indent.total_order_qty, 1),
              mrp: indent.product.product_mrp ?? 0
            }
          })
        );

        tx.push(
          prisma.purchaseIndent.update({
            where: { id: indent.id },
            data: { status: "converted", purchaseOrders: { connect: { id: purchaseOrder.id } } }
          })
        );
      }
    }

    await prisma.$transaction(tx);
    console.log(`✅ Created PurchaseOrders for ${vendorGroups.size} vendors.`);
  } catch (err) {
    console.error("Error creating PurchaseOrders:", err);
  }
}