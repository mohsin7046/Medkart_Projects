import { createGatePassService, updateGatePassService ,getGatePassByIdService,getGatePassByIdViewService} from "../../services/gatePass.service.js";
import { STATUSCODE } from "../../utilities/constant.js";
import { successResponse } from "../../utilities/response.js";


export const createGatePass = async(req,res)=>{
    const data = req.body;   

    const newGatePass = await createGatePassService(data);

    return successResponse(res, newGatePass, "GatePass created successfully", STATUSCODE.OK);

}

export const updateGatePass = async(req,res)=>{
    const data = req.body;

    const updatedGatePass = await updateGatePassService(data);

    return successResponse(res, updatedGatePass, "GatePass updated successfully", STATUSCODE.OK);
}

export const getGatePassById = async(req,res)=>{
    const {id} = req.params;
    const fetchgatePassData  = await getGatePassByIdService(id)
    return successResponse(res, fetchgatePassData, "GatePass fetched successfully", STATUSCODE.OK);
}

export const getGatePassByIdView = async(req,res)=>{
    const {id} = req.params;
    const fetchgatePassData  = await getGatePassByIdViewService(id)
    return successResponse(res, fetchgatePassData, "GatePass fetched successfully", STATUSCODE.OK);
}