import cron from 'node-cron'
import { prisma } from '../utilities/import.config.js'
import { STATUS } from '../utilities/constant.js'


cron.schedule('* * * * *', async () => {
    console.log('Starting indent expiry cron job at:', new Date())
    await processExpiredIndents()
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

