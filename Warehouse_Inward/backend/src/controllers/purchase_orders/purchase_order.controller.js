import { prisma } from '../../utilities/import.config.js'
import { v4 as uuidv4 } from 'uuid'
import { createPurchaseOrderService, getAllPurchaseOrdersService, deletePurchaseOrderService, updatePurchaseOrderService,searchFilterPurchaseOrderService } from '../../services/purchaseOrder.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { FEILD } from '../../utilities/constant.js'
import { Validate } from '../../zodValidation/validate.zod.js';
import {updatePurchaseOrderSchema} from '../../zodValidation/purchaseOrderValidation/purchaseOrderUpdate.zod.js'
import {createPurchaseOrderSchema} from '../../zodValidation/purchaseOrderValidation/purchaseOrderCreate.zod.js'


export const createPurchaseOrder = async (req, res) => {
  try {
    const data = Validate(createPurchaseOrderSchema);
    if(!data){
    return errorResponse(res, "All feilds are required", 400)
  }

    data.items.map((item) => {
      if (item.item_mrp < item.item_price) {
        return res
          .status(400)
          .json({
            error: `MRP is not less than price in product ${item.product_code}`
          })
      }
    })

    const newPurchaseOrder = await createPurchaseOrderService(data);

    if (!newPurchaseOrder) {
      return errorResponse(res, "Purchase Order not created", 400)
    }

    return successResponse(res, newPurchaseOrder, "Successfully created purchase Order", 200)
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return errorResponse(res, "Failed to created Purchase Order", 500)
  }
}


export const getAllPurchaseOrders = async (req, res) => {
  try {

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const orderBy = req.query.orderBy;

    const orders = await getAllPurchaseOrdersService(page,limit,orderBy);

    if (!orders) {
      return errorResponse(res, "Purchase Order not fetch", 400)
    }

    return successResponse(res, orders, "Successfully getALL purchase Order", 200)
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return errorResponse(res, "Failed to fetch purchase orders", 500)
  }
}

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { purchase_order_number } = req.body

    const deletePurchaseOrder = await deletePurchaseOrderService(purchase_order_number);

    if (!deletePurchaseOrder) {
      return errorResponse(res, "Purchase Order not deleted", 400)
    }

    return successResponse(res, deletePurchaseOrder, "Successfully deleted purchase Order", 200)
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return errorResponse(res, "Failed to delete purchase orders", 500)
  }
}

export const updatePurchaseOrder = async (req, res) => {
  const formData = Validate(updatePurchaseOrderSchema);

  if(!formData){
    return errorResponse(res, "All feilds are required", 400)
  }

  try {

    const updatedOrder = await updatePurchaseOrderService(formData)

    if (!updatedOrder) {
      return errorResponse(res, "Purchase Order not updated", 400)
    }

    return successResponse(res, updatedOrder, "Successfully updated purchase Order", 200)
  } catch (error) {
    console.error('Error updating Purchase Order:', error)
    return errorResponse(res, "Failed to update purchase order", 500)
  }
}

export const searchFilterPurchaseOrder = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    if (search) {
      query.OR = FEILD.PURCHASE_ORDER_FEILD.map((item) => ({
        [item]: { contains: search, mode: 'insensitive' }
      }));
    }

    if (status) {
      query.status = status;
    }

    const getSearchFilter = await searchFilterPurchaseOrderService(query, page, limit);

    if (!getSearchFilter) {
      return errorResponse(res, "Product not searched or filtered", 400);
    }

    return successResponse(res, getSearchFilter, "Successfully Search or filter the product", 200);

  } catch (error) {
    console.error('Error searching or filtering product:', error);
    return errorResponse(res, "FAiled to searched or filtered Products", 500);
  }
};
