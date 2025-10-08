import { Router } from 'express'
import {
  addProduct,
  getProductSearch,
  updateProduct,
  deleteProduct,
  getProductById,
  getCategories,
  getCombinations
} from '../controllers/products/product.controller.js'
import {getAllOrFiltered} from '../controllers/common/getAllSearchFilter.controller.js'
import { validate } from '../middleware/zodValidate.js'
import { createProductSchema } from '../zodValidation/productValidation/productCreate.zod.js'
import { updateProductSchema } from '../zodValidation/productValidation/productUpdate.zod.js'
import { setEntity } from '../middleware/setEntity.middleware.js';
import { ENTITY } from '../utilities/constant.js';

const router = Router()

router.use(setEntity(ENTITY.product));

router.get('/products', getAllOrFiltered);
router.post('/products',validate(createProductSchema), addProduct);
router.get('/products/categories',getCategories);
router.get('/products/combinations',getCombinations);
router.put('/products',validate(updateProductSchema), updateProduct);
router.delete('/products', deleteProduct);
router.get('/products/search/:q', getProductSearch);
router.get('/products/:id',getProductById);


export default router

 