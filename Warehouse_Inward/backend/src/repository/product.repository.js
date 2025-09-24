import { prisma } from "../utilities/import.config.js";
import { productLogger } from "../utilities/logger.js";
import { STATUS, combinations, categories } from "../utilities/constant.js";

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
          product_price: true,
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

  async getCombinations(search) {
    try {
      let filtered = combinations;

      if (search) {
        filtered = combinations.filter((c) =>
          c.toLowerCase().includes(search.toLowerCase())
        );
      }

      const data = filtered.map((c) => ({ value: c, label: c }))

      return data;

    } catch (error) {
      productLogger.error("Error fetching product combinations: " + error.message);
      throw error;
    }
  }

  async getCategories(search) {
    try {
      let filtered = categories;

      if (search) {
        filtered = categories.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase())
        );
      }

      const data = filtered.map((c) => ({
        value: c.name,
        label: c.name,
        uom: c.uom,
      }))

      return data;

    } catch (error) {
      productLogger.error("Error fetching product categories: " + error.message);
      throw error;
    }
  }

}
