import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const goodReceiptNoteItemSchema = z.object({
  product_id: z.number().min(1, 'Product id is required'),

  batch_number: z.string().min(1, 'Batch number is required'),

  expiry_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiry_date format'
  }),

  recevied_qty: z
    .number()
    .int('Received quantity must be an integer')
    .nonnegative('Received quantity cannot be negative'),

  ordered_qty: z  
    .number()
    .int('Ordered quantity must be an integer')
    .positive('Ordered quantity must be greater than 0'),

  item_price: z
    .number()
    .positive('Item price must be greater than 0')
    .transform(decimalConversion),

  item_mrp: z
    .number()
    .positive('Item MRP must be greater than 0')
    .transform(decimalConversion),

})

export const createGoodReceiptNoteSchema = z.object({
  order_id: z.number().min(1, 'Purchase id number is required'),

  received_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid received_date format'
  }),

  damaged_qty: z
    .number()
    .int('Damaged quantity must be an integer')
    .nonnegative('Damaged quantity cannot be negative')
    .optional(),

  shortage_qty: z
    .number()
    .int('Shortage quantity must be an integer')
    .nonnegative('Shortage quantity cannot be negative')
    .optional(),

  items: z
    .array(goodReceiptNoteItemSchema)
    .min(1, 'At least one GRN item is required')
})
