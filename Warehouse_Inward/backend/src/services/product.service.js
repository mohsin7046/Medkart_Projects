import { prisma } from '../utilities/import.config.js';
import { STATUS, PREFIX, LIMIT } from '../utilities/constant.js';
import crypto from 'crypto'

export const addProductService = async (data) => {
  if (data.product_mrp < data.product_price) {
    throw new Error("Product MRP must be equal or greater than price");
  }

  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  const product_code = `${PREFIX.PRODUCT + randomStr}`;

  const products = await prisma.product.create({
    data: {
      ...data,
      product_code,
    },
  });

  return products
};


export const getAllProductsService = async (page, limit, orderBy) => {
  const skip = (page - 1) * limit;

  const totalItems = await prisma.product.count();
  const allProducts = await prisma.product.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: orderBy },
  });

  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return { allProducts, metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage } };
};



export const searchProductService = async (q) => {
  const searchProduct = await prisma.product.findMany({
    where: {
      name: {
        contains: q,
        mode: "insensitive",
      },
      status: STATUS.ACTIVE,
    },
    select: {
      product_code: true,
      name: true,
    },
    take: LIMIT.PRODUCT_LIMIT,
  });

  return searchProduct;
};


export const updateProductService = async (formData) => {
  if (!formData.product_code) {
    throw new Error("Product code is required for update");
  }

  if (formData.product_mrp < formData.product_price) {
    throw new Error("Product MRP must be equal or greater than price");
  }

  const updateProduct = await prisma.product.update({
    where: { product_code: formData.product_code },
    data: {
      name: formData.name,
      category: formData.category,
      combination: formData.combination,
      product_mrp: formData.product_mrp,
      product_price: formData.product_price,
      last_purchase_price: formData.last_purchase_price,
      unit_of_measure: formData.unit_of_measure,
      hsn_code: formData.hsn_code,
      description: formData.description,
      gst_percentage: formData.gst_percentage,
      status: formData.status,
    },
  });

  return updateProduct;
};


export const deleteProductService = async (product_code) => {
  if (!product_code) {
    throw new Error("Product code is required for deletion");
  }
  const softdeleteProduct = await prisma.product.update({
    where: { product_code },
    data: {
      deletedAt: Date.now()
    }
  })
  if (!softdeleteProduct) {
    throw new Error("Product is not deleted")
  }
  return softdeleteProduct;
};

export const searchFilterProductService = async(query,page,limit)=>{
   const skip = (page - 1) * limit;
    const products = await prisma.product.findMany({
      where: query,
      skip: skip,
      take: Number(limit),
    });

    const totalItems = await prisma.product.count({
      where: query, 
    })

    const totalPages = Math.ceil(totalItems / limit);

    return {products,metadata:{page,limit,totalPages,totalItems}}
}
