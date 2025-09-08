import {
  createGRNRecordService,
  updateGRNRecordService,
  deleteGRNRecordService,
  getGRNByIdService
} from '../../services/grn.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'

import { updateGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'



export const createGRN = catchAsync(async (req, res) => {
  req.component = "grn"; 
  const data = createGoodReceiptNoteSchema.parse(req.body);
  const createdGRN = await createGRNRecordService(data);
  return successResponse(res, createdGRN, 'Successfully created GRN', STATUSCODE.OK);
});



export const updateGRN = catchAsync(async (req, res) => {
  req.component = "grn"; 
  const data = updateGoodReceiptNoteSchema.parse(req.body);
  const updatedGRN = await updateGRNRecordService(data);
  return successResponse(res, updatedGRN, 'Successfully updated GRN', STATUSCODE.OK);
});



export const deleteGRN = catchAsync(async (req, res) => {
  req.component = "grn"; 
  const { grn_id } = req.body;
  console.log("FROm",grn_id);
  
  const deletedGRN = await deleteGRNRecordService(grn_id);
  return successResponse(res, deletedGRN, 'GRN deleted successfully', STATUSCODE.OK);
});


export const getGRNByID = catchAsync(async (req, res) => {
  req.component = "grn"; 
  const { id } = req.params;
  const grnData = await getGRNByIdService(id);
  if (!grnData) {
    return errorResponse(res, "GRN not found for the id", STATUSCODE.BAD_REQUEST);
  }
  return successResponse(res, grnData, "GRN data fetched successfully by id", STATUSCODE.OK);
});

