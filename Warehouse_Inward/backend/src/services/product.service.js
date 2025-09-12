import { prisma } from '../utilities/import.config.js'
import { STATUS, LIMIT, PREFIX } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { productLogger } from '../utilities/logger.js'
import { cacheSet, cacheGet, cacheDelete } from '../cache/redisClient.js';
import { appQueue, appQueueEvents } from '../cache/queueManager.js'

export const addProductService = async (data) => {
  try {

    if (data.product_mrp < data.product_price) {
      productLogger.error("❌ Validation failed: MRP < Price while adding product");
      throw new Error("Product MRP must be equal or greater than price");
    }

    const product_code = generateRandom(PREFIX.PRODUCT);
    productLogger.info("📦 Generated product_code: " + product_code);

    const module = 'product';
    const operation = 'create';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        ...data,
        inventory_qty: 10,
        product_code
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const product = await result.waitUntilFinished(appQueueEvents);
    if(!product){
      throw new Error('product not created')
    }

    console.log("FRom the product service",product);
    
    productLogger.info("✅ Product created successfully: " + product_code);

    const cacheKeyById = `product:id:${product.id}`;
    const cacheKeyByCode = `product:code:${product.product_code}`;

    await cacheSet(cacheKeyById, product, 3600);
    await cacheSet(cacheKeyByCode, product, 3600);

    return product.data;

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

    const module = 'product';
    const operation = 'update';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        ...formData
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const updatedProduct = await result.waitUntilFinished(appQueueEvents);
    if(!updatedProduct){
      throw new Error('product not updated')
    }

    console.log("FRom the product service",updatedProduct);

    productLogger.info("✅ Product updated in DB: " + formData.product_code);

    await cacheSet(`product:id:${updatedProduct.id}`, updatedProduct, 3600);
    await cacheSet(`product:code:${updatedProduct.product_code}`, updatedProduct, 3600);

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

    // const cacheKey = `product:search:${q}`;
    // const cached = await cacheGet(cacheKey);
    // if (cached) return cached;

    console.log(q);

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
        product_mrp: true,
        product_price: true
      },
      take: LIMIT.PRODUCT_LIMIT,
    });

    if (!searchProduct || searchProduct.length === 0) {
      productLogger.warn("⚠️ No products found for query: " + q);
      return [];
    }

    productLogger.info(`✅ Found ${searchProduct.length} products for query: ${q}`);
    // await cacheSet(cacheKey, searchProduct, 300);
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
   
    const module = 'product';
    const operation = 'delete';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        product_code
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const softdeleteProduct = await result.waitUntilFinished(appQueueEvents);
    if(!softdeleteProduct){
      throw new Error('product not deleted')
    }

    console.log("FRom the product service",softdeleteProduct);

    await cacheDelete(`product:code:${product_code}`);
    if (softdeleteProduct?.id) await cacheDelete(`product:id:${softdeleteProduct.id}`);

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

    const cacheKey = `product:id:${id}`;
    const cached = await cacheGet(cacheKey);

    if (cached) return cached;

    const data = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!data) {
      productLogger.warn(`⚠️ Product not found for id: ${id}`);
      throw new Error("Product not found for the given id");
    }

    productLogger.info(`✅ Product fetched successfully for id: ${id}`);
    await cacheSet(cacheKey, data, 3600);
    return data;
  } catch (error) {
    productLogger.error(`❌ Error fetching product by id: ${id} | ${error.message}`);
    throw error;
  }
}
