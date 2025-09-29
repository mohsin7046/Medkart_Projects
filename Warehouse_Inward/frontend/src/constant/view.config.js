import { ALLEndpoint } from "./endPoints.js";

export const VIEW_CONFIG = {
  purchaseOrder: {
    title: "Purchase Order Details",
    endpoint: ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrderById.endpoint,
    headerFields: [
      { label: "Order Number", key: "order_number" },
      { label: "Date", key: "order_date", isDate: true },
      { label: "Total Amount", key: "total_amount", isCurrency: true },
      { label: "Status", key: "status", isStatus: true },
    ],
    itemKey: "purchaseOrderItems",
    itemColumns: [
      { label: "Product ID", key: "product_id" },
      { label: "Quantity", key: "quantity" },
      { label: "Price", key: "item_price", isCurrency: true },
      { label: "Total", key: "totalAmount", isCurrency: true },
    ],
  },

  grn: {
    title: "GRN Details",
    endpoint: ALLEndpoint.GRNEndpoints.getGRNById.endpoint,
    headerFields: [
      { label: "GRN Number", key: "grn_number" },
      { label: "Order Number", key: "purchaseOrder.order_number" },
      { label: "Received Date", key: "received_date", isDate: true },
      { label: "Total Amount", key: "total_amount", isCurrency: true },
      { label: "Status", key: "status", isStatus: true },
    ],
    itemKey: "goodReceiptNoteItems",
    itemColumns: [
      { label: "Product ID", key: "product_id" },
      { label: "Batch", key: "batch_number" },
      { label: "Expiry", key: "expiry_date", isDate: true },
      { label: "Qty", key: "recevied_qty" },
      { label: "Shortage Qty", key: "shortage_qty" },
      { label: "Damaged Qty", key: "damaged_qty" },
      { label: "Price", key: "item_price", isCurrency: true },
      { label: "MRP", key: "item_mrp", isCurrency: true },
      { label: "Total", key: "totalAmount", isCurrency: true },
    ],
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
    { label: "Status", key: "status", isStatus: true },
  ],
  itemKey: "products", 
  itemColumns: [
    { label: "Product Name", key: "product.name" }, 
    { label: "Vendor Name", key: "vendor.name" }, 
    { label: "Ordered Qty", key: "ordered_qty" },
    { label: "Allocated Qty", key: "allocated_qty" },
    { label: "Remaining Qty", key: "remaining_qty" },
    { label: "Price", key: "product.product_price", isCurrency: true },
    { label: "MRP", key: "product.product_mrp", isCurrency: true },
    { label: "GST %", key: "product.gst_percentage" },
    { label: "Combination", key: "product.combination" },
    { label: "HSN Code", key: "product.hsn_code" },
    { label: "Total", key: "totalAmount", isCurrency: true }, 
  ],
},

salesIndent : {
  title: "Sales Indent Details",
  endpoint: ALLEndpoint.SalesIndentEndpoints.getSalesIndentById.endpoint,

  headerFields: [
    { label: "Indent Number", key: "indent_number" },
    { label: "Status", key: "status", isStatus: true },
    { label: "Total Sales Order", key: "total_sales_order" },
    { label: "Total Remain Product", key: "total_remain_product" },
    { label: "Created At", key: "created_at", isDate: true },
  ],

  itemKey: "sales_orders",

  itemColumns: [
    { label: "Sales Order No", key: "sales_order_number" },
    { label: "Order Type", key: "order_type" },
    { label: "Address", key: "address" },
    { label: "Contact No", key: "contact_number" },
    { label: "Email", key: "email" },
    { label: "Payment Status", key: "payment_status" },
    { label: "Delivery Status", key: "delivery_status" },
    { label: "Processed Date", key: "processed_date", isDate: true },
    { label: "Total Order Qty", key: "total_order_qty" },
    { label: "Total Amount", key: "total_amount", isCurrency: true },
    { label: "Product Name", key: "products.product.name", isCurrency: true },
    { label: "Vendor Name", key: "products.vendor.name", isCurrency: true },
    { label: "Status", key: "status", isStatus: true },
  ],

  // subItemKey: "products",
  // subItemColumns: [
  //   { label: "Product Name", key: "product.name" },
  //   { label: "Vendor Name", key: "vendor.name" },
  //   { label: "Category", key: "product.category" },
  //   { label: "Ordered Qty", key: "ordered_qty" },
  //   { label: "Allocated Qty", key: "allocated_qty" },
  //   { label: "Remaining Qty", key: "remaining_qty" },
  //   { label: "Price", key: "product.product_price", isCurrency: true },
  //   { label: "MRP", key: "product.product_mrp", isCurrency: true },
  //   { label: "GST %", key: "product.gst_percentage" },
  //   { label: "Combination", key: "product.combination" },
  //   { label: "HSN Code", key: "product.hsn_code" },
  //   { label: "Total", key: "totalAmount", isCurrency: true },
  // ],
}

};
