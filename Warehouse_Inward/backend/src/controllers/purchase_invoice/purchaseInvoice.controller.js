import {
  createPurchaseInvoiceService,
  deletePurchaseInvoiceService,
  getInvoiceByIdService
} from '../../services/purchaseInvoice.service.js'
import {successResponse } from '../../utilities/response.js'

import { createPurchaseInvoiceSchema } from '../../zodValidation/PurchaseInvoiceValidation/purchaseInvoiceCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'
import { STATUSCODE } from '../../utilities/constant.js'


export const createPurchaseInvoice = catchAsync(async (req, res) => {
  const data = createPurchaseInvoiceSchema.parse(req.body);
  const invoice = await createPurchaseInvoiceService(data);

  return successResponse(
    res,
    invoice,
    'Purchase invoice successfully created',
    STATUSCODE.OK
  );
})



export const deletePurchaseInvoice = catchAsync(async (req, res) => {
  const { invoice_id } = req.body;
  const deletedInvoice = await deletePurchaseInvoiceService(invoice_id);

  return successResponse(
    res,
    deletedInvoice,
    'Purchase invoice successfully deleted',
    STATUSCODE.OK
  );
})

export const getInvoiceById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const PIbyIddata = await getInvoiceByIdService(id);

  return successResponse(
    res,
    PIbyIddata,
    'Purchase Invoice data fetched successfully by id',
    STATUSCODE.OK
  );
})


