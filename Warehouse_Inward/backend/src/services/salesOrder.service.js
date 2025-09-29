import { prisma } from '../utilities/import.config.js'
import { STATUS, PRIORITY, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { saleLogger } from '../utilities/logger.js'
import { salesIndentQueue, salesIndentQueueEvents, salesOrderQueue, salesOrderQueueEvents } from '../cache/queueManager.js'
import { SalesOrderRepository } from '../repository/salesOrder.repository.js'
import { ProductRepository } from '../repository/product.repository.js'
import { SalesIndentRepository } from '../repository/salesIndent.repository.js'

const saleOrderRepo = new SalesOrderRepository();
const productRepo = new ProductRepository();
const indentRepo = new SalesIndentRepository();

export const createSaleOrderService = async (data) => {
    try {
        const sales_order_number = generateRandom(PREFIX.SALE);

        console.log(sales_order_number);

        const itemsWithTotal = data.items.map((item) => ({
            product_id: item.product_id,
            vendor_id: item.vendor_id,
            ordered_qty: item.ordered_qty,
            allocated_qty: 0,
            remaining_qty: item.ordered_qty,
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


        const changeddata = {
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
                }))
            }
        };


        const module = 'sale-order';
        const operation = 'create';

        const job = await salesOrderQueue.add(`${module}:${operation}`, {
            module,
            operation,
            payload: { data: changeddata },
        }, {
            attempts: 3,
            backoff: { type: 'fixed', delay: 2000 },
            removeOnComplete: true,
        });

        const createdSalesOrder = await job.waitUntilFinished(salesOrderQueueEvents);

        if (!createdSalesOrder || createdSalesOrder.status !== 'success') {
            poLogger.error("❌ Error while creating sales Order");
            throw new Error("Sales Order not created");
        }

        saleLogger.info(`✅ Sales Order created | Sales Order Number: ${sales_order_number}`);
    } catch (error) {
        saleLogger.error(`❌ Failed to create Sales Order | Error: ${error.message}`);
        throw error
    }
}


export const updateSaleOrderService = async (data) => {
    try {
        const itemsWithTotal = data.items.map((item) => ({
             product_id: item.product_id,
            vendor_id: item.vendor_id,
            ordered_qty: item.ordered_qty,
            allocated_qty: 0,
            remaining_qty: item.ordered_qty,
            totalAmount: decimalConversion(item.ordered_qty * item.product_price)
        }))

        const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0));

        const totalOrderQty = data.items.reduce((sum, item) => sum + item.ordered_qty, 0);
        const priority = data.order_type === "B2B" ? PRIORITY.HIGH : PRIORITY.NORMAL;

        const changeddata = {
            sales_order_id: data.sales_order_id,
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
        };

        const module = 'sale-order';
        const operation = 'update';

        const job = await salesOrderQueue.add(`${module}:${operation}`, {
            module,
            operation,
            payload: { data: changeddata },
        }, {
            attempts: 3,
            backoff: { type: 'fixed', delay: 2000 },
            removeOnComplete: true,
        });

        const updatedSalesOrder = await job.waitUntilFinished(salesOrderQueueEvents);

        if (!updatedSalesOrder || updatedSalesOrder.status !== 'success') {
            saleLogger.error("❌ Error while creating sales Order");
            throw new Error("Sales Order not created");
        }

        saleLogger.info(`✅ Sales Order created | Sales Order Id: ${data.sales_order_id}`);
        return updatedSalesOrder
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
            saleLogger.error('Cannot delete completed or cancelled Sales Order');
            throw new Error('Cannot delete completed or cancelled Sales Order');
        }

        const module = 'sale-order';
        const operation = 'delete';

        const job = await salesOrderQueue.add(`${module}:${operation}`, {
            module,
            operation,
            payload: { sales_order_id },
        }, {
            attempts: 3,
            backoff: { type: 'fixed', delay: 2000 },
            removeOnComplete: true,
        });

        const deleteSalesOrder = await job.waitUntilFinished(salesOrderQueueEvents);

        if (!deleteSalesOrder || deleteSalesOrder.status !== 'success') {
            saleLogger.error(`❌ Error while deleting sales Order  ${sales_order_id}`);
            throw new Error("sales Order not deleted");
        }

        saleLogger.info(`✅ sales Order deleted | ID: ${sales_order_id}`);
        return deleteSalesOrder
    } catch (error) {
        saleLogger.error(`❌ Failed to delete sales Order | ID: ${sales_order_id} | Error: ${error.message}`);
        throw error;
    }
}


