import { createWorker } from './workerManager.js';
import { piLogger } from '../../utilities/logger.js';
import { PurchaseInvoiceRepository } from '../../repository/purchaseInvoice.repository.js';

const invoiceRepo = new PurchaseInvoiceRepository();

createWorker('purchaseInvoiceQueue', async (job) => {
  const { module, operation, payload } = job.data;

  if (module !== 'invoice') {
    piLogger.warn(`Unknown module: ${module}`);
    return { status: 'error', message: 'Unknown module' };
  }

  console.log("FRom queue",payload.data);
  
  try {
    switch (operation) {
      case 'create':
        piLogger.info(`📦 Creating Purchase Invoice for GRN: ${payload.data.grn_id}`);

        const invoice = await invoiceRepo.createInvoice(payload.data);

        console.log(invoice);
        
        return { status: 'success', data: invoice };

      case 'delete':
        piLogger.info(`🗑️ Deleting Purchase Invoice: ${payload.invoice_id}`);

        await invoiceRepo.deleteInvoiceItems(payload.invoice_id);

        const deletedInvoice = await invoiceRepo.deleteInvoice(payload.invoice_id);
        
        return { status: 'success', data: deletedInvoice };

      default:
        piLogger.warn(`Unknown operation: ${operation}`);
        return { status: 'error', message: 'Unknown operation' };
    }
  } catch (error) {
    piLogger.error(`❌ Failed invoice operation: ${operation} | Error: ${error.message}`);
    return { status: 'error', message: error.message };
  }
});
  