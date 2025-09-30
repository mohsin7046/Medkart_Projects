import { z } from 'zod'


const salesOrderProductSchema = z.object({
  product_id: z
    .number({
    required_error: 'Product is required',
    invalid_type_error: 'Product must be a number',
    })
    .min(1, 'Product id is required').optional(),

    vendor_id: z
    .number()
    .nullable()
    .optional(),

  ordered_qty: z
    .number()
    .int('Ordered quantity must be an integer')
    .positive('Ordered quantity must be greater than 0').optional(),

}).strict()


export const updateSalesOrderSchema = z.object({
  sales_order_id: z.number().optional(),
  name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters long').optional(),

  email: z
    .string()
    .email('Invalid email format').optional(),

  contact_number: z
    .string()
    .min(10, 'Contact number must be at least 10 digits')
    .max(15, 'Contact number must not exceed 15 digits').optional(),

  address: z.string().optional(),

  order_type: z.enum(['B2C', 'B2B'], {
    errorMap: () => ({ message: 'Order type must be either B2C or B2B' }),
  }).optional(),

  items: z
    .array(salesOrderProductSchema)
    .min(1, 'At least one product is required').optional(),
}).strict()
