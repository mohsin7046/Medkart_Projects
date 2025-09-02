
import { addProductService, getAllProductsService, searchProductService, updateProductService, deleteProductService, searchFilterProductService } from '../../services/product.service.js';
import { FEILD } from '../../utilities/constant.js';
import { successResponse, errorResponse } from '../../utilities/response.js';
import { Validate } from '../../zodValidation/validate.zod.js';
import { createProductSchema } from '../../zodValidation/productValidation/productCreate.zod.js';
import { updateProductSchema } from '../../zodValidation/productValidation/productUpdate.zod.js';


export const addProduct = async (req, res) => {
  const data = Validate(createProductSchema);

  if(!data){
    return errorResponse(res, "All feilds are required", 400)
  }

  try {
    const newProduct = await addProductService(data)
    if (!newProduct) {
      return errorResponse(res, "Product not created", 400);
    }
    return successResponse(res, newProduct, "Product created Successfully", 200)
  } catch (error) {
    console.error("Error creating product:", error);
    return errorResponse(res, "Failed to create product", 500)
  }
};


export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const orderBy = req.query.orderBy;
    const products = await getAllProductsService(page, limit, orderBy);
    if (!products) {
      return errorResponse(res, "Product not fetched!!", 400)
    }
    return successResponse(res, products, "Product fetch succesfully", 200)
  } catch (error) {
    console.error('Error fetching products:', error)
    return errorResponse(res, 'Failed to fetch products', 500)
  }
}


export const getProductSearch = async (req, res) => {
  try {
    const { q } = req.params

    const products = await searchProductService(q);
    if (!products) {
      return errorResponse(res, "Product not fetched for the query!!", 400)
    }
    return successResponse(res, products, "Product fetch succesfully for query", 200)
  } catch (err) {
    console.error('Products search error:', err)
    return errorResponse(res, 'Failed to fetch products for query', 500)
  }
}


export const updateProduct = async (req, res) => {
  const formData = Validate(updateProductSchema);
  if(!formData){
    return errorResponse(res, "All feilds are required", 400)
  }

  try {
    const updatedProduct = await updateProductService(formData);
    if (!updatedProduct) {
      return errorResponse(res, "Product not updated!!", 400)
    }
    return successResponse(res, updatedProduct, "Product update succesfully", 200)
  } catch (error) {
    console.error('Error updating product:', error)
    return errorResponse(res, 'Failed to update products', 500)
  }
}

export const deleteProduct = async (req, res) => {
  const { product_code } = req.body

  try {
    const deletedProduct = await deleteProductService(product_code);

    if (!deletedProduct) {
      return errorResponse(res, "Product not deleted!!", 400)
    }
    return successResponse(res, deletedProduct, "Product delete succesfully", 200)

  } catch (error) {
    console.error('Error deleting product:', error)
    return errorResponse(res, 'Failed to delete products', 500)
  }
}


export const searchFilterProduct = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    if (search) {
      query.OR = FEILD.PRODUCT_FEILD.map((item) => ({
        [item]: { contains: search, mode: 'insensitive' }
      }));
    }

    if (status) {
      query.status = status;
    }

    const getSearchFilter = await searchFilterProductService(query, page, limit);

    if (!getSearchFilter) {
      return errorResponse(res, "Product not searched or filtered", 400);
    }

    return successResponse(res, getSearchFilter, "Successfully Search or filter the product", 200);

  } catch (error) {
    console.error('Error searching or filtering product:', error);
    return errorResponse(res, "FAiled to searched or filtered Products", 500);
  }
};
