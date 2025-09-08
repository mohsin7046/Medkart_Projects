import { prisma } from '../utilities/import.config.js'
import { STATUS, LIMIT } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import {productLogger} from '../utilities/logger.js'

export const addProductService = async (data) => {
  try {
   
    if (data.product_mrp < data.product_price) {
      productLogger.error("❌ Validation failed: MRP < Price while adding product");
      throw new Error("Product MRP must be equal or greater than price");
    }

    const product_code = generateRandom("PRODUCT");
    productLogger.info("📦 Generated product_code: " + product_code);

    const product = await prisma.product.create({
      data: {
        ...data,
        product_code,
      },
    });

    if (!product) {
      productLogger.error("❌ Prisma returned null while creating product");
      throw new Error("Product not created");
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
  
    if (!formData.product_code) {
      productLogger.error("❌ Product code missing in update request");
      throw new Error("Product code is required for update");
    }

    if (formData.product_mrp < formData.product_price) {
      productLogger.error("❌ Validation failed: MRP < Price for product_code " + formData.product_code);
      throw new Error("Product MRP must be equal or greater than price");
    }

    const updatedProduct = await prisma.product.update({
      where: { product_code: formData.product_code },
      data: {
        name: formData.name,
        category: formData.category,
        combination: formData.combination,
        product_mrp: formData.product_mrp,
        product_price: formData.product_price,
        last_purchase_price: formData.last_purchase_price,
        unit_of_measure: formData.unit_of_measure,
        hsn_code: formData.hsn_code,
        description: formData.description,
        gst_percentage: formData.gst_percentage,
        status: formData.status,
      },
    });

    if (!updatedProduct) {
      productLogger.error("❌ Product update failed for code: " + formData.product_code);
      throw new Error("Product not updated!!");
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

    const searchProduct = await prisma.product.findMany({
      where: {
        deleted_at: null,
        name: {
          contains: q,
          mode: "insensitive",
        },
        status: STATUS.ACTIVE,
      },
      select: {
        id: true,
        name: true,
      },
      take: LIMIT.PRODUCT_LIMIT,
    });

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
    const softdeleteProduct = await prisma.product.update({
      where: { product_code },
      data: { deleted_at: new Date() },
    });

    productLogger.info(`✅ Product deleted successfully. Code: ${product_code}`);
    return softdeleteProduct;
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

    const data = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

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
