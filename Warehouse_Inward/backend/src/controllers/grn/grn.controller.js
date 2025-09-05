import {
  findPOByOrderNumber,
  findGRNByNumber,
  createGRNRecord,
  updateGRNRecord,
  deleteGRNRecord,
  deleteGRNItemsById,
  getGRNByIdService
} from '../../services/grn.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { SETEXPIRY, STATUS } from '../../utilities/constant.js'
import { updateGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnUpdate.zod.js'
import { createGoodReceiptNoteSchema } from '../../zodValidation/grnValidation/grnCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { checkExpiry } from '../../utilities/checkExpiry.js'
import logger from '../../utilities/logger.js'


export const createGRN = catchAsync(async (req, res) => {
  const data = createGoodReceiptNoteSchema.parse(req.body)

  if (!data) {
    logger.error(data.error) 
    return errorResponse(res, 'All feilds are required', 400)
  }

  data.items.map((item) => {
    if (item.item_mrp < item.item_price) {
      logger.error(`MRP is not less than price in product ${item.product_id}`)
      return errorResponse(res, `MRP is not less than price in product ${item.product_id}`, 400)
    }

    if (!checkExpiry(item.expiry_date)) {
      logger.error(`Expiry date is ${SETEXPIRY.expiryMonth} month always greater`)
      return errorResponse(res, `Expiry date is ${SETEXPIRY.expiryMonth} month always greater`, 400)
    }
  })

  const existingPO = await findPOByOrderNumber(data.order_id)

  if (!existingPO) {
    logger.error("Purchase order not found")
    return errorResponse(res, "Purchase order not found", 400)
  }

  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingPO.status)) {
    logger.error("'GRN already created for this order")
    return errorResponse(res, "GRN already created for this order", 400)
  }

  const createGRN = await createGRNRecord(existingPO, data)

  if (!createGRN) {
    logger.error('GRN isnot created')
    return errorResponse(res, 'GRN isnot created', 400)
  }

  logger.info('Successfully created GRN')
  return successResponse(res, createGRN, 'Successfully created GRN', 200)
})



export const updateGRN = catchAsync(async (req, res) => {
  console.log(req.body);
  
  const data = updateGoodReceiptNoteSchema.parse(req.body)

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }


  const existingGRN = await findGRNByNumber(data.grn_id)

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
  const { grn_id } = req.body

  const existingGRN = await findGRNByNumber(grn_id)

  if (!existingGRN) {
    return errorResponse(res, 'GRN not found', 400)
  }

  if ([STATUS.COMPLETED, STATUS.CANCELLED].includes(existingGRN.status)) {
    return errorResponse(res, 'GRN is completed or cancelled', 400)
  }

  const deleteGRNItems = deleteGRNItemsById(grn_id);

  if (!deleteGRNItems) {
    return errorResponse(res, 'GRNItems not found', 400)
  }

  const deletedGRN = deleteGRNRecord(grn_id)

  if (!deletedGRN) {
    return errorResponse(res, 'GRN not found', 400)
  }

  return successResponse(res, deleteGRN, 'GRN deleted succesfully', 200)
})

export const getGRNByID = catchAsync(async(req,res)=>{
   const {id} = req.params;
  console.log(id);
  
  const grnbyIddata = await getGRNByIdService(id);

  if(!grnbyIddata){
    errorResponse(res,"GRN not fount for the id",400)
  }

  successResponse(res,grnbyIddata,"GRN data fetch successfully by id",200)
})

