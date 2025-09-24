import { prisma } from "../utilities/import.config.js";
import { vendorLogger } from "../utilities/logger.js";

export class VendorRepository {

  async createVendor(data) {
    try {
      return await prisma.vendor.create({ data });
    } catch (error) {
      vendorLogger.error("Error creating vendor: " + error.message);
      throw error;
    }
  }

  async updateVendor(vendor_code, data) {
    try {
      return await prisma.vendor.update({
        where: { vendor_code },
        data,
      });
    } catch (error) {
      vendorLogger.error("Error updating vendor: " + error.message);
      throw error;
    }
  }


  async deleteVendor(vendor_code) {
    try {
      return await prisma.vendor.update({
        where: { vendor_code },
        data: { deleted_at: new Date() },
      });
    } catch (error) {
      vendorLogger.error("Error deleting vendor: " + error.message);
      throw error;
    }
  }


  async searchVendors(q, limit, status) {
    try {
      return await prisma.vendor.findMany({
        where: {
          deleted_at: null,
          name: { contains: q, mode: "insensitive" },
          status,
        },
        select: {
          id: true,
          name: true,
        },
        take: limit,
      });
    } catch (error) {
      vendorLogger.error("Error searching vendors: " + error.message);
      throw error;
    }
  }


  async getVendorById(id) {
    try {
      return await prisma.vendor.findUnique({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      vendorLogger.error(`Error fetching vendor by ID (${id}): ${error.message}`);
      throw error;
    }
  }


  async findVendor() {
    try {
      return await prisma.vendor.findFirstOrThrow({ orderBy: { id: 'desc' } });
    } catch (error) {
      saleLogger.error(`❌ Failed to fetch vendor | ${error.message}`);
      throw error;
    }
  }
}
