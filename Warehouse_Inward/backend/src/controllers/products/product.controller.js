import {
  addProductService,
  getAllProductsService,
  searchProductService,
  updateProductService,
  deleteProductService,
} from '../../services/product.service.js'
import { successResponse, errorResponse } from '../../utilities/response.js'
import { createProductSchema } from '../../zodValidation/productValidation/productCreate.zod.js'
import { updateProductSchema } from '../../zodValidation/productValidation/productUpdate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
 

export const addProduct = catchAsync(async (req, res) => {

  console.log(req.body);
  
  const data = createProductSchema.parse(req.body);


  if (!data) {
    console.log(data.error);
      
    return errorResponse(res, 'All feilds are required', 400)
  }

  const newProduct = await addProductService(data);

  if (!newProduct) {
    return errorResponse(res, 'Product not created', 400);
  }
  return successResponse(res, newProduct, 'Product created Successfully', 200)
})



export const getAllProducts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const sortby = req.query.sortby;
  const products = await getAllProductsService(page, limit, sortby)
  if (!products) {
    return errorResponse(res, 'Product not fetched!!', 400)
  }
  return successResponse(res, products, 'Product fetch succesfully', 200)
})


export const getProductSearch = catchAsync(async (req, res) => {
  const { q } = req.params

  const products = await searchProductService(q)
  if (!products) {
    return errorResponse(res, 'Product not fetched for the query!!', 400)
  }
  return successResponse(
    res,
    products,
    'Product fetch succesfully for query',
    200
  )
})

export const updateProduct = catchAsync(async (req, res) => {
  console.log(req.body);
  
  const formData = updateProductSchema.parse(req.body);

  if (!formData) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  console.log(formData);
  

  const updatedProduct = await updateProductService(formData)
  if (!updatedProduct) {
    return errorResponse(res, 'Product not updated!!', 400)
  }
  return successResponse(res, updatedProduct, 'Product update succesfully', 200)
})

export const deleteProduct = catchAsync(async (req, res) => {
  const { product_code } = req.body

  const deletedProduct = await deleteProductService(product_code)

  if (!deletedProduct) {
    return errorResponse(res, 'Product not deleted!!', 400)
  }
  return successResponse(res, deletedProduct, 'Product delete succesfully', 200)
})
 

