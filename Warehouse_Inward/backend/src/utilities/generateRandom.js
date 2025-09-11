import { PREFIX } from "./constant.js"

export const generateRandom = (status)=>{
  const prefix = PREFIX[status.toUpperCase()] || "";
  const now = new Date();
  const dateStr = now
    .toISOString()
    .replace(/[-:.TZ]/g, "") 
    .slice(0, 17); 

  return prefix+dateStr;
}