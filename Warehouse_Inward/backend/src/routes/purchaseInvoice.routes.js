import { Router } from 'express'
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  deletePurchaseInvoice
} from '../controllers/purchase_invoice/purchaseInvoice.controller.js'

import { Validate } from '../middleware/zodValidation/validate.zod.js'
import { createPurchaseInvoiceSchema } from '../middleware/zodValidation/PurchaseInvoiceValidation/purchaseInvoiceCreate.zod.js'

const router = Router()

router.post('/createPI',createPurchaseInvoice)
router.get('/get-pi?page&limit&orderBy', getAllPurchaseInvoices)
router.delete('/delete-pi', deletePurchaseInvoice);

export default router
