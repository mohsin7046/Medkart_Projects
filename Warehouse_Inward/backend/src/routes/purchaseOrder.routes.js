import { Router } from 'express'
import {
  createPurchaseOrderAgainstPurchaseIndent,
  deletePurchaseOrder,
  // updatePurchaseOrder,
  getPurchaseOrderById
} from '../controllers/purchase_orders/purchase_order.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.post('/purchase-order', createPurchaseOrderAgainstPurchaseIndent)
router.get('/purchase-order', getAllOrFiltered)
router.get('/purchase-order/:id', getPurchaseOrderById)
router.delete('/purchase-order', deletePurchaseOrder)
// router.put('/purchase-order', updatePurchaseOrder)

export default router
