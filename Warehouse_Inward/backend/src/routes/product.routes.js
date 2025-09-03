import { Router } from 'express'
import {
  getAllProducts,
  addProduct,
  getProductSearch,
  updateProduct,
  deleteProduct,
} from '../controllers/products/product.controller.js'

const router = Router()

router.get('/getProducts', getAllProducts)
router.post('/add-product', addProduct)

router.get('/home', (req, res) => {
  console.log("Hiii"); 
  res.send("Hello from /home route 🚀");
});

router.get('/search/:q', getProductSearch)
router.put('/update', updateProduct)
router.delete('/deleteProduct', deleteProduct)

export default router

