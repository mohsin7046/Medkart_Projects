import { prisma } from '../utilities/import.config.js'
import { productLogger, vendorLogger } from './logger.js'

export const STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PARTIAL_RECEVIED: 'partial received',
  ALLOCATED: 'allocated',
  PROCESSING: "processing",
  PAID: "paid",
  UNPAID: "unpaid",
  DISPATCHED: "dispatched",
  NOT_DISPATCHED: "not dispatched",
  OPEN: 'open',
  CLOSED: 'closed',
  SENT: 'PO SENT',
  INCHECKING:'In checking',
  GRNINPROGRESS:'GRN In Progress',
  INWARDCOMPLETED:'Inward Completed',
  CHECKED:'Checked',
  CONFIRMED:'confirmed',
  ONHOLD:'On Hold',
  RECEVIED:'received'
})

export const EACHSTATUS = Object.freeze({
  product: ['active', 'inactive'],
  vendor: ['active', 'inactive'],
  po: ['pending', 'partial received', 'cancelled', 'completed'],
  grn: ['pending', 'cancelled', 'completed'],
  pi: ['pending', 'cancelled', 'completed'],
  so:['']
})


export const DETAILSFETCH = Object.freeze({
  product: ['id', 'product_code', 'name', 'category', 'product_ptr', 'product_mrp', "unit_of_measure", "hsn_code", "gst_percentage", "status", "inventory_qty",],
  vendor: ['id', 'vendor_code', 'name', 'email', 'contact_person', 'contact_number', 'address', 'status'],
  order: ['id', 'order_number', { vendor: { select: { id: true, name: true } } }, 'order_date', 'total_amount', 'total_order_qty', 'status'],
  grn: ['id', 'grn_number', { gatePass: { select: { gate_pass_number:true } } }, 'total_qty', 'total_amount','total_products', 'status','created_at'],
  invoice: ['id', 'invoice_number', 'invoice_date', 'total_amount', 'status', { goodReceiptNote: { select: { id: true } } }],
  saleorder: ['id', 'sales_order_number', 'name', 'total_order_qty', 'status', 'processed', 'order_type', 'created_at'],
  saleindent: ['id', 'indent_number', 'total_sales_order', 'total_remain_product', 'status', 'created_at', { product: { select: { name: true } } }],
  purchaseindent: ['id','purchase_indent_number','B2B_order_qty','B2C_order_qty','total_qty_to_be_order','total_order_qty','total_amount','status','created_at',
    {
      vendor: {
        select: { id: true, name: true }   
      }
    },
    {
      items: {                         
        select: {
          id: true,
          qty_to_be_order: true,
          order_qty: true,
          total_amount: true,
          product: {
            select: { id: true, name: true }   
          }
        }
      }
    }
  ],
  gatepass:['id','gate_pass_number', { vendor: { select: { name: true } } },'invoice_date','invoice_amount','no_of_boxes','status','created_at'],
  mrp_ptr_ratio:['id', { vendor: { select: { name: true } } }, { product: { select: { name: true } } },'mrp','mrp_ptr_ratio','created_at']
})

export const PREFIX = Object.freeze({
  ORDER: 'ORD-',
  PRODUCT: 'PC-',
  INVOICE: 'INV-',
  GRN: 'GRN-',
  VENDOR: 'VC-',
  SALE: 'SO-',
  INDENT: 'IN-',
  PURCHASE_IDENT: 'PI',
  GATEPASS:'GP'
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
  saleorder: ['sales_order_number'],
  saleindent: ['indent_number'],
  purchaseindent: ['purchase_indent_number'],
  gatepass:['gate_pass_number'],
 mrp_ptr_ratio: ['vendor.name', 'product.name']
})

export const SEARCHFILTERNAME = Object.freeze({
  order: prisma.purchaseOrder,
  product: prisma.product,
  invoice: prisma.purchaseInvoice,
  grn: prisma.goodReceiptNote,
  vendor: prisma.vendor,
  saleorder: prisma.salesOrder,
  saleindent: prisma.salesIndent,
  purchaseindent: prisma.purchaseIndent,
  gatepass:prisma.gatePass,
  mrp_ptr_ratio:prisma.productVendorMrpPtrRatio,
})

export const SETEXPIRY = Object.freeze({
  expiryMonth: 3
})

export const ENTITY = Object.freeze({
  vendor: "vendor",
  product: "product",
  po: "po",
  grn: "grn",
  pi: "pi",
  so: "so",
  si: "si",
  so: "sale-order",
  si: "sale-indent",
  purchaseindent:"purchase-indent",
  gatepass:"gatepass"
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
  NORMAL: "normal",
  HIGH: "high"
})


export const REDISWORKERQUEUE = Object.freeze({
  productQueue: [prisma.product, productLogger],
  vendorQueue: [prisma.vendor, vendorLogger]
})

export const categories = Object.freeze([
  { name: "tablet", uom: "pcs" },
  { name: "syrup", uom: "ml" },
  { name: "capsule", uom: "pcs" },
  { name: "injection", uom: "ml" },
  { name: "cream", uom: "kg" },
]);

export const combinations = Object.freeze([
  "paracetemol",
  "azithromycin",
  "cetrazin",
  "diclo",
  "paracetemol 500",
  "paracetemol 700",
  "azithromycin 500",
]);