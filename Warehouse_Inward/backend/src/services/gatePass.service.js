import { PREFIX, STATUS } from "../utilities/constant.js"
import { generateRandom } from "../utilities/generateRandom.js"
import { gatePassLogger } from "../utilities/logger.js";
import {GatePassRepository} from '../repository/gatePass.repository.js'
import { PurchaseOrderRepository } from "../repository/purchaseOrder.repository.js";

const gatePassRepo = new GatePassRepository()
const purchaseOrderRepo = new PurchaseOrderRepository();

export const createGatePassService = async (data) => {
    const gate_pass_number = generateRandom(PREFIX.GATEPASS);

    console.log(data);

    const gatePass = await gatePassRepo.createGatePass({
            gate_pass_number,
            vendor_id: data.vendor_id,
            inward_type:data.inward_type,
            invoice_date: new Date(),
            invoice_amount: data.invoice_amount,
            no_of_boxes: data.no_of_boxes,
            status:STATUS.INCHECKING})

    if (!gatePass) {
        gatePassLogger.error("❌ Error while creating the gatePass");
        throw new Error("Error while creating the gatePass");
    }

    const updatePO = await purchaseOrderRepo.updatePurchaseOrderByVendorId({vendor_id:data.vendor_id,status:STATUS.SENT,data:{status:STATUS.RECEVIED}})
    

    if(!updatePO){
        throw new Error("Purchase Order not found")
    }

    gatePassLogger.info("Successfully created GatePass")
    return gatePass;
}


export const updateGatePassService = async (data) => {
    
    const updatedgatePass = await gatePassRepo.updateGatePass({id:data.gate_pass_id,data:{
            vendor_id: data?.vendor_id,
            inward_type:data?.inward_type,
            invoice_amount: data?.invoice_amount,
            no_of_boxes: data?.no_of_boxes
        }})

    if (!updatedgatePass) {
        gatePassLogger.error("❌ Error while updating the gatePass");
        throw new Error("Error while updating the gatePass");
    }

    gatePassLogger.info("Successfully updated GatePass")
    return updatedgatePass;
}

export const getGatePassByIdService = async(id)=>{
    if(!id){
        throw new Error("Id is required to fetched GatePass Data")
    }

     const fetchData = await gatePassRepo.getGatePassById({id,
        select:{
            gate_pass_number:true,
            invoice_amount:true,
            invoice_date:true,
            inward_type:true,
            no_of_boxes:true,
            vendor:{
            select:{
              name:true,
              id:true,
            }
          },
        }})

    if(!fetchData){
        throw new Error("Error while fetching GatePass Data")
    }

    return fetchData
}

export const getGatePassByIdViewService = async(id)=>{
    if(!id){
        throw new Error("Id is required to fetched GatePass Data")
    }

     const fetchData = await gatePassRepo.getGatePassById({id,
        select:{
            gate_pass_number:true,
            invoice_amount:true,
            invoice_date:true,
            inward_type:true,
            no_of_boxes:true,
            status:true,
            vendor:{
            select:{
              name:true,
              id:true,
              address:true,
              contact_number:true,
              contact_person:true
            }
          },
        }})

    if(!fetchData){
        throw new Error("Error while fetching GatePass Data")
    }

    return fetchData
}
