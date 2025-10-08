import { Router } from 'express'
import {
  createPurchaseOrderAgainstPurchaseIndent,
  deletePurchaseOrder,
  // updatePurchaseOrder,
  getPurchaseOrderById
} from '../controllers/purchase_orders/purchase_order.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import {createPurchaseOrderSchema} from '../zodValidation/purchaseOrderValidation/purchaseOrderCreate.zod.js'
import {updatePurchaseOrderSchema} from '../zodValidation/purchaseOrderValidation/purchaseOrderUpdate.zod.js'
import { validate } from '../middleware/zodValidate.js'

const router = Router()

router.post('/purchase-order',validate(createPurchaseOrderSchema), createPurchaseOrderAgainstPurchaseIndent)
router.get('/purchase-order', getAllOrFiltered)
router.get('/purchase-order/:id', getPurchaseOrderById)
router.delete('/purchase-order', deletePurchaseOrder)
// router.put('/purchase-order', validate(updatePurchaseOrderSchema),updatePurchaseOrder)

export default router
