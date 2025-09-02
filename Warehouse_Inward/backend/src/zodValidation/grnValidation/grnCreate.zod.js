import { z } from "zod";
import { decimalConversion } from "../../utilities/decimal.conversion.js";


const goodReceiptNoteItemSchema = z.object({
  product_code: z.string()
    .min(2, "Product code is required"),

  batch_number: z.string()
    .min(1, "Batch number is required"),

  expiry_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid expiry_date format",
    }),

  recevied_qty: z.number()
    .int("Received quantity must be an integer")
    .nonnegative("Received quantity cannot be negative"),

  ordered_qty: z.number()
    .int("Ordered quantity must be an integer")
    .positive("Ordered quantity must be greater than 0"),

  item_price: z.number()
    .positive("Item price must be greater than 0")
    .transform(decimalConversion),

  item_mrp: z.number()
    .positive("Item MRP must be greater than 0")
    .transform(decimalConversion),

  totalAmount: z.number()
    .positive("Total amount must be greater than 0")
    .transform(decimalConversion),
});


export const createGoodReceiptNoteSchema = z.object({
  purchase_order_number: z.string()
    .min(3, "Purchase order number is required"),

  received_date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid received_date format",
    }),

  total_amount: z.number()
    .positive("Total amount must be greater than 0")
    .transform(decimalConversion),

  damaged_qty: z.number()
    .int("Damaged quantity must be an integer")
    .nonnegative("Damaged quantity cannot be negative")
    .optional(),

  shortage_qty: z.number()
    .int("Shortage quantity must be an integer")
    .nonnegative("Shortage quantity cannot be negative")
    .optional(),

  status: z.string()
    .default("pending"),

  items: z.array(goodReceiptNoteItemSchema)
    .min(1, "At least one GRN item is required"),
});
