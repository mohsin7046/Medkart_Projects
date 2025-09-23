import { Router } from 'express'
import {
  addProduct,
  getProductSearch,
  updateProduct,
  deleteProduct,
  getProductById
} from '../controllers/products/product.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'

const router = Router()

router.get('/products', getAllOrFiltered);
router.post('/products', addProduct);
router.get('/products/search/:q', getProductSearch)
router.put('/products', updateProduct)
router.delete('/products', deleteProduct)
router.get('/products/:id',getProductById)

export default router

 