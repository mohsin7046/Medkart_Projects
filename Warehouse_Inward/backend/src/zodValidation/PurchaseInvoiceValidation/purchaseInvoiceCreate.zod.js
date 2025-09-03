import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const purchaseInvoiceItemSchema = z.object({
  product_id: z.number().min(1, 'Product id is required'),

  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0'),

  item_price: z
    .number()
    .positive('Item price must be greater than 0')
    .transform(decimalConversion),

  item_mrp: z
    .number()
    .positive('Item MRP must be greater than 0')
    .transform(decimalConversion),
}).strict()

export const createPurchaseInvoiceSchema = z.object({
  grn_id: z.number().min(1, 'GRN id is required'),

  invoice_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid invoice_date format'
  }),

  items: z
    .array(purchaseInvoiceItemSchema)
    .min(1, 'At least one invoice item is required')
}).strict()
