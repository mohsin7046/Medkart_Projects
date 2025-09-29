import { createWorker } from './workerManager.js';
import { saleLogger } from '../../utilities/logger.js';
import { SalesOrderRepository } from '../../repository/salesOrder.repository.js';

const salesRepo = new SalesOrderRepository();

createWorker('salesOrderQueue', async (job) => {
  const { module, operation, payload } = job.data;

  if (module !== 'sale-order') {
    saleLogger.warn(`Unknown module: ${module}`);
    return { status: 'error', message: 'Unknown module' };
  }

  try {
    switch (operation) {
      case 'create':
        saleLogger.info(`📦 Creating Sales Order for: ${payload?.name || 'Unknown Customer'}`);

        const newSalesOrder = await salesRepo.createSalesOrder(payload.data);

        return { status: 'success', data: newSalesOrder };

      case 'update':
        saleLogger.info(`✏️ Updating Sales Order: ${payload.data.sales_order_id}`);

        const updatedSalesOrder = await salesRepo.updateSalesOrder(payload.data.sales_order_id, {
          name: payload.data.name,
          email: payload.data.email,
          address: payload.data.address,
          order_type: payload.data.order_type,
          priority: payload.data.priority,
          processed: payload.data.processed,
          total_order_qty: payload.data.total_order_qty,
          total_amount: payload.data.total_amount,
          status: payload.data.status,
          products: payload.data.products,
        });

        return { status: 'success', data: updatedSalesOrder };

      case 'delete':
        saleLogger.info(`🗑️ Deleting Sales Order: ${payload.sales_order_id}`);

        await salesRepo.softDeleteSalesOrderProducts(payload.sales_order_id);

        const deletedSalesOrder = await salesRepo.softDeleteSalesOrder(payload.sales_order_id);

        return { status: 'success', data: deletedSalesOrder };

      default:
        saleLogger.warn(`Unknown operation: ${operation}`);
        return { status: 'error', message: 'Unknown operation' };
    }
  } catch (error) {
    saleLogger.error(`❌ Failed Sales Order operation: ${operation} | Error: ${error.message}`);
    return { status: 'error', message: error.message };
  }
});
