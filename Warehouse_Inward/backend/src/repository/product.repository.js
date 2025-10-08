import { prisma } from "../utilities/import.config.js";
import { productLogger } from "../utilities/logger.js";
import { STATUS } from "../utilities/constant.js";

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

      switch (true) {
        case id !== null:
          return await prisma.product.update({
            where: { id: parseInt(id) },
            data,
          });

        case product_code !== null:
          return await prisma.product.update({
            where: { product_code },
            data,
          });
    
        default:
          break;
      }

      throw new Error("❌ Either id or product_code must be provided");

    } catch (error) {
      productLogger.error("Error updating product: " + error.message);
      throw error;
    }
  }

  
  updateProductWithoutAwait({ id = null, data }) {
    try {
          return prisma.product.update({
            where: { id: parseInt(id) },
            data,
          })
          
    } catch (error) {
      productLogger.error("Error updating product: " + error.message);
      throw error;
    }
  }


  async deleteProduct(product_code) {
    try {
      return await prisma.product.update({
        where: { product_code },
        data: { deleted_at: new Date(), status: STATUS.INACTIVE },
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
          product_ptr: true,
        },
        take: limit,
      });
    } catch (error) {
      productLogger.error("Error searching products: " + error.message);
      throw error;
    }
  }


  async getProducts({ id = null, ids = null, select = null, include = null }) {
    try {
      if (id) {
        return await prisma.product.findUnique({
          where: { id: parseInt(id) },
          ...(select ? { select } : {}),
          ...(include ? { include } : {}),
        });
      }

      if (ids && ids.length) {
        return await prisma.product.findMany({
          where: { id: { in: ids }, deleted_at: null },
          ...(select ? { select } : {}),
          ...(include ? { include } : {}),
        });
      }

      throw new Error("Either 'id' or 'ids' must be provided");
    } catch (error) {
      productLogger.error(`Error fetching products | ${error.message}`);
      throw error;
    }
  }

}
