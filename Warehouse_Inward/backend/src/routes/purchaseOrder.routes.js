import { Router } from 'express'
import {
  createPurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrder,

} from '../controllers/purchase_orders/purchase_order.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.post('/purchase-order', createPurchaseOrder)
router.get('/purchase-order', getAllOrFiltered)
router.delete('/purchase-order', deletePurchaseOrder)
router.put('/purchase-order', updatePurchaseOrder)

export default router
