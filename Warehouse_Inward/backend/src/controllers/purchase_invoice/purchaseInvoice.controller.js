import {
  createPurchaseInvoiceService,
  deletePurchaseInvoiceService,
  getInvoiceByIdService
} from '../../services/purchaseInvoice.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'

import { createPurchaseInvoiceSchema } from '../../zodValidation/PurchaseInvoiceValidation/purchaseInvoiceCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'



export const createPurchaseInvoice = catchAsync(async (req, res) => {
  const data = createPurchaseInvoiceSchema.parse(req.body)
 
  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  data.items.map((item) => {
    if (item.item_mrp < item.item_price) {
      return errorResponse(
        res,
        `MRP is not less than price in product ${item.product_id}`,
        400
      )
    }
  })

  const invoice = await createPurchaseInvoiceService(data)

  if (!invoice) {
    return errorResponse(res, 'purchase invoice isnot created', 400)
  }

  return successResponse(
    res,
    invoice,
    'Purchase invoice successfully created',
    200
  )
})



export const deletePurchaseInvoice = catchAsync(async (req, res) => {
  const { invoice_number } = req.body

  if (!invoice_number) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  const deletedInvoice = await deletePurchaseInvoiceService(invoice_number)

  if (!deletedInvoice) {
    return errorResponse(res, 'Purchase invoice is not deleted', 400)
  }
  return successResponse(
    res,
    deletedInvoice,
    'Purchase invoice successfully deleted',
    200
  )
})

export const getInvoiceById = catchAsync(async(req,res)=>{
  const {id} = req.params;
  console.log(id);
  
  const PIbyIddata = await getInvoiceByIdService(id);

  if(!PIbyIddata){
    errorResponse(res,"Purchase Invoice not fount for the id",400)
  }

  successResponse(res,PIbyIddata,"Purchase Invoice data fetch successfully by id",200)
})


