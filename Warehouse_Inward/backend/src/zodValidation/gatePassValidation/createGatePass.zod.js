import { z } from 'zod'

export const createGatePassSchema = z.object({

  vendor_id: z
    .number({
      required_error: 'Vendor ID is required',
      invalid_type_error: 'Vendor ID must be a number',
    })
    .min(1, 'Invalid Vendor ID'),

  inward_type: z.enum(['purchase inward', 'good return'], {
    required_error: 'Inward type is required',
    invalid_type_error: 'Inward type must be either "Purchase Inward" or "Good Return"',
  }),

  invoice_amount: z
    .number({
      required_error: 'Invoice amount is required',
      invalid_type_error: 'Invoice amount must be a number',
    })
    .nonnegative('Invoice amount must be 0 or greater'),

  no_of_boxes: z
    .number({
      required_error: 'Number of boxes is required',
      invalid_type_error: 'Number of boxes must be a number',
    })
    .int('Number of boxes must be an integer')
    .positive('Number of boxes must be greater than 0'),

}).strict()
