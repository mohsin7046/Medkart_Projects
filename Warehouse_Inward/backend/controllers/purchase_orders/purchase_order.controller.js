import { prisma } from '../../utilities/import.config.js'
import { v4 as uuidv4 } from 'uuid'
import { createPurchaseOrderService, getAllPurchaseOrdersService, deletePurchaseOrderService, updatePurchaseOrderService } from '../../services/purchaseOrder.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'


export const createPurchaseOrder = async (req, res) => {
  try {
    const data = req.body

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
    const orders = await getAllPurchaseOrdersService();

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
  const formData = req.body

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
