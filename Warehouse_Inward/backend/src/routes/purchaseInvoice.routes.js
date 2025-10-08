import { Router } from 'express'
import {
  createPurchaseInvoice,
  deletePurchaseInvoice,
  getInvoiceById
} from '../controllers/purchase_invoice/purchaseInvoice.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';


const router = Router()

router.use(setEntity(ENTITY.pi));

router.post('/purchase-invoice', createPurchaseInvoice)
router.get('/purchase-invoice', getAllOrFiltered)
router.get('/purchase-invoice/:id', getInvoiceById)
router.delete('/purchase-invoice', deletePurchaseInvoice)


export default router
