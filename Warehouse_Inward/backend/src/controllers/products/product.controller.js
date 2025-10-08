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
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'
   

export const addProduct = catchAsync(async (req, res) => {

  const data = req.body;
    
  const newProduct = await addProductService(data);

  return successResponse(res, newProduct, "Product created successfully", STATUSCODE.OK);
})



export const updateProduct = catchAsync(async (req, res) => {

  const formData = req.body;

  const updatedProduct = await updateProductService(formData);

  return successResponse(res, updatedProduct, "Product updated successfully", STATUSCODE.OK);
})



export const getProductSearch = catchAsync(async (req, res) => {

  const { q } = req.params;

  const products = await searchProductService(q);

  console.log(products);
  

  return successResponse(res, products, "Products fetched successfully", STATUSCODE.OK);
})


export const deleteProduct = catchAsync(async (req, res) => {

  const { product_code } = req.body

  const deletedProduct = await deleteProductService(product_code)

  return successResponse(res, deletedProduct, 'Product delete succesfully', STATUSCODE.OK)
})


export const getProductById = catchAsync(async (req, res) => {

  const { id } = req.params;

  const productByIdData = await getProductByIdService(id);

  return successResponse(res, productByIdData, "Product data fetched successfully by id", STATUSCODE.OK);
})

export const getCategories = catchAsync(async (req, res) => {

  const { search } = req.query;

  const filteredCategoriesAndUOM = await getCategoriesService(search);

  return successResponse(res, filteredCategoriesAndUOM, "Product categories fetched successfully", STATUSCODE.OK);
})

export const getCombinations = catchAsync(async (req, res) => {
  
  const { search } = req.query;
 
  const filteredCombinations = await getCombinationsService(search);

  return successResponse(res,filteredCombinations, "Product combinations fetched successfully", STATUSCODE.OK);
})

