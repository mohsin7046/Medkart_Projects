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


export const getAllVendorsService = async (page, limit, sortby) => {
  const skip = (page - 1) * limit

  let orderBy = {};
  if (sortby) {
    const [field, direction] = sortby.split(",");
    orderBy = {
      [field]: direction?.toLowerCase() === "d" ? "desc" : "asc"
    };
  }

  const totalItems = await prisma.vendor.count()
  const allVendors = await prisma.vendor.findMany({
    where: { deleted_at: null },
    skip,
    take: limit,
    orderBy
  })

  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    allVendors,
    metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage }
  }
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
