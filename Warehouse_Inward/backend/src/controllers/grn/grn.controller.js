import {
  findPOByOrderNumber,
  getALLGRNService,
  findGRNByNumber,
  createGRNRecord,
  updateGRNRecord,
  deleteGRNRecord,
  deleteGRNItemsById,
  searchFilterGRNService
} from '../../services/grn.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { FEILD, STATUS } from '../../utilities/constant.js'
import { Validate } from '../../zodValidation/validate.zod.js'
import { updateGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'

export const createGRN = catchAsync(async (req, res) => {
  const data = Validate(createGoodReceiptNoteSchema)

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
  const data = Validate(updateGoodReceiptNoteSchema)

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

export const searchFilterGRN = catchAsync(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query
  let query = {};

  if (search) {
    query.OR = FEILD.GRN_FEILD.map((item) => ({
      [item]: { contains: search, mode: 'insensitive' }
    }))
  }

  if (status) {
    query.status = status
  }

  const getSearchFilter = await searchFilterGRNService(query, page, limit)

  if (!getSearchFilter) {
    return errorResponse(res, 'Product not searched or filtered', 400)
  }

  return successResponse(
    res,
    getSearchFilter,
    'Successfully Search or filter the product',
    200
  )
})