export const getSalesOrderByIdService = async (id) => {
    const salesOrderData = await saleOrderRepo.getSalesOrderById(id);

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
        const fetchSalesOrder = await saleOrderRepo.getSalesOrderForEditById(id)

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

    let salesOrders = await saleOrderRepo.findProductsInSalesOrders(orderIds);

    if (!salesOrders.length) throw new Error('Sales order(s) not found')

    salesOrders.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (a.priority !== 'high' && b.priority === 'high') return 1
        return 0
    })

    const productIds = [...new Set(salesOrders.flatMap(o => o.products.map(p => p.product_id)))]

    const allProducts = await productRepo.getProducts({ids:productIds});

    const currentInventory = new Map()
    
    allProducts.forEach(product => {
        currentInventory.set(product.id, product.inventory_qty)
    })

    const existingIndents = await indentRepo.existingIndentsByProductIds(productIds);   

    const indentMap = new Map(existingIndents.map(i => [i.product_id, i]))

    const operations = []


    for (const order of salesOrders) {
        let orderStatus = STATUS.ALLOCATED
        const isB2B = order.order_type === 'B2B'

        for (const product of order.products) {
            const { product: dbProduct } = product

            if (!dbProduct) throw new Error(`Product ${product.product_id} not found`)

            const currentInventoryQty = currentInventory.get(dbProduct.id)
            const shortage = product.ordered_qty - currentInventoryQty
            const canFullyAllocate = shortage <= 0

            let allocated_qty, remaining_qty, newInventory

            if (isB2B) {
                allocated_qty = Math.max(0, Math.min(currentInventoryQty, product.ordered_qty))
                remaining_qty = Math.max(0, shortage)
                newInventory = Math.max(0, currentInventoryQty - allocated_qty)

                if (shortage > 0 && allocated_qty > 0) {
                    orderStatus = STATUS.PARTIAL_RECEVIED
                    await handleIndent(product, order, shortage, indentMap, operations)
                }
                else if (shortage > 0 && allocated_qty <= 0) {
                    orderStatus = STATUS.PROCESSING
                    await handleIndent(product, order, shortage, indentMap, operations)
                }
            } else {

                if (canFullyAllocate) {
                    allocated_qty = product.ordered_qty
                    remaining_qty = 0
                    newInventory = Math.max(0, currentInventoryQty - product.ordered_qty)
                } else {
                    allocated_qty = 0
                    remaining_qty = product.ordered_qty
                    newInventory = currentInventoryQty
                    orderStatus = STATUS.PROCESSING
                    await handleIndent(product, order, product.ordered_qty, indentMap, operations)
                }
            }

            currentInventory.set(dbProduct.id, newInventory)

            operations.push(
                 saleOrderRepo.updateSalesOrderProducts(order.id, { allocated_qty, remaining_qty}),
                
                 productRepo.updateProductWithoutAwait({ id: dbProduct.id,  data: { inventory_qty: newInventory } })
            )
        }

        operations.push(
             saleOrderRepo.updateSalesOrderwithoutAwait(order.id, {
                    processed: true,
                    status: orderStatus,
                    processed_date: new Date()
                }),
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
             prisma.salesIndent.update({
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
             prisma.salesIndent.create({
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
