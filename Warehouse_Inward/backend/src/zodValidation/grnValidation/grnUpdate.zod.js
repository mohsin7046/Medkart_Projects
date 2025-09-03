import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'
import { STATUS } from '../../utilities/constant.js'

const goodReceiptNoteItemSchema = z.object({
  product_id: z.number().min(1, 'Product id is required').optional(),

  batch_number: z.string().min(2, 'Batch number is required').optional(),

  expiry_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid expiry_date format'
    })
    .optional(),

  recevied_qty: z
    .number()
    .int('Received quantity must be an integer')
    .nonnegative('Received quantity cannot be negative')
    .optional(),

  ordered_qty: z
    .number()
    .int('Ordered quantity must be an integer')
    .positive('Ordered quantity must be greater than 0')
    .optional(),

  item_price: z
    .number()
    .positive('Item price must be greater than 0')
    .transform(decimalConversion)
    .optional(),

  item_mrp: z
    .number()
    .positive('Item MRP must be greater than 0')
    .transform(decimalConversion)
    .optional(),

}).strict()

export const updateGoodReceiptNoteSchema = z.object({
  grn_id: z.number()
    .min(1, 'GRN number is required'),

  order_id: z
    .number()
    .min(1, 'Purchase order number is required')
    .optional(),

  received_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid received_date format'
    })
    .optional(),

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

  status: z.string()
    .refine(
      (val) => !val || (val !== STATUS.CANCELLED && val !== STATUS.COMPLETED),
      {
        message: "Status cannot be 'cancelled' or 'completed'",
      }
    ),

  items: z
    .array(goodReceiptNoteItemSchema)
    .min(1, 'At least one GRN item is required')
    .optional()
}).strict()
