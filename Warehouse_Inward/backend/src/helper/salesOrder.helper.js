import { STATUS,PREFIX } from '../utilities/constant.js';
import { generateRandom } from '../utilities/generateRandom.js'
import { prisma } from '../utilities/import.config.js'

export const sortOrdersByPriority = (orders) => {
    return orders.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (a.priority !== 'high' && b.priority === 'high') return 1
        return 0
    })
}


export const extractProductIds = (orders) => {
    return [...new Set(orders.flatMap(o => o.products.map(p => p.product_id)))]
}


export const buildInventoryMap = (products) => {
    const inventoryMap = new Map()
    products.forEach(product => {
        inventoryMap.set(product.id, product.inventory_qty)
    })
    return inventoryMap
}


export const buildIndentMap = (indents) => {
    return new Map(indents.map(i => [i.product_id, i]))
}


export const calculateB2BAllocation = (currentInventoryQty, remainingQty) => {
    const allocated_qty = Math.max(0, Math.min(currentInventoryQty, remainingQty))
    const shortage = remainingQty - currentInventoryQty
    const remaining_qty = Math.max(0, shortage)
    const newInventory = Math.max(0, currentInventoryQty - allocated_qty)
    
    return { allocated_qty, remaining_qty, newInventory, shortage }
}


export const calculateB2CAllocation = (currentInventoryQty, orderedQty) => {
    const shortage = orderedQty - currentInventoryQty
    const canFullyAllocate = shortage <= 0
    
    if (canFullyAllocate) {
        return {
            allocated_qty: orderedQty,
            remaining_qty: 0,
            newInventory: Math.max(0, currentInventoryQty - orderedQty),
            canFullyAllocate
        }
    } else {
        return {
            allocated_qty: 0,
            remaining_qty: orderedQty,
            newInventory: currentInventoryQty,
            canFullyAllocate
        }
    }
}


export const determineB2BOrderStatus = (shortage, allocatedQty) => {
    if (shortage > 0 && allocatedQty > 0) {
        return STATUS.PARTIAL_RECEVIED
    } else if (shortage > 0 && allocatedQty <= 0) {
        return STATUS.PROCESSING
    }
    return STATUS.ALLOCATED
}


export const processB2BProduct = async (product, order, currentInventoryQty, indentMap, operations) => {
    console.log(currentInventoryQty)
    
    const { allocated_qty, remaining_qty, newInventory, shortage } = 
        calculateB2BAllocation(currentInventoryQty, product.remaining_qty)
    
    console.log(allocated_qty + " " + remaining_qty)
    
    let orderStatus = determineB2BOrderStatus(shortage, allocated_qty)
    
    if (shortage > 0 && !order.processed) {
        const indentResult = await handleIndent(product, order, shortage, indentMap, operations)
        console.log("Indent Result", indentResult)
        
        if (indentResult?.indent && !indentMap.get(product.product.id)) {
            indentMap.set(product.product.id, indentResult?.indent)
        }
    }
    
    return { allocated_qty, remaining_qty, newInventory, orderStatus }
}


export const processB2CProduct = async (product, order, currentInventoryQty, indentMap, operations) => {
    const { allocated_qty, remaining_qty, newInventory, canFullyAllocate } = 
        calculateB2CAllocation(currentInventoryQty, product.ordered_qty)
    
    let orderStatus = STATUS.ALLOCATED
    
    if (!canFullyAllocate) {
        orderStatus = STATUS.PROCESSING
        
        if (!order.processed) {
            const indentResult = await handleIndent(product, order, product.ordered_qty, indentMap, operations)
            console.log("Indent Result", indentResult)
            
            if (indentResult?.indent && !indentMap.get(product.product.id)) {
                indentMap.set(product.product.id, indentResult?.indent)
            }
        }
    }
    
    return { allocated_qty, remaining_qty, newInventory, orderStatus }
}


export const addSalesProductUpdateOperations = (operations, orderId, productId, allocatedQty, remainingQty,saleOrderRepo) => {
    operations.push(
        saleOrderRepo.updateSalesOrderProducts(orderId, productId, { 
            allocated_qty: allocatedQty, 
            remaining_qty: remainingQty 
        })
    )
}


export const addOrderCompletionOperations = (operations, orderId, orderStatus,saleOrderRepo) => {
    operations.push(
        saleOrderRepo.updateSalesOrderwithoutAwait(orderId, {
            processed: true,
            status: orderStatus,
            processed_date: new Date()
        })
    )
}



export const createIndentUpdateData = (existingIndent, orderId, quantity) => {
    return {
        total_sales_order: existingIndent.total_sales_order + 1,
        salesOrders: [
            ...(existingIndent.salesOrders || []),
            { sales_order_id: orderId }
        ],
        total_remain_product: existingIndent.total_remain_product + quantity
    }
}

export const createNewIndentData = (indentNumber, productId, quantity, orderId) => {
    return {
        indent_number: indentNumber,
        product_id: productId,
        total_sales_order: 1,
        total_remain_product: quantity,
        status: STATUS.OPEN,
        salesOrders: [{ sales_order_id: orderId }]
    }
}

export const addIndentUpdateOperation = (operations, existingIndent, updatedIndent, orderId) => {
    operations.push(
        prisma.salesIndent.update({
            where: { indent_number: existingIndent.indent_number },
            data: {
                total_sales_order: updatedIndent.total_sales_order,
                total_remain_product: updatedIndent.total_remain_product,
                salesOrders: {
                    create: {
                        sales_order_id: orderId
                    }
                }
            }
        })
    )
}


export const addIndentCreationOperation = (operations, indentNumber, productId, quantity, orderId) => {
    operations.push(
        prisma.salesIndent.create({
            data: {
                indent_number: indentNumber,
                product_id: productId,
                total_sales_order: 1,
                total_remain_product: quantity,
                status: STATUS.OPEN,
                salesOrders: {
                    create: {
                        sales_order_id: orderId
                    }
                }
            }
        })
    )
}


export const handleIndent = async (product, order, quantity, indentMap, operations) => {
    const existingIndent = indentMap.get(product.product_id)
    console.log("existingIndent in handleIdent", existingIndent)

    console.log("OrderId and productId in handle", order.id, product.product_id)

    let indent = null
    let isNew = false

    if (existingIndent) {
        const updatedIndent = createIndentUpdateData(existingIndent, order.id, quantity)
        indent = updatedIndent
        addIndentUpdateOperation(operations, existingIndent, updatedIndent, order.id)
    } else if (!existingIndent) {
        const indentNumber = generateRandom(PREFIX.INDENT)
        const createdData = createNewIndentData(indentNumber, product.product_id, quantity, order.id)
        indent = createdData
        isNew = true
        addIndentCreationOperation(operations, indentNumber, product.product_id, quantity, order.id)
    }

    return { indent, isNew }
}