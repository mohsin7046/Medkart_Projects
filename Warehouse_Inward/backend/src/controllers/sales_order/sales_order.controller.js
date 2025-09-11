import { successResponse } from '../../utilities/response.js'
import { createSalesOrderSchema } from '../../zodValidation/salesOrderValidation/salesCreate.zod.js'
import { updateSalesOrderSchema } from '../../zodValidation/salesOrderValidation/salesUpdate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { ENTITY, STATUSCODE } from '../../utilities/constant.js'
import { createSaleOrderService,updateSaleOrderService,deleteSalesOrderService,getSalesOrderByIdService,processSalesOrderService} from '../../services/salesOrder.service.js'

export const createSalesOrder = catchAsync(async(req,res)=>{
    req.component = ENTITY.so

    const data = createSalesOrderSchema.parse(req.body);

    console.log(data);
    
    
    const newSaleOrder = await createSaleOrderService(data);
    
    return successResponse(res, newSaleOrder, "Sale Order created successfully", STATUSCODE.OK);
})  


export const updateSalesOrder = catchAsync(async(req,res)=>{
   req.component = ENTITY.so

    const data = updateSalesOrderSchema.parse(req.body);
    
    const updatedSaleOrder = await updateSaleOrderService(data);
    
    return successResponse(res, updatedSaleOrder, "Sale Order updated successfully", STATUSCODE.OK);
})

export const deleteSalesOrder = catchAsync(async (req, res) => {
   req.component = ENTITY.so
  const { sales_order_id } = req.body

  console.log(sales_order_id);
  

  const deletedSalesOrder = await deleteSalesOrderService(sales_order_id)

  return successResponse(res, deletedSalesOrder, 'Sale Order delete succesfully', STATUSCODE.OK)
})


export const getSalesOrderById = catchAsync(async (req, res) => {
    req.component = ENTITY.so
    const { id } = req.params;

  const saleOrderByIdData = await getSalesOrderByIdService(id);

  return successResponse(res, saleOrderByIdData, "Sale Order data fetched successfully by id", STATUSCODE.OK);
})


export const processSalesOrder = catchAsync(async(req,res)=>{
    req.component = ENTITY.so

    const data = req.body;

    console.log(data);
    

    const processedSalesOrderData = await processSalesOrderService(data);

   return successResponse(res, processedSalesOrderData, "Sale Order process successfully", STATUSCODE.OK);
})
