import { z } from 'zod'
import { statusSchema } from '../statusSchemaValidate.js'

export const updateVendorSchema = z.object({
  vendor_code: z.string()
    .optional(),

  name: z
    .string()
    .min(3, 'Vendor name must be at least 3 characters long')
    .max(100, 'Vendor name must not exceed 100 characters')
    .optional(),

  email: z.email('Invalid email format').optional(),

  contact_person: z
    .string()
    .min(3, 'Contact person name must be at least 3 characters long')
    .optional(),

  contact_number: z
    .string()
    .regex(/^[0-9]{10}$/, 'Contact number must be exactly 10 digits')
    .nullable()
    .optional(),

  gst_number: z.string().optional(),

  address: z
    .string()
    .min(5, 'Address must be at least 5 characters long')
    .max(255, 'Address cannot exceed 255 characters')
    .optional(),

  status: statusSchema("vendor").optional(),
}).strict()
