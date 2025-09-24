import { STATUS,PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { decimalConversion } from '../utilities/decimal.conversion.js'
import { poLogger } from '../utilities/logger.js'
import { purchaseOrderQueue,purchaseOrderQueueEvents } from '../cache/queueManager.js'
import { PurchaseOrderRepository } from '../repository/purchaseOrder.repository.js'

const PurchaseOrderRepo = new PurchaseOrderRepository();
   
export const createPurchaseOrderService = async (data) => {
  try {
    const { vendor_id, order_date, expected_delivery_date, items } = data;

    if (expected_delivery_date <= order_date) {
      poLogger.error("expected_delivery_date must be greater than order_date");
      throw new Error("expected_delivery_date must be greater than order_date");
    }

    items.forEach(item => {
      if (item.item_mrp < item.item_price) {
        poLogger.error(`MRP cannot be less than price for product ${item.product_id}`);
        throw new Error(`MRP cannot be less than price for product `);
      }
    });

    const order_number = generateRandom(PREFIX.ORDER);

    const itemsWithTotal = items.map((item) => ({
      ...item,
      totalAmount: decimalConversion(item.quantity * item.item_price),
    }));

    const total_amount = decimalConversion(
      itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0)
    );

    const module = 'purchaseOrder';
    const operation = 'create';
    const changeddata =  {
        vendor_id,
        order_date: new Date(order_date),
        order_number,
        expected_delivery_date: new Date(expected_delivery_date),
        total_amount,
        status: STATUS.PENDING,
        purchaseOrderItems: {
          create: items.map((item, idx) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            item_price: item.item_price,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount,
          })),
        },
      }
      
    const job = await purchaseOrderQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: changeddata,
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const createdPO = await job.waitUntilFinished(purchaseOrderQueueEvents);

    if (!createdPO || createdPO.status !== 'success') {
      poLogger.error("❌ Error while creating purchase Order");
      throw new Error("Purchase Order not created");
    }

    poLogger.info(`✅ Purchase Order created | Order Number: ${order_number}`);
    return createdPO;
  } catch (error) {
    poLogger.error(`❌ Failed to create Purchase Order | Error: ${error.message}`);
    throw error;
  }
}


export const updatePurchaseOrderService = async (formData) => {
  try {

    if (formData.expected_delivery_date <= formData.order_date) {
      poLogger.error("expected_delivery_date must be greater than order_date");
      throw new Error("expected_delivery_date must be greater than order_date");
    }

    formData.items.forEach(item => {
      if (item.item_mrp < item.item_price) {
        poLogger.error(`MRP cannot be less than price for product ${item.product_id}`);
        throw new Error(`MRP cannot be less than price for product `);
      }
    });

    const itemsWithTotal = formData.items.map(item => ({
      ...item,
      totalAmount: decimalConversion(item.quantity * item.item_price),
    }));

    const total_amount = decimalConversion(
      itemsWithTotal.reduce((sum, item) => sum + item.totalAmount, 0)
    );

     const module = 'purchaseOrder';
    const operation = 'update';
    const data =  {
       id: formData.order_id,
       order_date: new Date(formData.order_date),
        expected_delivery_date: new Date(formData.expected_delivery_date),
        total_amount,
        purchaseOrderItems: {
          deleteMany: { order_id: formData.order_id },
          create: formData.items.map((item, idx) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            item_price: item.item_price,
            item_mrp: item.item_mrp,
            totalAmount: itemsWithTotal[idx].totalAmount,
          })),
        },
      }

    const job = await purchaseOrderQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: data,
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const updatedPO = await job.waitUntilFinished(purchaseOrderQueueEvents);

    if (!updatedPO || updatedPO.status !== 'success') {
      poLogger.error("❌ Error while updating purchase Order");
      throw new Error("Purchase Order not updated");
    }
  
    poLogger.info(`✅ Purchase Order updated | ID: ${formData.order_id}`);
    return updatedPO;
  } catch (error) {
    poLogger.error(`❌ Failed to update Purchase Order | ID: ${formData.order_id} | Error: ${error.message}`);
    throw error;
  }
}



export const deletePurchaseOrderService = async (order_id) => {
  try {
    console.log(order_id);
    
    const existingPO = await PurchaseOrderRepo.findPOByOrderId({id:order_id});

    if (existingPO && (existingPO.status === STATUS.COMPLETED || existingPO.status === STATUS.CANCELLED)) {
      throw new Error('Cannot delete completed or cancelled Purchase Order');
    }

    const module = 'purchaseOrder';
    const operation = 'delete';

     const job = await purchaseOrderQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {order_id},
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const deletePO = await job.waitUntilFinished(purchaseOrderQueueEvents);

    if (!deletePO || deletePO.status !== 'success') {
      poLogger.error(`❌ Error while deleting purchase Order  ${order_id}`);
      throw new Error("Purchase Order not deleted");
    }

    poLogger.info(`✅ Purchase Order deleted | ID: ${order_id}`);
    return deletePO;
  } catch (error) {
    poLogger.error(`❌ Failed to delete Purchase Order | ID: ${order_id} | Error: ${error.message}`);
    throw error;
  }
}


export const getPurchaseOrderByIdService = async (id) => {
  try {

    const poData = await PurchaseOrderRepo.getPurchaseOrderById(id)

    if (!poData) {
      throw new Error(`Purchase Order not found for ID: ${id}`);
    }

    poLogger.info(`✅ Purchase Order fetched | ID: ${id}`);

    return poData;
  } catch (error) {
    poLogger.error(`❌ Failed to fetch Purchase Order | ID: ${id} | Error: ${error.message}`);
    throw error;
  }
}