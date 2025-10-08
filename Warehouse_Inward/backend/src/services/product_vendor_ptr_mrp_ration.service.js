import { prisma } from "../utilities/import.config.js"
import { productLogger } from "../utilities/logger.js"


export const CreateProductVendorMrpPtrRationService = async(data)=>{
    if(!data){
        productLogger.error("All feilds are required")
    }

    const mappedData = await prisma.productVendorMrpPtrRatio.create({
        data:{
            product_id:data.product_id,
            vendor_id:data.vendor_id,
            mrp:data.mrp,
            mrp_ptr_ratio:data.mrp_ptr_ratio
        }
    })
    
    if (!mappedData) {
      productLogger.error("❌ Error while creating the mapping");
      throw new Error("Error while creating the mapping");
    }

    productLogger.info("Successfully created mapping")

    return mappedData
}

export const updateProductVendorMrpPtrRationService = async(data)=>{

    const mappedData = await prisma.productVendorMrpPtrRatio.update({
        where:{id:data.id},
        data:{
            product_id:data?.product_id,
            vendor_id:data?.vendor_id,
            mrp:data?.mrp,
            mrp_ptr_ratio:data?.mrp_ptr_ratio
        }
    })
    
    if (!mappedData) {
      productLogger.error("❌ Error while updating the mapping");
      throw new Error("Error while updating the mapping");
    }

    productLogger.info("Successfully updated mapping")

    return mappedData
}

export const getProductVendorMrpPtrRationByIdService = async(id)=>{
    if(!id){
        throw new Error("Id is required to fetched Mapped Data")
    }

    const fetchData = await prisma.productVendorMrpPtrRatio.findUnique({
        where:{id:parseInt(id)},
        select:{
            mrp:true,
            id:true,
            mrp_ptr_ratio:true,
            vendor:{
            select:{
              name:true,
              id:true
            }
          },
            product:{
            select:{
              name:true,
              id:true
            }
          },
        }
    })

    if(!fetchData){
        throw new Error("Error while fetching GatePass Data")
    }

    return fetchData
}



