import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const goodReceiptNoteItemSchema = z.object({
  product_id: z
    .number({ required_error: 'Product ID is required' })
    .min(1, 'Invalid product ID'),

  batch_number: z
    .string({ required_error: 'Batch number is required' })
    .min(1, 'Batch number cannot be empty'),

  expiry_date: z
    .string({ required_error: 'Expiry date is required' })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid expiry date format',
    })
    .transform((val) => new Date(val)),

  billed_qty: z
    .number({ required_error: 'Billed quantity is required' })
    .int('Billed quantity must be an integer')
    .positive('Billed quantity must be greater than 0'),

  item_ptr: z
    .number({ required_error: 'Item PTR is required' })
    .positive('Item PTR must be greater than 0')
    .transform(decimalConversion),

  item_mrp: z
    .number({ required_error: 'Item MRP is required' })
    .positive('Item MRP must be greater than 0')
    .transform(decimalConversion),

  total_amount: z
    .number({ required_error: 'Total amount is required' })
    .nonnegative('Total amount must be 0 or greater')
    .transform(decimalConversion),
}).strict()

export const createGoodReceiptNoteSchema = z.object({
 
  vendor_id: z
    .number({ required_error: 'Vendor ID is required' })
    .min(1, 'Invalid vendor ID'),

  gate_pass_id: z
    .number({ required_error: 'Gate Pass ID is required' })
    .min(1, 'Invalid gate pass ID'),

  total_amount: z
    .number({ required_error: 'Total amount is required' })
    .nonnegative('Total amount must be 0 or greater'),

  total_qty: z
    .number({ required_error: 'Total quantity is required' })
    .int('Total quantity must be an integer')
    .nonnegative('Total quantity must be 0 or greater'),

  total_products: z
    .number({ required_error: 'Total products count is required' })
    .int('Total products must be an integer')
    .positive('There must be at least one product'),

  items: z
    .array(goodReceiptNoteItemSchema)
    .min(1, 'At least one GRN item is required'),
}).strict()
