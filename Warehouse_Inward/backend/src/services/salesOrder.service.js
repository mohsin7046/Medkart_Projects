import { prisma } from '../utilities/import.config.js'
import { STATUS, PRIORITY, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { saleLogger } from '../utilities/logger.js'

export const createSaleOrderService = async (data) => {
    try {
        const sales_order_number = generateRandom(PREFIX.SALE);

        console.log(sales_order_number);

        const itemsWithTotal = data.items.map((item) => ({
            ...item,
            totalAmount: decimalConversion(item.ordered_qty * item.product_price)
        }))


        const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0));

        const totalOrderQty = data.items.reduce((sum, item) => sum + item.ordered_qty, 0);

        const priority = data.order_type === "B2B" ? PRIORITY.HIGH : PRIORITY.NORMAL;


        const vendor = await prisma.vendor.findFirstOrThrow({
            orderBy: {
                id: 'desc',
            },
        });


        const createdSalesOrder = await prisma.salesOrder.create({
            data: {
                sales_order_number,
                name: data.name,
                email: data.email,
                contact_number: data.contact_number,
                address: data?.address || null,
                order_type: data.order_type,
                priority,
                processed: false,
                totalOrderQty,
                total_amount,
                delivery_status: STATUS.NOT_DISPATCHED,
                payment_status: STATUS.UNPAID,
                status: STATUS.PENDING,
                products: {
                    create: data.items.map((item, idx) => ({
                        product_id: item.product_id,
                        vendor_id: vendor.id,
                        ordered_qty: item.ordered_qty,
                        allocated_qty: 0,
                        remaining_qty: item.ordered_qty,
                        totalAmount: itemsWithTotal[idx].totalAmount,
                    })),
                }
            },
        });


        if (!createdSalesOrder) {
            saleLogger.error("❌ Error while creating sales Order");
            throw new Error("Sales Order not created");
        }


        console.log(createdSalesOrder);
        saleLogger.info(`✅ Sales Order created | Sales Order Number: ${sales_order_number}`);
    } catch (error) {
        saleLogger.error(`❌ Failed to create Sales Order | Error: ${error.message}`);
        throw error
    }
}


export const updateSaleOrderService = async (data) => {
    try {
        const itemsWithTotal = data.items.map((item) => ({
            ...item,
            totalAmount: decimalConversion(item.ordered_qty * item.product_price)
        }))

        const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0));

        const totalOrderQty = data.items.reduce((sum, item) => sum + item.ordered_qty, 0);
        const priority = data.order_type === "B2B" ? PRIORITY.HIGH : PRIORITY.NORMAL;

        const updatedSalesOrder = await prisma.salesOrder.update({
            where: { id: data.sales_order_id },
            data: {
                name: data.name,
                email: data.email,
                address: data?.address || null,
                order_type: data.order_type,
                priority,
                processed: false,
                totalOrderQty,
                total_amount,
                status: STATUS.PENDING,
                products: {
                    deleteMany: { sales_order_id: data.sales_order_id },
                    create: data.items.map((item, idx) => ({
                        product_id: item.product_id,
                        vendor_id: item.vendor_id,
                        ordered_qty: item.ordered_qty,
                        allocated_qty: 0,
                        remaining_qty: item.ordered_qty,
                        totalAmount: itemsWithTotal[idx].totalAmount,
                    })),
                }
            },
        });

        if (!updatedSalesOrder) {
            saleLogger.error("❌ Error while creating sales Order");
            throw new Error("Sales Order not created");
        }

        console.log(updatedSalesOrder);
        saleLogger.info(`✅ Sales Order created | Sales Order Id: ${data.sales_order_id}`);
    } catch (error) {
        saleLogger.error(`❌ Failed to create Sales Order | Error: ${error.message}`);
        throw error
    }
}


