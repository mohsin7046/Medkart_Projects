import { z } from 'zod'

export const createProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    category: z.string(),
    combination:z.string(),
    product_mrp:z.float32(),
    product_price:z.float32(),
    last_purchase_price:z.float32(),
    unit_of_measure:z.string(),
    hsn_code:z.int().min(4,'hsn_code must be atleast 4 character long'),
    gst_percentage:z.float32(),
    description:z.string(),
    status:z.string()
});
