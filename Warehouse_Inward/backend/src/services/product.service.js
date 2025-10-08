import { STATUS, LIMIT, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { productLogger } from '../utilities/logger.js'
import { ProductRepository } from '../repository/product.repository.js'
import { combinations, categories } from "../utilities/constant.js";

const ProductRepo = new ProductRepository();
 
export const addProductService = async (data) => {
  try {

    if (data.product_mrp < data.product_ptr) {
      productLogger.error("Validation failed: MRP < Price while adding product");
      throw new Error("Product MRP must be equal or greater than price");
    }

    const product_code = generateRandom(PREFIX.PRODUCT);

    productLogger.info("📦 Generated product_code: " + product_code);

    const product = await ProductRepo.createProduct({
    name: data.name,
    category: data.category,
    combination: data.combination,
    product_mrp: data.product_mrp,
    product_ptr: data.product_ptr,
    last_purchase_price: data.last_purchase_price,
    unit_of_measure:  data.unit_of_measure,
    description: data.description,
    hsn_code: data.hsn_code,
    gst_percentage:   data.gst_percentage,
    status: data.status,
    inventory_qty: data.inventory_qty,
    product_code
    });
     
    if (!product) {
      productLogger.error("❌ Product creation failed in DB");
      throw new Error("Product could not be created");
    }

    productLogger.info("✅ Product created successfully: " + product_code);
    return product;

  } catch (err) {
    productLogger.error("❌ Error in addProductService: " + err.message);
    throw err;
  }
}


export const updateProductService = async (formData) => {
  try {

    if (formData.product_mrp < formData.product_ptr) {
      productLogger.error("❌ Validation failed: MRP < Price for product_code " + formData.product_code);
      throw new Error("Product MRP must be equal or greater than price");
    }

    const updatedProduct = await ProductRepo.updateProduct({
      product_code: formData.product_code,
      data: formData
    });

    if (!updatedProduct) {
      throw new Error('product not updated')
    }

    productLogger.info("✅ Product updated in DB: " + formData.product_code);

    return updatedProduct;
  } catch (err) {
    productLogger.error("❌ Error in updateProductService: " + err.message);
    throw err;
  }
}


export const searchProductService = async (q) => {
  try {
    if (!q || q.trim() === "") {
      productLogger.warn("⚠️ Empty search query received in getProductSearch");
      throw new Error("Search query is required");
    }

    const searchProduct = await ProductRepo.searchProducts(q, LIMIT.PRODUCT_LIMIT, STATUS.ACTIVE);

    console.log("Search Results:", searchProduct); 
    
    if (!searchProduct || searchProduct.length === 0) {
      productLogger.warn("⚠️ No products found for query: " + q);
      return [];
    }

    productLogger.info(`✅ Found ${searchProduct.length} products for query: ${q}`);

    return searchProduct;
  } catch (err) {
    productLogger.error("❌ Error in searchProductService: " + err.message);
    throw err;
  }
}


export const deleteProductService = async (product_code) => {
  if (!product_code) {
    productLogger.error("❌ Product code missing for deletion");
    throw new Error("Product code is required for deletion");
  }

  try {
    const softdeleteProduct = await ProductRepo.deleteProduct(product_code);

    if (!softdeleteProduct || !softdeleteProduct.id) {
      productLogger.warn(`⚠️ No product found to delete for code: ${product_code}`);
      throw new Error("Product not found for the given code");
    }

    console.log(softdeleteProduct.id);
    productLogger.info(`✅ Product soft-deleted successfully for code: ${product_code}`);
 
    return softdeleteProduct.id;
  } catch (error) {
    productLogger.error(`❌ Product delete failed for code: ${product_code} | Error: ${error.message}`);
    throw new Error("Product could not be deleted");
  }
}


export const getProductByIdService = async (id) => {
  try {
    if (!id) {
      productLogger.error("❌ Product ID is required");
      throw new Error("Product ID is required");
    }

    const data = await ProductRepo.getProducts({id});

    if (!data) {
      productLogger.warn(`⚠️ Product not found for id: ${id}`);
      throw new Error("Product not found for the given id");
    }

    productLogger.info(`✅ Product fetched successfully for id: ${id}`);

    return data;
  } catch (error) {
    productLogger.error(`❌ Error fetching product by id: ${id} | ${error.message}`);
    throw error;
  }
}


export const getCategoriesService = async (search) => {
  try {
      let filtered = combinations;

      if (search) {
        filtered = combinations.filter((c) =>
          c.toLowerCase().includes(search.toLowerCase())
        );
      }

      const categories = filtered.map((c) => ({ value: c, label: c }))

    return categories;

  } catch (error) {
    productLogger.error("❌ Error fetching product categories: " + error.message);
    throw error;
  }
}

export const getCombinationsService = async (search) => {
  try {
    let filtered = categories;

      if (search) {
        filtered = categories.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      const combinations = filtered.map((c) => ({
        value: c.name,
        label: c.name,
        uom: c.uom,
      }))

    return combinations;
  } catch (error) {
    productLogger.error("❌ Error fetching product combinations: " + error.message);
    throw error;
  }
}