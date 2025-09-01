import { prisma } from '../utilities/import.config.js';


export const addProductService = async (data) => {
  if (data.product_mrp < data.product_price) {
    throw new Error("Product MRP must be equal or greater than price");
  }

  const product_code = generateProductCode();

  return prisma.product.create({
    data: {
      ...data,
      product_code,
    },
  });
};


export const getAllProductsService = async () => {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
};


export const searchProductService = async (q) => {
  return prisma.product.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
      status: "active",
    },
    select: {
      product_code: true,
      name: true,
    },
    take: 2,
  });
};


export const updateProductService = async (formData) => {
  if (!formData.product_code) {
    throw new Error("Product code is required for update");
  }

  if (parseFloat(formData.product_mrp) < parseFloat(formData.product_price)) {
    throw new Error("Product MRP must be equal or greater than price");
  }

  return prisma.product.update({
    where: { product_code: formData.product_code },
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
      gst_percentage: parseFloat(formData.gst_percentage),
      status: formData.status,
    },
  });
};


export const deleteProductService = async (product_code) => {
  if (!product_code) {
    throw new Error("Product code is required for deletion");
  }

  return prisma.product.delete({
    where: { product_code },
  });
};
