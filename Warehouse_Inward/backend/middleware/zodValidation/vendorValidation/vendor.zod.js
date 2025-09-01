import { z } from 'zod'

export const createVendorSchema = z.object({
  name: z.string()
    .min(3, "Vendor name must be at least 3 characters long")
    .max(100, "Vendor name must not exceed 100 characters"),

  email: z.string()
    .email("Invalid email format"),

  contact_person: z.string()
    .min(3, "Contact person name must be at least 3 characters long"),

  contact_number: z.string()
    .regex(/^[0-9]{10}$/, "Contact number must be exactly 10 digits")
    .nullable(),

  gst_number: z.string(),

  address: z.string()
    .min(5, "Address must be at least 5 characters long")
    .max(255, "Address cannot exceed 255 characters"),

  status: z.string()
});