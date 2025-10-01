import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'

const purchaseOrderItemSchema = z.object({
  product_id: z
    .number()
    .min(1, 'Product id must be at least 2 characters long'),

  ordered_qty: z
    .number()
    .int('Order quantity must be an integer')
    .positive('Order quantity must be greater than 0'),

  net_cost_per_qty: z
    .number()
    .positive('Item net_cost_per_qty must be greater than 0')
    .transform(decimalConversion),
 
}).strict()

export const createPurchaseOrderSchema = z.object({
  vendor_id: z.number().min(1, 'Vendor id is required'),

  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'At least one order item is required')
}).strict()
