import { prisma } from '../../utilities/import.config.js'


export const createVendorService = async (data) => {
  return await prisma.vendor.create({ data })
}


export const getAllVendorsService = async () => {
  return await prisma.vendor.findMany({
    orderBy: { createdAt: 'desc' }
  })
}


export const searchVendorsService = async (q) => {
  return await prisma.vendor.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      status: 'active'
    },
    select: {
      vendor_code: true,
      name: true
    },
    take: 10
  })
}


export const updateVendorService = async (vendor_code, data) => {
  return await prisma.vendor.update({
    where: { vendor_code },
    data
  })
}

export const deleteVendorService = async (vendor_code) => {
  return await prisma.vendor.delete({
    where: { vendor_code }
  })
}
