import { Router } from 'express'
import {
  getAllProducts,
  addProduct,
  getProductSearch,
  updateProduct,
  deleteProduct,
} from '../controllers/products/product.controller.js'

const router = Router()

router.get('/products', getAllProducts)
router.post('/products', addProduct);
router.get('/products/:q', getProductSearch)
router.put('/products', updateProduct)
router.delete('/products', deleteProduct)

export default router

