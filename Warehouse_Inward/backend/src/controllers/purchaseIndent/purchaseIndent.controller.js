import { successResponse } from "../../utilities/response.js";
import { catchAsync } from "../../utilities/tryCatchAsyncHandler.js";
import {getPurchaseIndentByIdService} from '../../services/purchaseIndent.service.js'
import { STATUSCODE } from "../../utilities/constant.js";

export const getPurchaseIndentById = catchAsync(async(req,res)=>{
     const { id } = req.params;
    const fetchPurchaseIndentData = await getPurchaseIndentByIdService(id);
    return successResponse(res, fetchPurchaseIndentData, "PurchaseIndent data fetched successfully by id", STATUSCODE.OK);
})