import { prisma } from '../../utilities/import.config.js'
import { createPurchaseInvoiceService, getAllPurchaseInvoicesService,deletePurchaseInvoiceService} from '../../services/purchaseInvoice.service.js'
import { errorResponse, successResponse } from '../../utilities/response.js'

export const createPurchaseInvoice = async (req, res) => {
  try {
    const data = req.body

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
    const invoices = await getAllPurchaseInvoicesService();

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
