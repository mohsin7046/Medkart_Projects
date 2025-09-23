import { decimalConversion } from '../../utilities/decimal.conversion.js'
import { z } from 'zod';
import { statusSchema } from '../statusSchemaValidate.js'

export const updateProductSchema = z.object({
  id: z.number().optional(),
  product_code: z.string()
    .optional(),

  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .optional(),

  category: z
    .string()
    .min(2, 'Category must be at least 2 characters long')
    .optional(),

  combination: z
    .union([
      z.string().min(1, 'Combination must not be empty'),
      z.array(z.string().min(1, 'Each combination must not be empty'))
    ])
    .optional(),

  product_mrp: z
    .number()
    .positive('MRP must be a positive number')
    .transform(decimalConversion)
    .optional(),

  product_price: z
    .number()
    .positive('Price must be a positive number')
    .transform(decimalConversion)
    .optional(),

  last_purchase_price: z
    .number()
    .nonnegative('Last purchase price cannot be negative')
    .transform(decimalConversion)
    .optional(),

  unit_of_measure: z.string().min(1, 'Unit of measure is required').optional(),

  hsn_code: z
    .string()
    .min(4, 'HSN code must be at least 4 digits')
    .optional(),

  gst_percentage: z
    .number()
    .min(0, 'GST % must be at least 0')
    .max(100, 'GST % cannot exceed 100')
    .transform(decimalConversion)
    .optional(),

  description: z
    .string()
    .max(100, 'Description should not exceed 10 characters')
    .optional(),

  status: statusSchema("product").optional(),

  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional().nullable(),
  deleted_at: z.string().datetime().optional().nullable(),
}).strict()
