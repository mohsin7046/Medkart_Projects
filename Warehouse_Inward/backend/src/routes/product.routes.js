import { Router } from 'express'
import {
  getAllProducts,
  addProduct,
  getProductSearch,
  updateProduct,
  deleteProduct,
  searchFilterProduct
} from '../controllers/products/product.controller.js'

const router = Router()

router.get('/getProducts?page&limit&orderBy', getAllProducts)
router.get('/searchfilter?search&page&limit', searchFilterProduct)
router.post('/add-product',addProduct)
router.get('/search/:q', getProductSearch)
router.put('/update',updateProduct)
router.delete('/deleteProduct', deleteProduct)

export default router
