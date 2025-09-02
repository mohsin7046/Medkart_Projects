import { PREFIX } from "./constant.js"

export const generateRandom = (status)=>{
    const prefix = PREFIX[status.toUpperCase()] || ''
  const randomStr = Date.now().toString().slice(-6)
  const uniqueId = Math.floor(1000 + Math.random() * 9000)

  return `${prefix}${randomStr}${uniqueId}`
}