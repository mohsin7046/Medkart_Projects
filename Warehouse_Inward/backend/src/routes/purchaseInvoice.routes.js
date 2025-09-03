import { Router } from 'express'
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  deletePurchaseInvoice,

} from '../controllers/purchase_invoice/purchaseInvoice.controller.js'


const router = Router()

router.post('/purchase-invoice', createPurchaseInvoice)
router.get('/purchase-invoice', getAllPurchaseInvoices)
router.delete('/purchase-invoice', deletePurchaseInvoice)


export default router
