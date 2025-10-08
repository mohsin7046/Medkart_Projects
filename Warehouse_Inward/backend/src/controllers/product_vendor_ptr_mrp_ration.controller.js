import { CreateProductVendorMrpPtrRationService,updateProductVendorMrpPtrRationService,getProductVendorMrpPtrRationByIdService } from "../services/product_vendor_ptr_mrp_ration.service.js";
import { STATUSCODE } from "../utilities/constant.js";
import { successResponse } from "../utilities/response.js";

export const CreateProductVendorMrpPtrRation = async(req,res)=>{
    const data = req.body;

    const mappingData = await CreateProductVendorMrpPtrRationService(data);

    return successResponse(res,mappingData,"Product Vendor Ptr to Mrp Ration successfully created",STATUSCODE.OK)
}

export const updateProductVendorMrpPtrRation = async(req,res)=>{
    const data = req.body;
    
    const mappingData = await updateProductVendorMrpPtrRationService(data);

    return successResponse(res,mappingData,"Product Vendor Ptr to Mrp Ration successfully updated",STATUSCODE.OK)
}

export const getProductVendorMrpPtrRationById = async(req,res)=>{
    const {id} = req.params;
    const fetchmappedData  = await getProductVendorMrpPtrRationByIdService(id)
    return successResponse(res, fetchmappedData, "Mapped Data fetched successfully", STATUSCODE.OK);
}