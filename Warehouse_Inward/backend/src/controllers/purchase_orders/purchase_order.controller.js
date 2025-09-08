import {
  createPurchaseOrderService,
  deletePurchaseOrderService,
  updatePurchaseOrderService,
  getPurchaseOrderByIdService
} from '../../services/purchaseOrder.service.js'
import {  successResponse } from '../../utilities/response.js'
import { updatePurchaseOrderSchema } from '../../zodValidation/purchaseOrderValidation/purchaseOrderUpdate.zod.js'
import { createPurchaseOrderSchema } from '../../zodValidation/purchaseOrderValidation/purchaseOrderCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'


export const createPurchaseOrder = catchAsync(async (req, res) => {
  req.component = "po"; 
  const data = createPurchaseOrderSchema.parse(req.body);
  const newPO = await createPurchaseOrderService(data);
  return successResponse(res, newPO, 'Successfully created Purchase Order', STATUSCODE.OK);
})


export const deletePurchaseOrder = catchAsync(async (req, res) => {
  req.component = "po";
  const { order_id } = req.body;
  const deletedPO = await deletePurchaseOrderService(order_id);
  return successResponse(res, deletedPO, 'Successfully deleted Purchase Order', STATUSCODE.OK);
})


export const updatePurchaseOrder = catchAsync(async (req, res) => {
 req.component = "po";
  const formData = updatePurchaseOrderSchema.parse(req.body);
  const updatedPO = await updatePurchaseOrderService(formData);
  return successResponse(res, updatedPO, 'Successfully updated Purchase Order', STATUSCODE.OK);
})


export const getPurchaseOrderById = catchAsync(async(req,res)=>{
  req.component = "po";
  const { id } = req.params;
  const poData = await getPurchaseOrderByIdService(id);
  return successResponse(res, poData, 'Purchase Order data fetched successfully', STATUSCODE.OK);
})
