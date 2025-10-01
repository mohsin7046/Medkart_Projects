import {
  createPurchaseOrderAgainstPurchaseIndentService,
  deletePurchaseOrderService,
  getPurchaseOrderByIdService
} from '../../services/purchaseOrder.service.js'
import {  successResponse } from '../../utilities/response.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { ENTITY, STATUSCODE } from '../../utilities/constant.js'


export const createPurchaseOrderAgainstPurchaseIndent = catchAsync(async (req, res) => {
  req.component = ENTITY.po; 

  const data = req.body;

  const newPO = await createPurchaseOrderAgainstPurchaseIndentService(data);

  return successResponse(res, newPO, 'Successfully created Purchase Order', STATUSCODE.OK);
})


export const deletePurchaseOrder = catchAsync(async (req, res) => {
  req.component = ENTITY.po;
  const { order_id } = req.body;
  const deletedPO = await deletePurchaseOrderService(order_id);
  return successResponse(res, deletedPO, 'Successfully deleted Purchase Order', STATUSCODE.OK);
})


// export const updatePurchaseOrder = catchAsync(async (req, res) => {
//  req.component =ENTITY.po;
//   const formData = updatePurchaseOrderSchema.parse(req.body);
//   const updatedPO = await updatePurchaseOrderService(formData);
//   return successResponse(res, updatedPO, 'Successfully updated Purchase Order', STATUSCODE.OK);
// })


export const getPurchaseOrderById = catchAsync(async(req,res)=>{
  req.component = ENTITY.po;
  const { id } = req.params;
  const poData = await getPurchaseOrderByIdService(id);
  return successResponse(res, poData, 'Purchase Order data fetched successfully', STATUSCODE.OK);
})
