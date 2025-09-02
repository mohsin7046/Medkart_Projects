
import { addProductService, getAllProductsService, searchProductService, updateProductService, deleteProductService } from '../../services/product.service.js';
import { successResponse, errorResponse } from '../../utilities/response.js';


export const addProduct = async (req, res) => {
  const data = req.body;

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
    //TODO: getALLProducts through pagination 
    const products = await getAllProductsService();
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
  const formData = req.body;

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
