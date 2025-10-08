import { STATUS, STATUS_COLORS } from "./constant.js";
import { ALLEndpoint } from "./endPoints.js";

export const VIEW_CONFIG = {
  purchaseOrder: {
  title: "Purchase Order Details",
  endpoint: ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrderById.endpoint,

  headerFields: [
    { label: "Order Number", key: "order_number" },
    { label: "Vendor Name", key: "vendor.name" },
    { label: "Order Date", key: "order_date", isDate: true },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
    { label: "Total Order Qty", key: "total_order_qty" },
    { label: "Status", key: "status", isStatus: true },
    { label: "Created At", key: "created_at", isDate: true },
  ],

  itemKey: "products",

  itemColumns: [
    { label: "Product Name", key: "product.name" },
    { label: "Product Category", key: "product.category" },
    { label: "Product Combination", key: "product.combination" }, 
    { label: "GST %", key: "product.gst_percentage" },
    { label: "Ordered Qty", key: "ordered_qty" },
    { label: "Net Cost / Qty", key: "net_cost_per_qty", isCurrency: true },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
  ],
  backgroundStatus: (status) => STATUS_COLORS[status] || "bg-gray-100 text-gray-800",
},

 grn: {
  title: "GRN Details",
  endpoint: ALLEndpoint.GRNEndpoints.getGRNById.endpoint,

  headerFields: [
    { label: "GRN Number", key: "grn_number" },
    { label: "Gate Pass ID", key: "gate_pass_id" },
    { label: "Vendor Name", key: "vendor.name" },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
    { label: "Total Quantity", key: "total_qty" },
    { label: "Total Products", key: "total_products" },
    { label: "Status", key: "status", isStatus: true},
  ],

  itemKey: "goodReceiptNoteItems",

  itemColumns: [
    { label: "Product Name", key: "product.name" },
    { label: "Batch Number", key: "batch_number" },
    { label: "Expiry Date", key: "expiry_date", isDate: true },
    { label: "Billed Quantity", key: "billed_qty" },
    { label: "Item PTR", key: "item_ptr", isCurrency: true },
    { label: "Item MRP", key: "item_mrp", isCurrency: true },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
  ],

  backgroundStatus: (status) => STATUS_COLORS[status],
},


  invoice: {
    title: "Invoice Details",
    endpoint: ALLEndpoint.PurchaseInvoiceEndpoints.getPurchaseInvoiceById.endpoint,
    headerFields: [
      { label: "Invoice Number", key: "invoice_number" },
      { label: "GRN Number", key: "goodReceiptNote.grn_number" },
      { label: "Date", key: "invoice_date", isDate: true },
      { label: "Total Amount", key: "total_amount", isCurrency: true },
      { label: "Status", key: "status", isStatus: true },
    ],
    itemKey: "PurchaseInvoiceItem",
    itemColumns: [
      { label: "Product ID", key: "product_id" },
      { label: "Product Name", key: "product.name" },
      { label: "Quantity", key: "quantity" },
      { label: "Price", key: "item_price", isCurrency: true },
      { label: "MRP", key: "item_mrp", isCurrency: true },
      { label: "Total", key: "totalAmount", isCurrency: true },
      { label: "GST %", key: "product.gst_percentage" },
    ],
  },

 salesOrder : {
  title: "Sales Order Details",
  endpoint: ALLEndpoint.SalesOrderEndpoints.getSalesOrderById.endpoint,
  headerFields: [
    { label: "Order Number", key: "sales_order_number" },
    { label: "Name", key: "name" },
    { label: "Order Type", key: "order_type" },
    { label: "Address", key: "address" },
    { label: "Contact No", key: "contact_number" },
    { label: "EmailId", key: "email" },
    { label: "Processed Date", key: "processed_date", isDate: true }, 
    { label: "Total Amount", key: "total_amount", isCurrency: true },
    { label: "Total Order Qty", key: "total_order_qty"},
    { label: "Status", key: "status", isStatus: true },
  ],
  itemKey: "products", 
  itemColumns: [
    { label: "Product Name", key: "product.name" },  
    { label: "Ordered Qty", key: "ordered_qty" },
    { label: "Allocated Qty", key: "allocated_qty" },
    { label: "Remaining Qty", key: "remaining_qty" },
    { label: "Price", key: "product.product_ptr", isCurrency: true },
    { label: "MRP", key: "product.product_mrp", isCurrency: true },
    { label: "Inventory Qty", key: "product.inventory_qty" },
    { label: "GST %", key: "product.gst_percentage" },
    { label: "Combination", key: "product.combination" },
    { label: "HSN Code", key: "product.hsn_code" },
    { label: "Total", key: "total_amount", isCurrency: true }, 
  ],
  actions: [
    {
      label: "Process Order",
      key: "process",
      method: ALLEndpoint.SalesOrderEndpoints.processSalesOrder.method,
      endpoint: ALLEndpoint.SalesOrderEndpoints.processSalesOrder.endpoint,
      body: (id) => ({ sales_order_ids: [parseInt(id)] }),
      showWhen: (data) => ![STATUS.PROCESSING,STATUS.PARTIAL_RECEVIED,STATUS.ALLOCATED].includes(data.status),
    },
  ],
  backgroundStatus : (status) => STATUS_COLORS[status]
},

salesIndent: {
  title: "Sales Indent Details",
  endpoint: ALLEndpoint.SalesIndentEndpoints.getSalesIndentById.endpoint,

  headerFields: [
    { label: "Indent Number", key: "indent_number" },
    { label: "Status", key: "status", isStatus: true},
    { label: "Total Sales Order", key: "total_sales_order" },
    { label: "Total Remain Product", key: "total_remain_product" },
    { label: "Created At", key: "created_at", isDate: true },
  ],

  itemKey: "items",

  itemColumns: [
    { label: "Sales Order No", key: "sales_order_number" },
    { label: "Order Type", key: "order_type" },
    { label: "Address", key: "address" },
    { label: "Processed Date", key: "processed_date", isDate: true },
    { label: "Ordered Qty", key: "ordered_qty" },
    { label: "Allocated Qty", key: "allocated_qty" },
    { label: "Remaining Qty", key: "remaining_qty" },
    { label: "Product Name", key: "product_name" },
    { label: "Product Category", key: "product_category" },
    { label: "Product Combination", key: "product_combination" },
    { label: "Product Price", key: "product_ptr", isCurrency: true },
    { label: "Product MRP", key: "product_mrp", isCurrency: true },
    { label: "Order Status", key: "order_status", isStatus: true },
  ],
  backgroundStatus : (status) => STATUS_COLORS[status]
},

purchaseIndent: {
  title: "Purchase Indent Details",
  endpoint: ALLEndpoint.PurchaseIndentEnpoints.getPurchaseIndentById.endpoint,

  headerFields: [
    { label: "Purchase Indent Number", key: "purchase_indent_number" },
    { label: "Vendor Name", key: "vendor.name" },
    { label: "B2B Order Qty", key: "B2B_order_qty" },
    { label: "B2C Order Qty", key: "B2C_order_qty" },
    { label: "Total Qty To Be Ordered", key: "total_qty_to_be_order" },
    { label: "Total Order Qty", key: "total_order_qty" },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
    { label: "Status", key: "status", isStatus: true },
    { label: "Created At", key: "created_at", isDate: true },
  ],

  itemKey: "items",

  itemColumns: [
     { label: "Product Name", key: "product.name" },
    { label: "Product Category", key: "product.category" },
    { label: "Product Combination", key: "product.combination" },
    { label: "Product GST %", key: "product.gst_percentage" },
    { label: "Qty To Be Ordered", key: "qty_to_be_order" },
    { label: "Ordered Qty", key: "order_qty" },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
  ],

  backgroundStatus: (status) => STATUS_COLORS[status],
},

gatePass: {
  title: "Gate Pass Details",
  endpoint: ALLEndpoint.GatePassEndpoints.getGatePassByIdView.endpoint,

  headerFields: [
    { label: "Gate Pass Number", key: "gate_pass_number" },
    { label: "Vendor Name", key: "vendor.name" },
    { label: "Status", key: "status", isStatus: true},
    { label: "Vendor Address", key: "vendor.address" },
    { label: "Vendor Contact Number", key: "vendor.contact_number" },
    { label: "Contact Person", key: "vendor.contact_person" },
    { label: "Invoice Amount", key: "invoice_amount", isCurrency: true },
    { label: "Invoice Date", key: "invoice_date", isDate: true },
    { label: "Inward Type", key: "inward_type" },
    { label: "Number of Boxes", key: "no_of_boxes" },
  ],
  

  backgroundStatus: (status) => STATUS_COLORS[status],
}

}
