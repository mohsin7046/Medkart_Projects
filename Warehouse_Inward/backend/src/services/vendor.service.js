import { prisma } from '../../utilities/import.config.js'
import { STATUS, PREFIX,LIMIT } from '../src/utilities/constant.js';


export const createVendorService = async (data) => {

  const vendor_code = `${PREFIX.VENDOR + Date.now()}`

  const createVendor = await prisma.vendor.create({
    data: {
      ...data,
      vendor_code
    }
  });
  return createVendor;
}


export const getAllVendorsService = async (page, limit, orderBy) => {
  const skip = (page - 1) * limit;

  const totalItems = await prisma.vendor.count();
  const allVendors = await prisma.vendor.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: orderBy },
  });

  const totalPages = Math.ceil(totalItems / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return { allVendors, metadata: { page, limit, totalPages, totalItems, hasNextPage, hasPrevPage } };
}


export const searchVendorsService = async (q) => {
  const searchVendor = await prisma.vendor.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
      status: STATUS.ACTIVE
    },
    select: {
      vendor_code: true,
      name: true
    },
    take: LIMIT.VENDOR_LIMIT
  })

  return searchVendor;
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
      deletedAt: Date.now()
    }
  })
  if (!softdeleteVendor) {
    throw new Error("Product is not deleted")
  }

  return softdeleteVendor;
}


export const searchFilterVendorService = async(query,page,limit)=>{
   const skip = (page - 1) * limit;
    const vendors = await prisma.vendor.findMany({
      where: query,
      skip: skip,
      take: Number(limit),
    });

    const totalItems = await prisma.vendor.count({
      where: query,
    })

    const totalPages = Math.ceil(totalItems / limit);

    return {vendors,metadata:{page,limit,totalPages,totalItems}}
}
