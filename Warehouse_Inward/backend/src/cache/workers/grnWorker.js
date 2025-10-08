import { createWorker } from './workerManager.js';
import { grnLogger } from '../../utilities/logger.js';
import { GRNRepository } from '../../repository/grn.repository.js';

const grnRepo = new GRNRepository();

createWorker('grnQueue', async (job) => {
    const { module, operation, payload } = job.data;
   
    if (module !== 'grn') {
        grnLogger.warn(`Unknown module: ${module}`);
        return { status: 'error', message: 'Unknown module' };
    }

    try {
        switch (operation) {
            case 'create':
                grnLogger.info(`📦 Creating GRN for `);
          
                const newGRN = await grnRepo.createGRN(payload.data);
            
                return { status: 'success', data: newGRN };

            case 'update':  
                grnLogger.info(`✏️ Updating GRN: ${payload.data.grn_id}`);

                const updatedGRN = await grnRepo.updateGRN(payload.data.grn_id, payload.data);

                return { status: 'success', data: updatedGRN };

            case 'delete':
                grnLogger.info(`🗑️ Deleting GRN: ${payload.grn_id}`);

                const deletedGRNItems =await grnRepo.deleteGRNItems(payload.grn_id);

                const deletedGRN = await grnRepo.deleteGRN(payload.grn_id);
                
                return { status: 'success', data: deletedGRN };

            default:
                grnLogger.warn(`Unknown operation: ${operation}`);
                return { status: 'error', message: 'Unknown operation' };
        }
    } catch (error) {
        grnLogger.error(`❌ Failed GRN operation: ${operation} | Error: ${error.message}`);
        throw error;
    }
});
