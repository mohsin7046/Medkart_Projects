import {
  createVendorService,
  searchVendorsService,
  updateVendorService,
  deleteVendorService,
  getVendorByIdService
} from '../../services/vendor.service.js'
import { successResponse } from '../../utilities/response.js'

import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'

export const createVendor = catchAsync(async (req, res) => {

  const data = req.body;
  const newVendor = await createVendorService(data);
  return successResponse(res, newVendor, 'Successfully created vendor', STATUSCODE.OK);
})


export const updateVendor = catchAsync(async (req, res) => {

  const formData = req.body;
  const updatedVendor = await updateVendorService(formData);
  return successResponse(res, updatedVendor, 'Successfully updated vendor', STATUSCODE.OK);
})


export const getVendoreSearch = catchAsync(async (req, res) => {

  const { q } = req.params;
  const vendors = await searchVendorsService(q);
  return successResponse(res, vendors, 'Successfully retrieved vendors for query', STATUSCODE.OK);
})



export const deleteVendor = catchAsync(async (req, res) => {

  const { vendor_code } = req.body;
  const deletedVendor = await deleteVendorService(vendor_code);
  return successResponse(res, deletedVendor, 'Successfully deleted vendor', STATUSCODE.OK);
})


export const getVendoreById = catchAsync(async (req, res) => {

  const { id } = req.params;
  const vendorById = await getVendorByIdService(id);
  return successResponse(res, vendorById, 'Vendor data fetched successfully by id', STATUSCODE.OK);
})
