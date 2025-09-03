import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const purchaseInvoiceItemSchema = z.object({
  product_code: z.string().min(2, 'Product code is required'),

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

  totalAmount: z
    .number()
    .positive('Total amount must be greater than 0')
    .transform(decimalConversion)
})

export const createPurchaseInvoiceSchema = z.object({
  grn_number: z.string().min(3, 'GRN number is required'),

  invoice_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid invoice_date format'
  }),

  total_amount: z
    .number()
    .positive('Total amount must be greater than 0')
    .transform(decimalConversion),

  status: z.string().default('pending'),

  items: z
    .array(purchaseInvoiceItemSchema)
    .min(1, 'At least one invoice item is required')
})
