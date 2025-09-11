export const salesOrderColumns = [
  { key: "sales_order_number", label: "Order No" },
  { key: "name", label: "Name" },
  { key: "totalOrderQty", label: "Total Qty" },
  { key: "status", label: "Status" },
  { key: "order_type", label: "Order Type" },
  { key: "created_at", label: "Created At" },
];


export const salesOrderSearchFields = [
  { label: "Order No", key: "sales_order_number" },
  { label: "Name", key: "name" },
];

export const salesOrderStatusFilters = [
  { label: "All", key: "all" },
  { label: "Pending", key: "pending" },
  { label: "Processing", key: "processing" },
  { label: "Allocated", key: "allocated" },
  { label: "Cancelled", key: "cancelled" },
];


export const LIMITPAGE = 3;

