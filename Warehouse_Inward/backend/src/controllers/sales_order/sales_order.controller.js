import { successResponse } from '../../utilities/response.js'

import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'
import { createSaleOrderService,updateSaleOrderService,deleteSalesOrderService,getSalesOrderByIdService,processSalesOrderService,getSalesOrderForEditByIdService,confirmSalesOrderService} from '../../services/salesOrder.service.js'

export const createSalesOrder = catchAsync(async(req,res)=>{
 
    const data = req.body;

    console.log(data);
    
    const newSaleOrder = await createSaleOrderService(data);
    
    return successResponse(res, newSaleOrder, "Sale Order created successfully", STATUSCODE.OK);
})  


export const updateSalesOrder = catchAsync(async(req,res)=>{

    const data = req.body;
    
    const updatedSaleOrder = await updateSaleOrderService(data);
    
    return successResponse(res, updatedSaleOrder, "Sale Order updated successfully", STATUSCODE.OK);
})

export const deleteSalesOrder = catchAsync(async (req, res) => {

  const { id } = req.body

 const sales_order_id = id;

  const deletedSalesOrder = await deleteSalesOrderService(sales_order_id)

  return successResponse(res, deletedSalesOrder, 'Sale Order delete succesfully', STATUSCODE.OK)
})


export const getSalesOrderById = catchAsync(async (req, res) => {
  
    const { id } = req.params;

  const saleOrderByIdData = await getSalesOrderByIdService(id);

  return successResponse(res, saleOrderByIdData, "Sale Order data fetched successfully by id", STATUSCODE.OK);
})

export const getSalesOrderForEditById =  catchAsync(async(req,res)=>{

    const { id } = req.params;

    console.log(id);
    
  const saleOrderEditByIdData = await getSalesOrderForEditByIdService(id);

  return successResponse(res, saleOrderEditByIdData, "Sale Order data fetched successfully by id", STATUSCODE.OK);
})


export const processSalesOrder = catchAsync(async(req,res)=>{


    const data = req.body;

    console.log(data);
    
    const processedSalesOrderData = await processSalesOrderService(data);

   return successResponse(res, processedSalesOrderData, "Sale Order process successfully", STATUSCODE.OK);
})

export const confirmSalesOrder = catchAsync(async(req,res)=>{

    const {id} = req.body;

    console.log(id);

    const confirmedSalesOrderData = await confirmSalesOrderService(id);

   return successResponse(res, confirmedSalesOrderData, "Sale Order confirmed successfully", STATUSCODE.OK);
})
