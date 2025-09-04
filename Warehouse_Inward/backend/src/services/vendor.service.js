import { prisma } from '../utilities/import.config.js'
import { STATUS, LIMIT } from '../utilities/constant.js'
import { generateRandom } from '../utilities/generateRandom.js'

export const createVendorService = async (data) => {
  const vendor_code = generateRandom("VENDOR");

  const createVendor = await prisma.vendor.create({
    data: {
      ...data,
      vendor_code
    }
  })
  return createVendor
}



export const searchVendorsService = async (q) => {
  const searchVendor = await prisma.vendor.findMany({
    where: {
      deleted_at: null,
      name: { contains: q, mode: 'insensitive' },
      status: STATUS.ACTIVE
    },
    select: {
      vendor_code: true,
      name: true
    },
    take: LIMIT.VENDOR_LIMIT
  })

  return searchVendor
}


export const updateVendorService = async (data) => {
  const updatedVendor = await prisma.vendor.update({
    where: { vendor_code: data.vendor_code },
    data: {
      ...data
    }
  })

  return updatedVendor
}


export const deleteVendorService = async (vendor_code) => {
  const softdeleteVendor = await prisma.vendor.update({
    where: { vendor_code },
    data: {
      deleted_at: new Date()
    }
  })
  if (!softdeleteVendor) {
    throw new Error('Product is not deleted')
  }

  return softdeleteVendor
}

export const getVendorByIdService = async(id) => {
  const data = await prisma.vendor.findUnique({
    where:{id:parseInt(id)}
  });
  console.log(data);
  
  return data;
}
