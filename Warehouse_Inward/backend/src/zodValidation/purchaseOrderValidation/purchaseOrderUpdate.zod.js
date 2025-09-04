import { z } from 'zod'
import { decimalConversion } from '../../utilities/decimal.conversion.js'
import { STATUS } from '../../utilities/constant.js'
import { statusSchema } from '../statusSchemaValidate.js'

const purchaseOrderItemSchema = z.object({
  product_id: z
    .number()
    .min(1, 'Product id must be at least 2 characters long'),

  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than 0')
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

export const updatePurchaseOrderSchema = z.object({
  vendor_id: z.number().min(1, 'Vendor id is required'),

  order_id: z.number().min(1, 'order id is required'),

  order_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid order_date format'
    })
    .optional(),

  expected_delivery_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid expected_delivery_date format'
    })
    .optional(),

 status: statusSchema("po", [STATUS.CANCELLED, STATUS.COMPLETED]).optional(),

  items: z
    .array(purchaseOrderItemSchema)
    .min(1, 'At least one order item is required')
    .optional()
}).strict()
