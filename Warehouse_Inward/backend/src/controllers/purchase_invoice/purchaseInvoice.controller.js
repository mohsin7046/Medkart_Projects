import {
  createPurchaseInvoiceService,
  getAllPurchaseInvoicesService,
  deletePurchaseInvoiceService,
  searchFilterPurchaseInvoiceService
} from '../../services/purchaseInvoice.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { FEILD } from '../../utilities/constant.js'
import { Validate } from '../../zodValidation/validate.zod.js'
import { createPurchaseInvoiceSchema } from '../../zodValidation/PurchaseInvoiceValidation/purchaseInvoiceCreate.zod.js'
import { catchAsync } from '../../utilities/tryCatchAsyncHandler.js'

export const createPurchaseInvoice = catchAsync(async (req, res) => {
  const data = Validate(createPurchaseInvoiceSchema)

  if (!data) {
    return errorResponse(res, 'All feilds are required', 400)
  }

  data.items.map((item) => {
    if (item.item_mrp < item.item_price) {
      return errorResponse(
        res,
        `MRP is not less than price in product ${item.product_code}`,
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

export const getAllPurchaseInvoices = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const orderBy = req.query.orderBy

  const invoices = await getAllPurchaseInvoicesService(page, limit, orderBy)

  if (!invoices) {
    return errorResponse(res, 'purchase invoice not fetched', 400)
  }

  return successResponse(
    res,
    invoices,
    'Purchase invoice successfully fetched',
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

export const searchFilterPurchaseInvoice = catchAsync(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query

  let query ={};

  if (search) {
    query.OR = FEILD.PURCHASE_INVOICE_FEILD.map((item) => ({
      [item]: { contains: search, mode: 'insensitive' }
    }))
  }

  if (status) {
    query.status = status
  }

  const getSearchFilter = await searchFilterPurchaseInvoiceService(
    query,
    page,
    limit
  )

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
