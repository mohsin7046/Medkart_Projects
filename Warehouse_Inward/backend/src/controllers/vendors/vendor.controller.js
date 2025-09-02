import { createVendorService, getAllVendorsService, searchVendorsService, updateVendorService, deleteVendorService,searchFilterVendorService } from '../../../services/vendor.service.js'
import { FEILD } from '../../utilities/constant.js';
import { errorResponse, successResponse } from '../../utilities/response.js';
import { Validate } from '../../zodValidation/validate.zod.js';
import { updateVendorSchema } from '../../zodValidation/vendorValidation/vendorUpdate.zod.js';
import {createVendorSchema} from '../../zodValidation/vendorValidation/vendorCreate.zod.js'

export const createVendor = async (req, res) => {
  const data = Validate(createVendorSchema)

  if(!data){
    return errorResponse(res, "All feilds are required", 400)
  }

  try {
    const newVendor = await createVendorService(data);
    if (!newVendor) {
      return errorResponse(res, "Vendor not created", 400)
    }
    return successResponse(res, newVendor, "Successfully created vendor", 200)
  } catch (error) {
    console.error('Error creating vendor:', error)
    return errorResponse(res, 'Failed to create vendor', 500)
  }
}

export const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const orderBy = req.query.orderBy;

    const vendors = await getAllVendorsService(page, limit, orderBy);
    if (!vendors) {
      return errorResponse(res, "ALL Vendor are not fetch", 400)
    }
    return successResponse(res, vendors, "Successfully getallVendors", 200);
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return errorResponse(res, "Failed to fetch the vendors", 500)
  }
}

export const getVendoreSearch = async (req, res) => {
  try {
    const { q } = req.params

    const vendors = await searchVendorsService(q);
    if (!vendors) {
      return errorResponse(res, "Vendor not present for the query", 400)
    }
    return successResponse(res, vendors, "Successfully get Vendor for query", 200)
  } catch (err) {
    console.error('Vendor search error:', err)
    return errorResponse(res, 'Failed to fetch vendors', 500)
  }
}


export const updateVendor = async (req, res) => {
  const formData = Validate(updateVendorSchema);

  if(!formData){
    return errorResponse(res, "All feilds are required", 400)
  }

  try {
    const updatedVendor = await updateVendorService(formData)

    if (!updatedVendor) {
      return errorResponse(res, "Vendor not present for the query", 400)
    }

    return successResponse(res, updatedVendor, "Successfully update Vendor", 200)
  } catch (error) {
    console.error('Error updating vendor status:', error)
    return errorResponse(res, 'Failed to update vendor status', 500)
  }
}

export const deleteVendor = async (req, res) => {
  const { vendor_code } = req.body
  try {
    const vendordelete = await deleteVendorService(vendor_code);
    if (!vendordelete) {
      return errorResponse(res, "Vendor not deleted", 400)
    }
    return successResponse(res, vendordelete, "Successfully delete Vendor", 200)
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return errorResponse(res, 'Failed to delete vendor', 500)
  }
}

export const searchFilterVendor = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    if (search) {
      query.OR = FEILD.VENDOR_FEILD.map((item) => ({
        [item]: { contains: search, mode: 'insensitive' }
      }));
    }

    if (status) {
      query.status = status;
    }

    const getSearchFilter = await searchFilterVendorService(query, page, limit);

    if (!getSearchFilter) {
      return errorResponse(res, "Product not searched or filtered", 400);
    }

    return successResponse(res, getSearchFilter, "Successfully Search or filter the product", 200);

  } catch (error) {
    console.error('Error searching or filtering product:', error);
    return errorResponse(res, "FAiled to searched or filtered Products", 500);
  }
};
