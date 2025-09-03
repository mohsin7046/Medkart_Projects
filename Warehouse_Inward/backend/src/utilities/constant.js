import {prisma} from '../utilities/import.config.js'

export const STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PARTIAL_RECEVIED: 'partial received'
})

// TODO::
// export const GENERATOR_TYPES = Object.freeze({
//   ORDER: 'ORDER',
//   PRODUCT: ',
//   INVOICE: 'INV-',
//   GRN: 'GRN-',
//   VENDOR: 'VC-'
// })

export const PREFIX = Object.freeze({
  ORDER: 'ORD-',
  PRODUCT: 'PC-',
  INVOICE: 'INV-',
  GRN: 'GRN-',
  VENDOR: 'VC-'
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
  invoice: ['invoice_number']
})
 
export const SEARCHFILTERNAME = Object.freeze({
  order: prisma.purchaseOrder,
  product: prisma.product,
  invoice: prisma.purchaseInvoice,
  grn: prisma.goodReceiptNote,
  vendor: prisma.vendor
})

export const SETEXPIRY = Object.freeze({
  expiryMonth:3
})
