import {createVendorService,getAllVendorsService,searchVendorsService,updateVendorService,deleteVendorService} from '../../services/vendor.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js';

export const createVendor = async (req, res) => {
  const data = req.body

  try {
    const newVendor = await createVendorService(data);
    if(!newVendor){
      return errorResponse(res,"Vendor not created",400)
    }
    return successResponse(res,newVendor,"Successfully created vendor",200)
  } catch (error) {
    console.error('Error creating vendor:', error)
    return errorResponse(res,'Failed to create vendor',500)
  }
}

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await getAllVendorsService();
    if(vendors){
      return errorResponse(res,"ALL Vendor are not fetch")
    }
    return successResponse(res,vendors,"Successfully getallVendors",200)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return errorResponse(res,"Failed to fetch the vendors",500)
  }
}

export const getVendoreSearch = async (req, res) => {
  try {
    const { q } = req.params

    const vendors = await searchVendorsService(q);
    if(!vendors){
      return errorResponse(res,"Vendor not present for the query",400)
    }
    return successResponse(res,vendors,"Successfully get Vendor for query",200)
  } catch (err) {
    console.error('Vendor search error:', err)
    return errorResponse(res,'Failed to fetch vendors',500)
  }
}


export const updateVendor = async (req, res) => {
  const formData = req.body;
  
  try {
    const updatedVendor = await updateVendorService(formData)
    
    if(!updatedVendor){
      return errorResponse(res,"Vendor not present for the query",400)
    }

    return successResponse(res,updatedVendor,"Successfully update Vendor",200)
  } catch (error) {
    console.error('Error updating vendor status:', error)
   return errorResponse(res,'Failed to update vendor status',500)
  }
}

export const deleteVendor = async (req, res) => {
  const { vendor_code } = req.body
  try {
    const vendordelete = await deleteVendorService(vendor_code);
    if(!vendordelete){
      return errorResponse(res,"Vendor not deleted",400)
    }
   return successResponse(res,vendordelete,"Successfully delete Vendor",200)
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return errorResponse(res,'Failed to delete vendor',500)
  }
}
