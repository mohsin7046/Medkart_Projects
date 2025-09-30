import { STATUS } from '../utilities/constant.js';
import { prisma } from '../utilities/import.config.js';
import { indentLogger } from '../utilities/logger.js';

export class SalesIndentRepository  {
  async findIndentById({id, select = undefined, include = undefined}) {
    try {
      return await prisma.salesIndent.findUnique({
        where: { id: parseInt(id) },
        select,
        include,
      });
    } catch (error) {
      indentLogger.error(`Failed to fetch SalesIndent ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async existingIndentsByProductIds(productIds,select = undefined) {
    try {
      return await prisma.salesIndent.findMany({
        where: { product_id: { in: productIds }, status: STATUS.OPEN },
         ...(select ? { select } : {}),
    })
    } catch (error) {
      indentLogger.error(`Failed to fetch SalesIndents | ${error.message}`);
      throw error;
    }
  }

  async createIndent(data) {
    try {
      return await prisma.salesIndent.create({ data });
    } catch (error) {
      indentLogger.error(`Failed to create SalesIndent | ${error.message}`);
      throw error;
    }
  }

  async updateIndent(id, data) {
    try {
      return await prisma.salesIndent.update({
        where: { id },
        data,
      });
    } catch (error) {
      indentLogger.error(`Failed to update SalesIndent ID: ${id} | ${error.message}`);
      throw error;
    }
  }

  async findIndentsByProductIds(productIds) {
      try {
        return await prisma.salesIndent.findMany({
          where: { product_id: { in: productIds }, status: 'open' },
        });
      } catch (error) {
        saleLogger.error(`Failed to fetch SalesIndents | ${error.message}`);
        throw error;
      }
    }
};
