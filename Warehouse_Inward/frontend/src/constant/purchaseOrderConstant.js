// /constant/purchaseOrderConstant.js

export const purchaseOrderColumns = [
  { key: "order_number", label: "Order Number" },
  { key: "vendor_id", label: "Vendor ID" },
  {
    key: "order_date",
    label: "Order Date",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-"),
  },
  {
    key: "total_amount",
    label: "Total Amount",
    render: (val) => `₹${val}`,
  },
  {
    key: "expected_delivery_date",
    label: "Expected Delivery",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-"),
  },
  { key: "status", label: "Status" },
];

export const purchaseOrderSearchFields = [
  { key: "order_number", label: "Order Number" },
];

export const purchaseOrderStatusFilters = [
  { key: "all", label: "All Status" },
  { key: "pending", label: "Pending" },
  { key: "partial received", label: "Partial Received" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const LIMITPAGE = 3;
