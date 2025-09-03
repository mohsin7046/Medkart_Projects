import {
  findPOByOrderNumber,
  getALLGRNService,
  findGRNByNumber,
  createGRNRecord,
  updateGRNRecord,
  deleteGRNRecord,
  deleteGRNItemsById,
} from '../../services/grn.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import {STATUS } from '../../utilities/constant.js'
import { updateGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'

export const createGRN = catchAsync(async (req, res) => {
  const data = createGoodReceiptNoteSchema.parse(req.body)

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  data.items.map((item) => {
    if (parseFloat(item.item_mrp) < parseFloat(item.item_price)) {
      return res.status(400).json({
        error: `MRP is not less than price in product ${item.product_code}`
      })
    }
  })

  const existingPO = await findPOByOrderNumber(data.purchase_order_id)

  if (!existingPO) {
    return errorResponse(res, "'Purchase order not found'", 400)
  }

  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingPO.status)) {
    return errorResponse(res, "'GRN already created for this order'", 400)
  }

  const createGRN = await createGRNRecord(existingPO, data)

  if (!createGRN) {
    return errorResponse(res, 'GRN isnot created', 400)
  }

  return successResponse(res, createGRN, 'Successfully created GRN', 200)
})

export const getAllGRNs = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const orderBy = req.query.orderBy

  const getGRNS = await getALLGRNService(page, limit, orderBy)
  if (!getGRNS) {
    return errorResponse(res, 'GRN not fetched', 400)
  }
  return successResponse(res, getGRNS, 'Successfully get all GRN')
})

export const updateGRN = catchAsync(async (req, res) => {
  const data = updateGoodReceiptNoteSchema.parse(req.body)

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const existingGRN = await findGRNByNumber(data.grn_number)

  if (!existingGRN) {
    return errorResponse(res, 'GRN not found', 400)
  }

  const updateGRN = await updateGRNRecord(existingGRN, data)

  if (!updateGRN) {
    return errorResponse(res, 'GRN is not updated', 400)
  }

  return successResponse(res, updateGRN, 'Successfully updated GRN', 200)
})

export const deleteGRN = catchAsync(async (req, res) => {
  const { grn_number } = req.body

  const existingGRN = await findGRNByNumber(grn_number)

  if (!existingGRN) {
    return errorResponse(res, 'GRN not found', 400)
  }

  const deleteGRNItems = deleteGRNItemsById(grn_number);

  if(!deleteGRNItems){
     return errorResponse(res, 'GRNItems not found', 400)
  }

  const deletedGRN = deleteGRNRecord(grn_number)

  if (!deletedGRN) {
    return errorResponse(res, 'GRN not found', 400)
  }

  return successResponse(res, deleteGRN, 'GRN deleted succesfully', 200)
})

