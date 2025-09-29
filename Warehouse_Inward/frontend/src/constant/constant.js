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

export const categories = Object.freeze([
  {  value: "tablet", label:"tablet" ,uom: "pcs" },
  {  value: "syrup", label:"syrup" ,uom: "ml" },
  {  value: "injection", label:"injection" ,uom: "vial" },
  {  value: "cream", label:"cream" ,uom: "gm" },
  {  value: "ointment", label:"ointment" ,uom: "gm" },
  {  value: "drops", label:"drops" ,uom: "ml" },
]);

export const combinations = Object.freeze([
  { value: "azithromycin", label: "azithromycin" },
  { value: "paracetamol", label: "paracetamol" },
  { value: "ibuprofen", label: "ibuprofen" },
  { value: "amoxicillin", label: "amoxicillin" },
  { value: "metformin", label: "metformin" },
  { value: "atorvastatin", label: "atorvastatin" },
  { value: "omeprazole", label: "omeprazole" },
]);

export const numericFields = ["product_mrp", "product_price", "last_purchase_price", "gst_percentage"];

export const STATUS_COLORS = Object.freeze({
  [STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [STATUS.ACCEPTED]: "bg-blue-100 text-blue-800",
  [STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [STATUS.CANCELLED]: "bg-red-100 text-red-800",
  [STATUS.ACTIVE]: "bg-green-100 text-green-800",
  [STATUS.INACTIVE]: "bg-red-100 text-red-800",
  [STATUS.PARTIAL_RECEVIED]: "bg-yellow-100 text-yellow-800",
  [STATUS.ALLOCATED]: "bg-purple-100 text-purple-800",
  [STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
  [STATUS.PAID]: "bg-green-100 text-green-800",
  [STATUS.UNPAID]: "bg-red-100 text-red-800",
  [STATUS.DISPATCHED]: "bg-green-100 text-green-800",
  [STATUS.NOT_DISPATCHED]: "bg-red-100 text-red-800",
  [STATUS.OPEN]: "bg-blue-100 text-blue-800",
  [STATUS.CLOSED]: "bg-gray-300 text-gray-800",
});