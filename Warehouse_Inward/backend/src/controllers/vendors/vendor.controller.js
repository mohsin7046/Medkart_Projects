import {
  createVendorService,
  searchVendorsService,
  updateVendorService,
  deleteVendorService,
  getVendorByIdService
} from '../../services/vendor.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { updateVendorSchema } from '../../zodValidation/vendorValidation/vendorUpdate.zod.js'
import { createVendorSchema } from '../../zodValidation/vendorValidation/vendorCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'


export const createVendor = catchAsync(async (req, res) => {
  const data = createVendorSchema.parse(req.body) 

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const newVendor = await createVendorService(data)
  if (!newVendor) {
    return errorResponse(res, 'Vendor not created', 400)
  }
  return successResponse(res, newVendor, 'Successfully created vendor', 200)
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
  const formData = updateVendorSchema.parse(req.body)

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
  console.log(vendor_code);
  
  const vendordelete = await deleteVendorService(vendor_code)
  if (!vendordelete) {
    return errorResponse(res, 'Vendor not deleted', 400)
  }
  return successResponse(res, vendordelete, 'Successfully delete Vendor', 200)
})


export const getVendoreById = catchAsync(async(req,res)=>{
  const {id} = req.params;
   console.log(id);

   const vendorbyIddata = await getVendorByIdService(id);
 
   if(!vendorbyIddata){
     errorResponse(res,"Vendor not fount for the id",400)
   }
 
   successResponse(res,vendorbyIddata,"Vendor data fetch successfully by id",200)

})
