import { createWorker } from './workerManager.js';
import { poLogger } from '../../utilities/logger.js';
import { PurchaseOrderRepository } from '../../repository/purchaseOrder.repository.js';

createWorker('purchaseOrderQueue', async job => {
    const { module, operation, payload } = job.data;
    const PurchaseOrderRepo = new PurchaseOrderRepository();

    if (module !== 'purchaseOrder') {
        poLogger.warn(`Unknown module: ${module}`);
        return { status: 'error', message: 'Unknown module' };
    }

    switch (operation) {
        case 'create':
            poLogger.info(`📦 Creating Purchase Order: ${payload.order_number}`);

            const createdPO = await PurchaseOrderRepo.createPurchaseOrder(payload);

            return { status: 'success', data: createdPO };

        case 'update':
            poLogger.info(`✏️ Updating Purchase Order: ${payload.id}`);

            const updatedPO = await PurchaseOrderRepo.updatePurchaseOrder({ id:payload.id, data:payload,include:{ purchaseOrderItems: true } });

            return { status: 'success', data: updatedPO };

        case 'delete':
            poLogger.info(`🗑️ Deleting Purchase Order: ${payload.order_id}`);
            await PurchaseOrderRepo.deletePurchaseOrderItems(payload.order_id)

            const deletePO = await PurchaseOrderRepo.deletePurchaseOrder(payload.order_id);

            return { status: 'success', data: deletePO };

        default:
            poLogger.warn(`Unknown operation: ${operation}`);
            return { status: 'error', message: 'Unknown operation' };
    }
});
