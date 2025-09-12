import {prisma} from '../utilities/import.config.js'
import { productLogger, vendorLogger } from './logger.js'

export const STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PARTIAL_RECEVIED: 'partial received',
  ALLOCATED:'allocated',
  PROCESSING:"processing",
  PAID:"paid",
  UNPAID:"unpaid",
  DISPATCHED:"dispatched",
  NOT_DISPATCHED:"not dispatched",
  OPEN:'open',
  CLOSED:'closed'
})

export const EACHSTATUS = Object.freeze({
  product:['active','inactive'],
  vendor:['active','inactive'],
  po:['pending','partial received','cancelled','completed'],
  grn:['pending','cancelled','completed'],
  pi:['pending','cancelled','completed']
})

// TODO::
// export const GENERATOR_TYPES = Object.freeze({
//   ORDER: 'ORDER',
//   PRODUCT: ',
//   INVOICE: 'INV-',
//   GRN: 'GRN-',
//   VENDOR: 'VC-'
// })

export const DETAILSFETCH = Object.freeze({
  product: ['id','product_code', 'name', 'category', 'product_price','product_mrp',"unit_of_measure","hsn_code","gst_percentage","status","inventory_qty" ],
  vendor: ['id','vendor_code','name', 'email', 'contact_person','contact_number', 'address','status'],
  order: ['id','order_number','vendor_id','order_date','total_amount','expected_delivery_date','status'],
  grn: ['id','grn_number','order_id','received_date','total_amount','status'],
  invoice: ['id','invoice_number','invoice_date','total_amount','status',{goodReceiptNote:{select:{id:true}}}],
  saleorder:['id','sales_order_number','name','totalOrderQty','status','processed','order_type','created_at'],
  saleindent:['id','indent_number','total_sales_order','total_remain_product','status','created_at',{product:{select:{name:true}}}]
})

export const PREFIX = Object.freeze({
  ORDER: 'ORD-',
  PRODUCT: 'PC-',
  INVOICE: 'INV-', 
  GRN: 'GRN-', 
  VENDOR: 'VC-',
  SALE:'SO-',
  INDENT:'IN-'
})

export const LIMIT = Object.freeze({
  PRODUCT_LIMIT: 4,
  VENDOR_LIMIT: 4
})

export const FEILD = Object.freeze({
  product: ['name', 'category', 'product_code', 'description'],
  vendor: ['name', 'email', 'vendor_code', 'contact_person', 'address'],
  order: ['order_number'],
  grn: ['grn_number'],
  invoice: ['invoice_number'],
  saleorder:['sales_order_number'],
  saleindent:['indent_number']
})
 
export const SEARCHFILTERNAME = Object.freeze({
  order: prisma.purchaseOrder,
  product: prisma.product,
  invoice: prisma.purchaseInvoice,
  grn: prisma.goodReceiptNote,
  vendor: prisma.vendor,
  saleorder:prisma.salesOrder,
  saleindent:prisma.salesIndent
})

export const SETEXPIRY = Object.freeze({
  expiryMonth:3
})

export const ENTITY = Object.freeze({
  vendor: "vendor",
  product: "product",
  po: "po",
  grn: "grn",
  pi: "pi",
  so:"so",
  si:"si",
  so:"sale-order",
  si:"sale-indent"
});


export const STATUSCODE = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});


export const PRIORITY = Object.freeze({
  NORMAL:"normal",
  HIGH:"high"
})


export const REDISWORKERQUEUE = Object.freeze({
  productQueue:[prisma.product,productLogger],
  vendorQueue:[prisma.vendor,vendorLogger]
})