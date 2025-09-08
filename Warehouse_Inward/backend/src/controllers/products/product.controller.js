import {
  addProductService,
  searchProductService,
  updateProductService,
  deleteProductService,
  getProductByIdService
} from '../../services/product.service.js'
import { successResponse } from '../../utilities/response.js'
import { createProductSchema } from '../../zodValidation/productValidation/productCreate.zod.js'
import { updateProductSchema } from '../../zodValidation/productValidation/productUpdate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'


export const addProduct = catchAsync(async (req, res) => {
  req.component = "product";
const data = createProductSchema.parse(req.body);

  const newProduct = await addProductService(data);

  return successResponse(res, newProduct, "Product created successfully", STATUSCODE.OK);
})



export const updateProduct = catchAsync(async (req, res) => {
  req.component = "product";
  const formData = updateProductSchema.parse(req.body);

  const updatedProduct = await updateProductService(formData);

  return successResponse(res, updatedProduct, "Product updated successfully", STATUSCODE.OK);
})



export const getProductSearch = catchAsync(async (req, res) => {
  req.component = "product";
  const { q } = req.params;

  const products = await searchProductService(q);

  return successResponse(res, products, "Products fetched successfully", STATUSCODE.OK);
})


export const deleteProduct = catchAsync(async (req, res) => {
    req.component = "product";
  const { product_code } = req.body

  const deletedProduct = await deleteProductService(product_code)

  return successResponse(res, deletedProduct, 'Product delete succesfully', STATUSCODE.OK)
})


export const getProductById = catchAsync(async (req, res) => {
    req.component = "product";
const { id } = req.params;

  const productByIdData = await getProductByIdService(id);

  return successResponse(res, productByIdData, "Product data fetched successfully by id", STATUSCODE.OK);
})


