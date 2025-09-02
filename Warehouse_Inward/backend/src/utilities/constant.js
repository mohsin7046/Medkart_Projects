export const STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PARTIAL_RECEVIED: 'partial received'
})

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
  PRODUCT_FEILD: ['name', 'category', 'product_code', 'description'],
  VENDOR_FEILD: ['name', 'email', 'vendor_code', 'contact_person', 'address'],
  PURCHASE_ORDER_FEILD: ['order_number'],
  GRN_FEILD: ['grn_number'],
  PURCHASE_INVOICE_FEILD: ['invoice_number']
})
