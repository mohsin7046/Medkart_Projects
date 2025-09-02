import {
  createVendorService,
  getAllVendorsService,
  searchVendorsService,
  updateVendorService,
  deleteVendorService,
  searchFilterVendorService
} from '../../../services/vendor.service.js'
import { FEILD } from '../../utilities/constant.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { Validate } from '../../zodValidation/validate.zod.js'
import { updateVendorSchema } from '../../zodValidation/vendorValidation/vendorUpdate.zod.js'
import { createVendorSchema } from '../../zodValidation/vendorValidation/vendorCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'

export const createVendor = catchAsync(async (req, res) => {
  const data = Validate(createVendorSchema)

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const newVendor = await createVendorService(data)
  if (!newVendor) {
    return errorResponse(res, 'Vendor not created', 400)
  }
  return successResponse(res, newVendor, 'Successfully created vendor', 200)
})

export const getAllVendors = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const orderBy = req.query.orderBy

  const vendors = await getAllVendorsService(page, limit, orderBy)
  if (!vendors) {
    return errorResponse(res, 'ALL Vendor are not fetch', 400)
  }
  return successResponse(res, vendors, 'Successfully getallVendors', 200)
})

export const getVendoreSearch = catchAsync(async (req, res) => {
  const { q } = req.params

  const vendors = await searchVendorsService(q)
  if (!vendors) {
    return errorResponse(res, 'Vendor not present for the query', 400)
  }
  return successResponse(res, vendors, 'Successfully get Vendor for query', 200)
})

export const updateVendor = catchAsync(async (req, res) => {
  const formData = Validate(updateVendorSchema)

  if (!formData) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const updatedVendor = await updateVendorService(formData)

  if (!updatedVendor) {
    return errorResponse(res, 'Vendor not present for the query', 400)
  }

  return successResponse(res, updatedVendor, 'Successfully update Vendor', 200)
})

export const deleteVendor = catchAsync(async (req, res) => {
  const { vendor_code } = req.body
  const vendordelete = await deleteVendorService(vendor_code)
  if (!vendordelete) {
    return errorResponse(res, 'Vendor not deleted', 400)
  }
  return successResponse(res, vendordelete, 'Successfully delete Vendor', 200)
})

export const searchFilterVendor = catchAsync(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query

  let query = {};
  if (search) {
    query.OR = FEILD.VENDOR_FEILD.map((item) => ({
      [item]: { contains: search, mode: 'insensitive' }
    }))
  }

  if (status) {
    query.status = status
  }

  const getSearchFilter = await searchFilterVendorService(query, page, limit)

  if (!getSearchFilter) {
    return errorResponse(res, 'Product not searched or filtered', 400)
  }

  return successResponse(
    res,
    getSearchFilter,
    'Successfully Search or filter the product',
    200
  )
})
