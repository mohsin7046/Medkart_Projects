import { z } from 'zod'

const salesOrderProductSchema = z.object({
  product_id: z
  .number({
    required_error: 'Product is required',
    invalid_type_error: 'Product must be a number',
  })
  .min(1, 'Product id must be greater than 0'),

  ordered_qty: z
    .number()
    .int('Ordered quantity must be an integer')
    .positive('Ordered quantity must be greater than 0'),

}).strict()
  
 
export const createSalesOrderSchema = z.object({
  name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters long'),

  email: z
    .string()
    .email('Invalid email format'),

  contact_number: z
    .string()
    .min(10, 'Contact number must be at least 10 digits')
    .max(15, 'Contact number must not exceed 15 digits'),

  address: z.string().optional(),

  order_type: z.enum(['B2C', 'B2B'], {
    errorMap: () => ({ message: 'Order type must be either B2C or B2B' }),
  }),

  items: z
    .array(salesOrderProductSchema)
    .min(1, 'At least one product is required'),
}).strict()
