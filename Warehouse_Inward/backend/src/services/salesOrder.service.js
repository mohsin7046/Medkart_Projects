import { prisma } from '../utilities/import.config.js'
import { STATUS, PRIORITY, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { saleLogger } from '../utilities/logger.js'
import { salesOrderQueue, salesOrderQueueEvents } from '../cache/queueManager.js'
import { SalesOrderRepository } from '../repository/salesOrder.repository.js'
import { ProductRepository } from '../repository/product.repository.js'
import { SalesIndentRepository } from '../repository/salesIndent.repository.js'
import { processB2CProduct,processB2BProduct, sortOrdersByPriority, extractProductIds, buildInventoryMap, buildIndentMap,  addOrderCompletionOperations, addSalesProductUpdateOperations } from '../helper/salesOrder.helper.js'
import {executeConfirmationTransaction, fetchAndValidateSalesOrder, throwInsufficientInventoryError, validateAndPrepareInventory} from '../helper/salesOrderCofirm.helper.js'
const saleOrderRepo = new SalesOrderRepository();
const productRepo = new ProductRepository();
const indentRepo = new SalesIndentRepository();


export const createSaleOrderService = async (data) => {
    try {
        const sales_order_number = generateRandom(PREFIX.SALE);

        const product_ptr = await productRepo.getProducts({ ids: data.items.map(i => i.product_id) });

        const itemsWithTotal = data.items.map((item) => ({
            product_id: item.product_id,
            ordered_qty: item.ordered_qty,
            allocated_qty: 0,
            remaining_qty: item.ordered_qty,
            total_amount: decimalConversion(item.ordered_qty * (product_ptr.find(p => p.id === item.product_id)?.product_ptr || 0))
        }))

        const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.total_amount, 0));

        const total_order_qty = data.items.reduce((sum, item) => sum + item.ordered_qty, 0);

        const priority = data.order_type === "B2B" ? PRIORITY.HIGH : PRIORITY.NORMAL;

        const changeddata = {
            sales_order_number,
            name: data.name,
            email: data.email,
            contact_number: data.contact_number,
            address: data?.address || null,
            order_type: data.order_type,
            priority,
            processed: false,
            total_order_qty,
            total_amount,
            delivery_status: STATUS.NOT_DISPATCHED,
            payment_status: STATUS.UNPAID,
            status: STATUS.PENDING,
            products: {
                create: data.items.map((item, idx) => ({
                    product_id: item.product_id,
                    ordered_qty: item.ordered_qty,
                    allocated_qty: 0,
                    remaining_qty: item.ordered_qty,
                    total_amount: itemsWithTotal[idx].total_amount,
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
            saleLogger.error("❌ Error while creating sales Order");
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
        const product_ptr = await productRepo.getProducts({ ids: data.items.map(i => i.product_id) });

        console.log(data.items);

        const itemsWithTotal = await Promise.all(
            data.items.map(async (item) => {
                const price = product_ptr.find(p => p.id === item.product_id)?.product_ptr || 0;
                return {
                    product_id: item.product_id,
                    ordered_qty: item.ordered_qty,
                    allocated_qty: 0,
                    remaining_qty: item.ordered_qty,
                    total_amount: decimalConversion(item.ordered_qty * price),
                };
            })
        );

        const total_amount = decimalConversion(itemsWithTotal.reduce((sum, item) => sum + item.total_amount, 0));

        const total_order_qty = data.items.reduce((sum, item) => sum + item.ordered_qty, 0);

        const priority = data.order_type === "B2B" ? PRIORITY.HIGH : PRIORITY.NORMAL;


        const changeddata = {
            sales_order_id: data.sales_order_id,
            name: data.name,
            email: data.email,
            address: data?.address || null,
            order_type: data.order_type,
            priority,
            processed: false,
            total_order_qty,
            total_amount,
            status: STATUS.PENDING,
            products: {
                deleteMany: { sales_order_id: data.sales_order_id },
                create: data.items.map((item, idx) => ({
                    product_id: item.product_id,
                    ordered_qty: item.ordered_qty,
                    allocated_qty: 0,
                    remaining_qty: item.ordered_qty,
                    total_amount: itemsWithTotal[idx].total_amount,
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
        const existingSalesOrder = await saleOrderRepo.existingSalesOrder(sales_order_id)

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
                ordered_qty: p.ordered_qty,
                product_name: p.product?.name || "",
                product_mrp: p.product?.product_mrp || 0,
                product_ptr: p.product?.product_ptr || 0
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

    let salesOrders = await saleOrderRepo.findProductsInSalesOrders(orderIds)

    if (!salesOrders.length) throw new Error('Sales order(s) not found')

    salesOrders = sortOrdersByPriority(salesOrders)

    const productIds = extractProductIds(salesOrders)
    const allProducts = await productRepo.getProducts({ ids: productIds })
    const currentInventory = buildInventoryMap(allProducts)

    const existingIndents = await indentRepo.existingIndentsByProductIds(productIds)
    console.log("existingIndent at start", existingIndents)

    const indentMap = buildIndentMap(existingIndents)
    const operations = []

    for (const order of salesOrders) {
        let orderStatus = STATUS.ALLOCATED
        const isB2B = order.order_type === 'B2B'

        for (const product of order.products) {
            const { product: dbProduct } = product

            if (!dbProduct) throw new Error(`Product ${product.product_id} not found`)

            const currentInventoryQty = currentInventory.get(dbProduct.id)
            
            let allocated_qty, remaining_qty, newInventory

            if (isB2B) {
                const result = await processB2BProduct(product, order, currentInventoryQty, indentMap, operations)
                allocated_qty = result.allocated_qty
                remaining_qty = result.remaining_qty
                newInventory = result.newInventory
                orderStatus = result.orderStatus
            } else {
                const result = await processB2CProduct(product, order, currentInventoryQty, indentMap, operations)
                allocated_qty = result.allocated_qty
                remaining_qty = result.remaining_qty
                newInventory = result.newInventory
                orderStatus = result.orderStatus
            }

            currentInventory.set(dbProduct.id, newInventory)
            addSalesProductUpdateOperations(operations, order.id, dbProduct.id, allocated_qty, remaining_qty,saleOrderRepo)
        }

        addOrderCompletionOperations(operations, order.id, orderStatus,saleOrderRepo)
    }

    await prisma.$transaction(operations)

    return { message: 'Sales order(s) processed successfully' }
}


export const confirmSalesOrderService = async (sales_order_id) => {
    
  const salesOrderData = await fetchAndValidateSalesOrder(sales_order_id)

  const { inventoryChecks, insufficientProducts } = validateAndPrepareInventory(salesOrderData.products)

  if (insufficientProducts.length > 0) {
    throwInsufficientInventoryError(salesOrderData.sales_order_number, insufficientProducts)
  }

  return await executeConfirmationTransaction(sales_order_id, inventoryChecks)
}