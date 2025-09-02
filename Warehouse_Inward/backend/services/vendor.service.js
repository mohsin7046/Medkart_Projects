import { prisma } from '../../utilities/import.config.js'
import { STATUS,PREFIX } from '../utilities/constant.js';


export const createVendorService = async (data) => {

   const vendor_code = `${PREFIX.VENDOR+Date.now()}`

  const createVendor =  await prisma.vendor.create({ 
    data:{
      ...data,
      vendor_code
    }
   });
  return createVendor;
}


export const getAllVendorsService = async () => {
  const allvendor =  await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return allvendor
}


export const searchVendorsService = async (q) => {
  const searchVendor =  await prisma.vendor.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      status: STATUS.ACTIVE
    },
    select: {
      vendor_code: true,
      name: true
    },
    take: 10
  })

  return searchVendor;
}


export const updateVendorService = async (data) => {
  const updatedVendor =  await prisma.vendor.update({
    where: { vendor_code: data.vendor_code },
    data: {
      ...data
    }
  })

  return updatedVendor
}
 
export const deleteVendorService = async (vendor_code) => {
  const softdeleteVendor = await prisma.vendor.update({
      where:{vendor_code},
      data:{
        deletedAt:Date.now()
      }
    })
    if(!softdeleteVendor){
      throw new Error("Product is not deleted")
    }

  return softdeleteVendor;
}
