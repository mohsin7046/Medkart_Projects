
import { STATUS, LIMIT } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'
import { vendorLogger } from '../utilities/logger.js';
import { appQueue, appQueueEvents } from '../cache/queueManager.js'
import { VendorRepository } from '../repository/vendor.repository.js';

const vendorRepo = new VendorRepository();

export const createVendorService = async (data) => {
  try {
    const vendor_code = generateRandom("VENDOR");

     const module = 'vendor';
    const operation = 'create';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        ...data,
       vendor_code,
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const newVendor = await result.waitUntilFinished(appQueueEvents);
    if(!newVendor){
      throw new Error('vendor not created')
    }

    console.log("FRom the vendor service",newVendor);

    vendorLogger.info(`✅ Vendor created successfully | Code: ${vendor_code}`);

    return newVendor;
  } catch (error) {
    vendorLogger.error(`❌ Failed to create vendor | Error: ${error.message}`);
    throw error;
  }
}

export const updateVendorService = async (data) => {
  try {
    
    const module = 'vendor';
    const operation = 'update';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        ...data,
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const updatedVendor = await result.waitUntilFinished(appQueueEvents);
    if(!updatedVendor){
      throw new Error('vendor not created')
    }

    console.log("FRom the vendor service",updatedVendor);

    vendorLogger.info(`✅ Vendor updated successfully | Code: ${data.vendor_code}`);

    return updatedVendor;
  } catch (error) {
    vendorLogger.error(`❌ Vendor update failed | Code: ${data.vendor_code} | Error: ${error.message}`);
    throw error;
  }
}


export const searchVendorsService = async (q) => {
  try {
    if (!q) {
      throw new Error("Search query 'q' is required");
    }
    const searchVendor = await vendorRepo.searchVendors(q, LIMIT.VENDOR_LIMIT, STATUS.ACTIVE);
   
    vendorLogger.info(`✅ Vendor search completed | Query: ${q} | Results: ${searchVendor.length}`);
    return searchVendor;
  } catch (error) {
    vendorLogger.error(`❌ Vendor search failed | Query: ${q} | Error: ${error.message}`);
    throw error;
  }
}



export const deleteVendorService = async (vendor_code) => {
  try {
   
    const module = 'vendor';
    const operation = 'delete';

    const result = await appQueue.add(`${module}:${operation}`, {
      module,
      operation,
      payload: {
        vendor_code
      },
    }, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: true,
    });

    const softdeleteVendor = await result.waitUntilFinished(appQueueEvents);
    if(!softdeleteVendor){
      throw new Error('vendor not delete')
    }

    vendorLogger.info(`✅ Vendor deleted successfully | Code: ${vendor_code}`);

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

    const vendor = await vendorRepo.getVendorById(id);
   
    if (!vendor) {
      throw new Error(`Vendor not found for ID: ${id}`);
    }

    vendorLogger.info(`✅ Vendor fetched successfully | ID: ${id}`);
    return vendor;
  } catch (error) {
    vendorLogger.error(`❌ Fetch vendor failed | ID: ${id} | Error: ${error.message}`);
    throw error;
  }
}
