import { prisma } from '../utilities/import.config.js'
import { STATUS, LIMIT } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { vendorLogger } from '../utilities/logger.js';
import { cacheSet, cacheGet, cacheDelete } from '../cache/redisClient.js';

export const createVendorService = async (data) => {
  try {
    const vendor_code = generateRandom("VENDOR");

    const newVendor = await prisma.vendor.create({
      data: {
        ...data,
        vendor_code,
      },
    });

    vendorLogger.info(`✅ Vendor created successfully | Code: ${vendor_code}`);

   
    await cacheSet(`vendor:id:${newVendor.id}`, newVendor, 3600);
    await cacheSet(`vendor:code:${newVendor.vendor_code}`, newVendor, 3600);

    return newVendor;
  } catch (error) {
    vendorLogger.error(`❌ Failed to create vendor | Error: ${error.message}`);
    throw error;
  }
}

export const updateVendorService = async (data) => {
  try {
    const updatedVendor = await prisma.vendor.update({
      where: { vendor_code: data.vendor_code },
      data: { ...data },
    });

    vendorLogger.info(`✅ Vendor updated successfully | Code: ${data.vendor_code}`);

    await cacheSet(`vendor:id:${updatedVendor.id}`, updatedVendor, 3600);
    await cacheSet(`vendor:code:${updatedVendor.vendor_code}`, updatedVendor, 3600);

    return updatedVendor;
  } catch (error) {
    vendorLogger.error(`❌ Vendor update failed | Code: ${data.vendor_code} | Error: ${error.message}`);
    throw error;
  }
}


export const searchVendorsService = async (q) => {
  try {

    const cacheKey = `vendor:search:${q}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const searchVendor = await prisma.vendor.findMany({
      where: {
        deleted_at: null,
        name: { contains: q, mode: 'insensitive' },
        status: STATUS.ACTIVE,
      },
      select: {
        id: true,
        name: true,
      },
      take: LIMIT.VENDOR_LIMIT,
    });

    vendorLogger.info(`✅ Vendor search completed | Query: ${q} | Results: ${searchVendor.length}`);
    await cacheSet(cacheKey, searchVendor, 300);
    return searchVendor;
  } catch (error) {
    vendorLogger.error(`❌ Vendor search failed | Query: ${q} | Error: ${error.message}`);
    throw error;
  }
}



export const deleteVendorService = async (vendor_code) => {
  try {
    const softdeleteVendor = await prisma.vendor.update({
      where: { vendor_code },
      data: { deleted_at: new Date() },
    });

    vendorLogger.info(`✅ Vendor deleted successfully | Code: ${vendor_code}`);

    await cacheDelete(`vendor:code:${vendor_code}`);
    if (softdeleteVendor?.id) await cacheDelete(`vendor:id:${softdeleteVendor.id}`);

    return softdeleteVendor;
  } catch (error) {
    vendorLogger.error(`❌ Vendor delete failed | Code: ${vendor_code} | Error: ${error.message}`);
    throw error;
  }
}


export const getVendorByIdService = async (id) => {
  try {
    if (!id) {
      throw new Error("Vendor ID is required");
    }

    const cacheKey = `vendor:id:${id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const vendor = await prisma.vendor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!vendor) {
      throw new Error(`Vendor not found for ID: ${id}`);
    }

    cacheSet(cacheKey, vendor, 3600);

    vendorLogger.info(`✅ Vendor fetched successfully | ID: ${id}`);
    return vendor;
  } catch (error) {
    vendorLogger.error(`❌ Fetch vendor failed | ID: ${id} | Error: ${error.message}`);
    throw error;
  }
}
