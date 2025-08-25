import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const addProduct = async (req, res) => {
    const { name,category,combination, product_mrp,product_price,last_purchase_price,unit_of_measure,hsn_code,description,status} = req.body;

    if(!name || !category || !product_mrp || !product_price || !last_purchase_price || !unit_of_measure || !hsn_code){
        return res.status(400).json({ error: "Please fill all required fields" });
    }

    const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase(); 
    const product_code = `pc-${randomStr}`;
    try {
        const newProduct = await prisma.product.create({
            data: {
                name,
                category,
                product_code,
                combination,
                product_mrp:parseFloat(product_mrp),
                product_price:parseFloat(product_price),
                last_purchase_price:parseFloat(last_purchase_price),
                unit_of_measure,
                hsn_code:parseInt(hsn_code),
                description,
                status
            },
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Failed to create product" });
    }
    
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
}



export const getProductSearch = async (req, res) => {
  try {
    const { q} = req.params;
    console.log(q);
    
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: q,
          mode:"insensitive"
        },
        status:'active'
      },
      select: {
        product_code: true,
        name: true
      },
      take: 2
    });
    res.json(products);
  } catch (err) {
    console.error("Products search error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}

export const updateProduct = async (req, res) => {
  const formData= req.body;
  console.log(formData);
  
  if(!formData.product_code){
    return res.status(400).json({ error: "Product ID is required for update" });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { product_code:formData.product_code },
      data: {
        name: formData.name,
        category: formData.category,
        combination: formData.combination,
        product_mrp: parseFloat(formData.product_mrp),
        product_price: parseFloat(formData.product_price),
        last_purchase_price: parseFloat(formData.last_purchase_price),
        unit_of_measure: formData.unit_of_measure,
        hsn_code: parseInt(formData.hsn_code),
        description: formData.description,
        status: formData.status
      },
    });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
}

export const deleteProduct = async (req, res) => {
  const {product_code} = req.body;
  if(!product_code){
    return res.status(400).json({ error: "Product code is required for deletion" });
  }

  try {
    const deletedProduct = await prisma.product.delete({
      where: { product_code: product_code },
    });
    res.status(200).json({ message: "Product deleted successfully", deletedProduct });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
}