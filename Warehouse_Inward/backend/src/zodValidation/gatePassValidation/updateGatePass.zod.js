import { z } from 'zod'
export const updateGatePassSchema = z
  .object({
    gate_pass_number: z
      .string({
        invalid_type_error: 'Gate pass number must be a string',
      })
      .min(1, 'Gate pass number cannot be empty')
      .optional(),

    vendor_id: z
      .number({
        invalid_type_error: 'Vendor ID must be a number',
      })
      .min(1, 'Invalid Vendor ID')
      .optional(),

    inward_type: z
      .enum(['Purchase Inward', 'Good Return'], {
        invalid_type_error: 'Inward type must be either "Purchase Inward" or "Good Return"',
      })
      .optional(),

    invoice_date: z
      .string({
        invalid_type_error: 'Invoice date must be a string',
      })
      .transform((val) => new Date(val))
      .optional(),

    invoice_amount: z
      .number({
        invalid_type_error: 'Invoice amount must be a number',
      })
      .nonnegative('Invoice amount must be 0 or greater')
      .optional(),

    no_of_boxes: z
      .number({
        invalid_type_error: 'Number of boxes must be a number',
      })
      .int('Number of boxes must be an integer')
      .positive('Number of boxes must be greater than 0')
      .optional(),

  })
  .strict()
