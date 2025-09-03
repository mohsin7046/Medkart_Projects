import { Router } from 'express'
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  deletePurchaseOrder,
  updatePurchaseOrder,

} from '../controllers/purchase_orders/purchase_order.controller.js'

const router = Router()

router.post('/purchase-order', createPurchaseOrder)
router.get('/purchase-order', getAllPurchaseOrders)
router.delete('/purchase-order', deletePurchaseOrder)
router.put('/purchase-order', updatePurchaseOrder)

export default router