export const deleteSalesOrderService = async (sales_order_id) => {
    try {
        const existingSalesOrder = await prisma.salesOrder.findFirst({
            where: { id: sales_order_id, deleted_at: null }
        })

        if (existingSalesOrder && ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingSalesOrder.status))) {
            saleLogger.error('Cannot delete completed or cancelled Sales Order')
            throw new Error('Cannot delete completed or cancelled Sales Order');
        }

        await prisma.salesOrderProduct.updateMany({
            where: { sales_order_id },
            data: { deleted_at: new Date() },
        });

        const deleteSalesOrder = await prisma.salesOrder.update({
            where: { id: sales_order_id },
            data: { deleted_at: new Date(), status: STATUS.CANCELLED },
        });

        if (!deleteSalesOrder) {
            saleLogger.error(`❌ Error while deleting sales Order  ${sales_order_id}`);
            throw new Error("sales Order not deleted");
        }
        saleLogger.info(`✅ sales Order deleted | ID: ${sales_order_id}`);
    } catch (error) {
        saleLogger.error(`❌ Failed to delete sales Order | ID: ${sales_order_id} | Error: ${error.message}`);
        throw error;
    }
}



export const getSalesOrderByIdService = async (id) => {
    const salesOrderData = await prisma.salesOrder.findUnique({
        where: { id: parseInt(id) },
        select: {
            sales_order_number: true,
            name: true,
            email: true,
            contact_number: true,
            address: true,
            order_type: true,
            priority: true,
            processed_date: true,
            delivery_date: true,
            status: true,
            processed: true,
            payment_status: true,
            delivery_status: true,
            totalOrderQty: true,
            total_amount: true,
            products: {
                select: {
                    ordered_qty: true,
                    allocated_qty: true,
                    remaining_qty: true,
                    updated_at: true,
                    totalAmount: true,
                    product: {
                        select: {
                            name: true,
                            category: true,
                            combination: true,
                            product_mrp: true,
                            product_price: true,
                            description: true,
                            hsn_code: true,
                            gst_percentage: true,
                            status: true
                        }
                    },
                    vendor: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

    if (!salesOrderData) {
        saleLogger.error(`Sales Order not found for ID: ${id}`)
        throw new Error(`Sales Order not found for ID: ${id}`);
    }

   const productsWithCombinationString = salesOrderData.products.map(p => ({
        ...p,
        product: {
            ...p.product,
            combination: Array.isArray(p.product.combination) ? p.product.combination.join(', ') : p.product.combination
        }
    }));

    return {
        ...salesOrderData,
        products: productsWithCombinationString
    };

}



export const getSalesOrderForEditByIdService = async (id) => {
    try {
        const fetchSalesOrder = await prisma.salesOrder.findUnique({
            where: { id: parseInt(id) },
            select: {
                id:true,
                name: true,
                email: true,
                contact_number: true,
                address: true,
                order_type: true,
                products: {
                    select: {
                        product_id: true,
                        vendor_id: true,
                        ordered_qty: true,
                        product: {
                            select: {
                                name: true,
                                product_mrp: true,
                                product_price: true
                            }
                        }
                    }
                }
            }
        })


        if (!fetchSalesOrder) {
            saleLogger.error(`Sales Order not found for ID: ${id}`)
            throw new Error(`Sales Order not found for ID: ${id}`);
        }
        const formattedData = {
            ...fetchSalesOrder,
            items: fetchSalesOrder.products.map((p) => ({
                product_id: p.product_id,
                vendor_id: p.vendor_id,
                ordered_qty: p.ordered_qty,
                product_name: p.product?.name || "",
                product_mrp: p.product?.product_mrp || 0,
                product_price: p.product?.product_price || 0
            }))
        };

        return formattedData;

    } catch (error) {
        saleLogger.error(`❌ Failed to fetch sales Order | ID: ${id} | Error: ${error.message}`);
        throw error;
    }
}



export const processSalesOrderService = async (data) => {
    const { sales_order_ids } = data
    const orderIds = Array.isArray(sales_order_ids) ? sales_order_ids : [sales_order_ids]

    let salesOrders = await prisma.salesOrder.findMany({
        where: { id: { in: orderIds } },
        include: { products: { include: { product: true } } }
    })

    if (!salesOrders.length) throw new Error('Sales order(s) not found')

    salesOrders.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (a.priority !== 'high' && b.priority === 'high') return 1
        return 0
    })

    console.log(salesOrders);

    const productIds = [...new Set(salesOrders.flatMap(o => o.products.map(p => p.product_id)))]
    const allProducts = await prisma.product.findMany({
        where: { id: { in: productIds } }
    })

    const currentInventory = new Map()
    allProducts.forEach(product => {
        currentInventory.set(product.id, product.inventory_qty)
    })

    const existingIndents = await prisma.salesIndent.findMany({
        where: { product_id: { in: productIds }, status: 'open' }
    })

    const indentMap = new Map(existingIndents.map(i => [i.product_id, i]))

    const operations = []


    for (const order of salesOrders) {
        let orderStatus = STATUS.ALLOCATED
        const isB2B = order.order_type === 'B2B'

        for (const product of order.products) {
            const { product: dbProduct } = product

            console.log(dbProduct);


            if (!dbProduct) throw new Error(`Product ${product.product_id} not found`)

            const currentInventoryQty = currentInventory.get(dbProduct.id)
            const shortage = product.ordered_qty - currentInventoryQty
            const canFullyAllocate = shortage <= 0

            let allocatedQty, remainingQty, newInventory

            if (isB2B) {
                allocatedQty = Math.max(0, Math.min(currentInventoryQty, product.ordered_qty))
                remainingQty = Math.max(0, shortage)
                newInventory = Math.max(0, currentInventoryQty - allocatedQty)

                if (shortage > 0 && allocatedQty > 0) {
                    orderStatus = STATUS.PARTIAL_RECEVIED
                    handleIndent(product, order, shortage, indentMap, operations)
                }
                else if(shortage > 0 && allocatedQty <= 0){
                     orderStatus = STATUS.PROCESSING
                    handleIndent(product, order, shortage, indentMap, operations)
                }
            } else {

                if (canFullyAllocate) {
                    allocatedQty = product.ordered_qty
                    remainingQty = 0
                    newInventory = Math.max(0, currentInventoryQty - product.ordered_qty)
                } else {
                    allocatedQty = 0
                    remainingQty = product.ordered_qty
                    newInventory = currentInventoryQty
                    orderStatus = STATUS.PROCESSING
                    handleIndent(product, order, product.ordered_qty, indentMap, operations)
                }
            }


            currentInventory.set(dbProduct.id, newInventory)
            console.log("Invetory remain", newInventory);

            operations.push(
                prisma.salesOrderProduct.update({
                    where: { id: product.id },
                    data: { allocated_qty: allocatedQty, remaining_qty: remainingQty }
                }),
                prisma.product.update({
                    where: { id: dbProduct.id },
                    data: { inventory_qty: newInventory }
                })
            )
        }

        console.log("Order Status", orderStatus);

        operations.push(
            prisma.salesOrder.update({
                where: { id: order.id },
                data: {
                    processed: true,
                    status: orderStatus,
                    processed_date: new Date()
                }
            })
        )
    }

    await prisma.$transaction(operations)
    return { message: 'Sales order(s) processed successfully' }
}


let processedOrders = new Set();

const handleIndent = async (product, order, quantity, indentMap, operations) => {
    const existingIndent = indentMap.get(product.product_id)
    const isOrderAlreadyProcessed = processedOrders.has(order.id)
    if (existingIndent) {

        operations.push(
            await prisma.salesIndent.update({
                where: { id: existingIndent.id },
                data: {
                    total_sales_order: existingIndent.total_sales_order + (isOrderAlreadyProcessed ? 0 : 1),
                    sale_order_IDs: isOrderAlreadyProcessed ?
                        existingIndent.sale_order_IDs :
                        [...existingIndent.sale_order_IDs, order.id],
                    total_remain_product: existingIndent.total_remain_product + quantity
                }
            })
        )


    } else {

        operations.push(
            await prisma.salesIndent.create({
                data: {
                    indent_number: generateRandom(PREFIX.INDENT),
                    product_id: product.product_id,
                    total_sales_order: 1,
                    total_remain_product: quantity,
                    sale_order_IDs: [order.id],
                    status: 'open'
                }
            })
        )

    }

    processedOrders.add(order.id)
}



