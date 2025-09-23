import { prisma } from "../utilities/import.config.js";
import { productLogger } from "../utilities/logger.js";

export class ProductRepository {

  async createProduct(data) {
    try {
      return await prisma.product.create({ data });
    } catch (error) {
      productLogger.error("Error creating product: " + error.message);
      throw error;
    }
  }


  async updateProduct({ id = null, product_code = null, data }) {
  try {

    if (id) {
      return await prisma.product.update({
        where: { id },
        data,
      });
    }
    if (product_code) {
      return await prisma.product.update({
        where: { product_code },
        data,
      });
    }
    throw new Error("❌ Either id or product_code must be provided");
    
  } catch (error) {
    productLogger.error("Error updating product: " + error.message);
    throw error;
  }
}


  async deleteProduct(product_code) {
    try {
      return await prisma.product.update({
        where: { product_code },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      productLogger.error("Error deleting product: " + error.message);
      throw error;
    }
  }


  async searchProducts(q, limit, status) {
    try {
      return await prisma.product.findMany({
        where: {
          deleted_at: null,
          name: {
            contains: q,
            mode: "insensitive",
          },
          status,
        },
        select: {
          id: true,
          name: true,
          product_mrp: true,
          product_price: true,
        },
        take: limit,
      });
    } catch (error) {
      productLogger.error("Error searching products: " + error.message);
      throw error;
    }
  }


  async getProductById(id) {
    try {
      return await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      productLogger.error(`Error fetching product by ID (${id}): ${error.message}`);
      throw error;
    }
  }


  async getProductByCode(product_code) {
    try {
      return await prisma.product.findUnique({
        where: { product_code },
      });
    } catch (error) {
      productLogger.error(`Error fetching product by code (${product_code}): ${error.message}`);
      throw error;
    }
  }

  async findProductsByIds(productIds,select) {
    try {
      return await prisma.product.findMany({
        where: { id: { in: productIds }, deleted_at: null },
          ...(select ? { select } : {}),
      });
    } catch (error) {
      saleLogger.error(`❌ Failed to fetch Products | ${error.message}`);
      throw error;
    }
  }

  async updateProductInventory(id, inventory_qty) {
    try {
      return await prisma.product.update({
        where: { id },
        data: { inventory_qty },
      });
    } catch (error) {
      saleLogger.error(`❌ Failed to update Product Inventory ID: ${id} | ${error.message}`);
      throw error;
    }
  }

}
