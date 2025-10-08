import { prisma } from "../utilities/import.config.js";
import { gatePassLogger } from "../utilities/logger.js";

export class GatePassRepository {
  async createGatePass(data) {
    try {
      return await prisma.gatePass.create({ data });
    } catch (err) {
      gatePassLogger.error(`Error creating GatePass: ${err.message}`, { stack: err.stack, data });
      throw err; 
    }
  }

  async updateGatePass({ id, data }) {
    try {
      return await prisma.gatePass.update({
        where: { id },
        data,
      });
    } catch (err) {
      gatePassLogger.error(`Error updating GatePass with ID ${id}: ${err.message}`, { stack: err.stack, data });
      throw err;
    }
  }

  async getGatePassById({ id, select = undefined, include = undefined }) {
    try {
      return await prisma.gatePass.findUnique({
        where: { id: parseInt(id) },
        select,
        include,
      });
    } catch (err) {
      gatePassLogger.error(`Error fetching GatePass with ID ${id}: ${err.message}`, { stack: err.stack });
      throw err;
    }
  }
}
