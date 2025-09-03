import { SETEXPIRY } from "./constant.js";

export const checkExpiry = (exp_data)=>{
    const valid_exp_date = new Date();
    valid_exp_date.setMonth(valid_exp_date.getMonth() + SETEXPIRY.expiryMonth);

    if(exp_data <= valid_exp_date){
        return false;
    }
    return true;
}