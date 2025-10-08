import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'
import { STATUS } from '../../utilities/constant.js'
import { statusSchema } from '../statusSchemaValidate.js'

const goodReceiptNoteItemUpdateSchema = z.object({
  product_id: z.number().min(1, 'Invalid product ID').optional(),

  batch_number: z.string().min(1, 'Batch number cannot be empty').optional(),

  expiry_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid expiry date format',
    })
    .transform((val) => new Date(val))
    .optional(),

  billed_qty: z
    .number()
    .int('Billed quantity must be an integer')
    .positive('Billed quantity must be greater than 0')
    .optional(),

  item_ptr: z
    .number()
    .positive('Item PTR must be greater than 0')
    .transform(decimalConversion)
    .optional(),

  item_mrp: z
    .number()
    .positive('Item MRP must be greater than 0')
    .transform(decimalConversion)
    .optional(),

  total_amount: z
    .number()
    .nonnegative('Total amount must be 0 or greater')
    .transform(decimalConversion)
    .optional(),
}).strict()

export const updateGoodReceiptNoteSchema = z
  .object({
    grn_id: z
      .number({ required_error: 'GRN ID is required' })
      .min(1, 'Invalid GRN ID'),

    vendor_id: z.number().min(1, 'Invalid vendor ID').optional(),

    gate_pass_id: z.number().min(1, 'Invalid gate pass ID').optional(),

    total_amount: z
      .number()
      .nonnegative('Total amount must be 0 or greater')
      .optional(),

    total_qty: z
      .number()
      .int('Total quantity must be an integer')
      .nonnegative('Total quantity must be 0 or greater')
      .optional(),

    total_products: z
      .number()
      .int('Total products must be an integer')
      .positive('There must be at least one product')
      .optional(),

    items: z
      .array(goodReceiptNoteItemUpdateSchema)
      .min(1, 'At least one GRN item is required')
      .optional(),
  })
  .strict()
