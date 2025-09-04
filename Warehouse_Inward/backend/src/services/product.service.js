import { prisma } from '../utilities/import.config.js'
import { STATUS, LIMIT } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'


export const addProductService = async (data) => {
  if (data.product_mrp < data.product_price) {
    throw new Error('Product MRP must be equal or greater than price')
  }

  const product_code = generateRandom("PRODUCT");
  console.log(product_code);


  const products = await prisma.product.create({
    data: {
      ...data,
      product_code
    }
  })

  return products
}


export const searchProductService = async (q) => {
  const searchProduct = await prisma.product.findMany({
    where: {
      deleted_at: null,
      name: {
        contains: q,
        mode: 'insensitive'
      },
      status: STATUS.ACTIVE
    },
    select: {
      id: true,
      name: true
    },
    take: LIMIT.PRODUCT_LIMIT
  })


  return searchProduct
}


export const updateProductService = async (formData) => {
  if (!formData.product_code) {
    throw new Error('Product code is required for update')
  }

  if (formData.product_mrp < formData.product_price) {
    throw new Error('Product MRP must be equal or greater than price')
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
      status: formData.status
    }
  })

  return updateProduct
}


export const deleteProductService = async (product_code) => {
  if (!product_code) {
    throw new Error('Product code is required for deletion')
  }
  const softdeleteProduct = await prisma.product.update({
    where: { product_code },
    data: {
      deleted_at: new Date()
    }
  })
  if (!softdeleteProduct) {
    throw new Error('Product is not deleted')
  }
  return softdeleteProduct
}

export const getProductByIdService = async(id)=>{
  const data = await prisma.product.findUnique({
    where:{id:parseInt(id)}
  });
  console.log(data);
  
  return data;
}
