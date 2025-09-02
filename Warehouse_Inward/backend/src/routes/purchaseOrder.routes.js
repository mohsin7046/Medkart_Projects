import { Router } from 'express'
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  deletePurchaseOrder,
  updatePurchaseOrder,
  searchFilterPurchaseOrder
} from '../controllers/purchase_orders/purchase_order.controller.js'


const router = Router()

router.post('/add-purchase-order',createPurchaseOrder)
router.get('/getAllPurchaseOrders?page&limit&orderBy', getAllPurchaseOrders)
router.get('/searchfilter?search&page&limit', searchFilterPurchaseOrder)
router.delete('/deletePurchaseOrder', deletePurchaseOrder)
router.put('/updatePurchaseOrder',updatePurchaseOrder)

export default router
