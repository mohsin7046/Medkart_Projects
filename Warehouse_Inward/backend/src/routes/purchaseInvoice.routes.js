import { Router } from 'express'
import {
  createPurchaseInvoice,
  deletePurchaseInvoice,

} from '../controllers/purchase_invoice/purchaseInvoice.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'


const router = Router()

router.post('/purchase-invoice', createPurchaseInvoice)
router.get('/purchase-invoice', getAllOrFiltered)
router.delete('/purchase-invoice', deletePurchaseInvoice)


export default router
