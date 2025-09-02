import { z } from 'zod'
import { decimalConversion } from '../../../utilities/decimal.conversion'

const purchaseOrderItemSchema = z.object({
  product_code: z
    .string()
    .min(2, 'Product code must be at least 2 characters long'),

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

export const createPurchaseOrderSchema = z.object({
  vendor_code: z.string().min(2, 'Vendor code is required'),

  order_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid order_date format'
  }),

  expected_delivery_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expected_delivery_date format'
  }),

  total_amount: z
    .number()
    .positive('Total amount must be greater than 0')
    .transform(decimalConversion),

  status: z
    .enum(['pending', 'partially received', 'completed', 'cancelled'])
    .default('pending'),

  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'At least one order item is required')
})
