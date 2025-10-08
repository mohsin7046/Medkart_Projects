import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const purchaseOrderItemSchema = z.object({
  product_id: z
    .number({
      required_error: 'Product ID is required',
      invalid_type_error: 'Product ID must be a number',
    })
    .min(1, 'Invalid Product ID'),

  ordered_qty: z
    .number({
      required_error: 'Ordered quantity is required',
      invalid_type_error: 'Ordered quantity must be a number',
    })
    .int('Ordered quantity must be an integer')
    .positive('Ordered quantity must be greater than 0'),

  net_cost_per_qty: z
    .number({
      required_error: 'Net cost per quantity is required',
      invalid_type_error: 'Net cost per quantity must be a number',
    })
    .positive('Net cost per quantity must be greater than 0')
    .transform(decimalConversion),

}).strict()

export const createPurchaseOrderSchema = z.object({
  vendor_id: z
    .number({
      required_error: 'Vendor ID is required',
      invalid_type_error: 'Vendor ID must be a number',
    })
    .min(1, 'Invalid Vendor ID'),

  purchase_indent_id: z
    .number({
      invalid_type_error: 'Purchase indent ID must be a number',
    })
    .optional()
    .nullable(),

  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'At least one order item is required'),
}).strict()
