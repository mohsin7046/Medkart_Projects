import { createWorker } from './workerManager.js';
import { indentLogger, saleLogger } from '../../utilities/logger.js';
import { SalesIndentRepository } from '../../repository/salesIndent.repository.js';

const indentRepo = new SalesIndentRepository();

createWorker('salesIndentQueue', async (job) => {
  const { module, operation, payload } = job.data;

  console.log("FRom the queue",payload.data);
  
  if (module !== 'sale-indent') {
    indentLogger.warn(`Unknown module: ${module}`);
    return { status: 'error', message: 'Unknown module' };
  }

  try {
    switch (operation) {
      case 'create':
        indentLogger.info(`📦 Creating Sales Indent for product: ${payload?.data.product_id || 'Unknown'}`);

        const newIndent = await indentRepo.createIndent(payload.data);

        return { status: 'success', data: newIndent };

      case 'update':
        indentLogger.info(`✏️ Updating Sales Indent ID: ${payload.data.id}`);

        const updatedIndent = await indentRepo.updateIndent(payload.data.id, payload.data);

        return { status: 'success', data: updatedIndent };

      case 'delete':
        indentLogger.info(`🗑️ Deleting Sales Indent ID: ${payload.id}`);

        const deletedIndent = await indentRepo.updateIndent(payload.id, { status: 'deleted' });
        
        return { status: 'success', data: deletedIndent };

      default:
        indentLogger.warn(`Unknown operation: ${operation}`);
        return { status: 'error', message: 'Unknown operation' };
    }
  } catch (error) {
    indentLogger.error(`❌ Failed Sales Indent operation: ${operation} | Error: ${error.message}`);
    return { status: 'error', message: error.message };
  }
});
