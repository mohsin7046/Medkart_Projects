import {Router} from 'express';
import { createPurchaseInvoice ,getAllPurchaseInvoices,deletePurchaseInvoice} from '../controllers/purchase_invoice/purchaseInvoice.controller.js';

const router = Router();

router.post('/createPI',createPurchaseInvoice)
router.get('/get-pi',getAllPurchaseInvoices);
router.delete('/delete-pi',deletePurchaseInvoice);

export default router;