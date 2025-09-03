import {
  createPurchaseOrderService,
  getAllPurchaseOrdersService,
  deletePurchaseOrderService,
  updatePurchaseOrderService,
} from '../../services/purchaseOrder.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { updatePurchaseOrderSchema } from '../../zodValidation/purchaseOrderValidation/purchaseOrderUpdate.zod.js'
import { createPurchaseOrderSchema } from '../../zodValidation/purchaseOrderValidation/purchaseOrderCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'



export const createPurchaseOrder = catchAsync(async (req, res) => {
  const data = createPurchaseOrderSchema.parse(req.body)
  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  if(data.expected_delivery_date <= data.order_date){
    return errorResponse(res,"expected_delivery_date is always greater than order_date",400)
  }

  data.items.map((item) => {
    if (item.item_mrp < item.item_price) {
      return errorResponse(res,`MRP is not less than price in product ${item.product_id}`,400)
    }
  })

  const newPurchaseOrder = await createPurchaseOrderService(data)

  if (!newPurchaseOrder) {
    return errorResponse(res, 'Purchase Order not created', 400)
  }

  return successResponse(
    res,
    newPurchaseOrder,
    'Successfully created purchase Order',
    200
  )
})


export const getAllPurchaseOrders = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const orderBy = req.query.orderBy

  const orders = await getAllPurchaseOrdersService(page, limit, orderBy)

  if (!orders) {
    return errorResponse(res, 'Purchase Order not fetch', 400)
  }

  return successResponse(res, orders, 'Successfully getALL purchase Order', 200)
})


export const deletePurchaseOrder = catchAsync(async (req, res) => {
  const { order_id } = req.body

  const deletePurchaseOrder = await deletePurchaseOrderService(order_id)

  if (!deletePurchaseOrder) {
    return errorResponse(res, 'Purchase Order not deleted', 400)
  }

  return successResponse(
    res,
    deletePurchaseOrder,
    'Successfully deleted purchase Order',
    200
  )
})



export const updatePurchaseOrder = catchAsync(async (req, res) => {
  const formData = updatePurchaseOrderSchema.parse(req.body)

  if (!formData) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const updatedOrder = await updatePurchaseOrderService(formData)

  if (!updatedOrder) {
    return errorResponse(res, 'Purchase Order not updated', 400)
  }

  return successResponse(
    res,
    updatedOrder,
    'Successfully updated purchase Order',
    200
  )
})
