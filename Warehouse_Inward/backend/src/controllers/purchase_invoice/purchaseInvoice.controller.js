import { prisma } from '../../utilities/import.config.js'
import { createPurchaseInvoiceService, getAllPurchaseInvoicesService,deletePurchaseInvoiceService,searchFilterPurchaseInvoiceService} from '../../services/purchaseInvoice.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'
import { FEILD } from '../../utilities/constant.js'
import { Validate } from '../../zodValidation/validate.zod.js'
import { createPurchaseInvoiceSchema } from '../../zodValidation/PurchaseInvoiceValidation/purchaseInvoiceCreate.zod.js'

export const createPurchaseInvoice = async (req, res) => {
  try {
    const data = Validate(createPurchaseInvoiceSchema);
    
    if(!data){
    return errorResponse(res, "All feilds are required", 400)
  }

    data.items.map((item) => {
      if (item.item_mrp < item.item_price) {
        return errorResponse(res,`MRP is not less than price in product ${item.product_code}`,400)
      }
    })

    const invoice = await createPurchaseInvoiceService(data);

    if(!invoice){
      return errorResponse(res,"purchase invoice isnot created",400)
    }

    return successResponse(res,invoice,"Purchase invoice successfully created",200)
  } catch (error) {
    console.log(error)
    return errorResponse(res,'Failed to create purchase invoice',500)
  }
}



export const getAllPurchaseInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const orderBy = req.query.orderBy;

    const invoices = await getAllPurchaseInvoicesService(page,limit,orderBy);

    if(!invoices){
      return errorResponse(res,"purchase invoice not fetched",400)
    }

    return successResponse(res,invoices,"Purchase invoice successfully fetched",200)
  } catch (error) {
    console.error('Error fetching purchase invoices:', error)
    return errorResponse(res,'Failed to fetch purchase invoices',500)
  }
}

export const deletePurchaseInvoice = async (req, res) => {
  try {
    const { invoice_number } = req.body
  
    if (!invoice_number) {
      return errorResponse(res,'All feilds are required',400)
    }

    const deletedInvoice = await deletePurchaseInvoiceService(invoice_number)

    if (!deletedInvoice) {
      return errorResponse(res,'Purchase invoice is not deleted',400)
    }
   return successResponse(res,deletedInvoice,"Purchase invoice successfully deleted",200)
  } catch (error) {
    console.error('Error deleting purchase invoices:', error)
   return errorResponse(res,'Failed to delete purchase invoices',500)
  }
}

export const searchFilterPurchaseInvoice = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    if (search) {
      query.OR = FEILD.PURCHASE_INVOICE_FEILD.map((item) => ({
        [item]: { contains: search, mode: 'insensitive' }
      }));
    }

    if (status) {
      query.status = status;
    }

    const getSearchFilter = await searchFilterPurchaseInvoiceService(query, page, limit);

    if (!getSearchFilter) {
      return errorResponse(res, "Product not searched or filtered", 400);
    }

    return successResponse(res, getSearchFilter, "Successfully Search or filter the product", 200);

  } catch (error) {
    console.error('Error searching or filtering product:', error);
    return errorResponse(res, "FAiled to searched or filtered Products", 500);
  }
};
