import {
  addProductService,
  searchProductService,
  updateProductService,
  deleteProductService,
  getProductByIdService,
  getCombinationsService,
  getCategoriesService
} from '../../services/product.service.js'
import { successResponse } from '../../utilities/response.js'
import { createProductSchema } from '../../zodValidation/productValidation/productCreate.zod.js'
import { updateProductSchema } from '../../zodValidation/productValidation/productUpdate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE,ENTITY } from '../../utilities/constant.js'


export const addProduct = catchAsync(async (req, res) => {
req.component = ENTITY.product;
const data = createProductSchema.parse(req.body);

  const newProduct = await addProductService(data);

  return successResponse(res, newProduct, "Product created successfully", STATUSCODE.OK);
})



export const updateProduct = catchAsync(async (req, res) => {
  req.component =  ENTITY.product;
  const formData = updateProductSchema.parse(req.body);

  const updatedProduct = await updateProductService(formData);

  return successResponse(res, updatedProduct, "Product updated successfully", STATUSCODE.OK);
})



export const getProductSearch = catchAsync(async (req, res) => {
  req.component =  ENTITY.product;
  const { q } = req.params;

  const products = await searchProductService(q);

  return successResponse(res, products, "Products fetched successfully", STATUSCODE.OK);
})


export const deleteProduct = catchAsync(async (req, res) => {
    req.component =  ENTITY.product;
  const { product_code } = req.body

  const deletedProduct = await deleteProductService(product_code)

  return successResponse(res, deletedProduct, 'Product delete succesfully', STATUSCODE.OK)
})


export const getProductById = catchAsync(async (req, res) => {
    req.component =  ENTITY.product;
    const { id } = req.params;

  const productByIdData = await getProductByIdService(id);

  return successResponse(res, productByIdData, "Product data fetched successfully by id", STATUSCODE.OK);
})

export const getCategories = catchAsync(async (req, res) => {
    req.component =  ENTITY.product;
    const { search } = req.query;
    const filteredCategoriesAndUOM = await getCategoriesService(search);
  return successResponse(res, filteredCategoriesAndUOM, "Product categories fetched successfully", STATUSCODE.OK);
})

export const getCombinations = catchAsync(async (req, res) => {
    req.component =  ENTITY.product;
    const { search } = req.query;
    console.log("FRom combinations",search);
    
  const filteredCombinations = await getCombinationsService(search);
  return successResponse(res,filteredCombinations, "Product combinations fetched successfully", STATUSCODE.OK);
})

