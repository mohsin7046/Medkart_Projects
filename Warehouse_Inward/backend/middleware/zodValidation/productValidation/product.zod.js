import { decimalConversion } from "../../../utilities/decimal.conversion";

export const createProductSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name must not exceed 100 characters"),
  
  category: z.string()
    .min(2, "Category must be at least 2 characters long"),

  combination: z.union([
    z.string().min(1, "Combination must not be empty"),
    z.array(z.string().min(1, "Each combination must not be empty"))
  ]),

  product_mrp: z.number()
    .positive("MRP must be a positive number")
    .transform(decimalConversion),

  product_price: z.number()
    .positive("Price must be a positive number")
    .transform(decimalConversion),

  last_purchase_price: z.number()
    .nonnegative("Last purchase price cannot be negative")
    .transform(decimalConversion),

  unit_of_measure: z.string()
    .min(1, "Unit of measure is required"),

  hsn_code: z.number()
    .int("HSN code must be an integer")
    .gte(1000, "HSN code must be at least 4 digits"),

  gst_percentage: z.number()
    .min(0, "GST % must be at least 0")
    .max(100, "GST % cannot exceed 100")
    .transform(decimalConversion),

  description: z.string()
    .max(10, "Description should not exceed 10 characters"),

  status: z.string()
});
