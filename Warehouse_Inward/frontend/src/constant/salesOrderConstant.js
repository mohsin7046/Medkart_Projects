import { STATUS_COLORS } from "./constant";

export const salesOrderColumns = [
  { key: "sales_order_number", label: "Order No" },
  { key: "name", label: "Name" },
  { key: "total_order_qty", label: "Total Qty" },
  { key: "status", label: "Status",background: (val)=> STATUS_COLORS[val]  },
  { key: "order_type", label: "Order Type" },
  { key: "created_at", label: "Created At",render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-") },
];


export const salesOrderSearchFields = [
  { label: "Order No", key: "sales_order_number" },
  { label: "Name", key: "name" },
];

export const salesOrderStatusFilters = [
  { label: "All", key: "all" },
  { label: "Pending", key: "pending" },
  { label: "Processing", key: "processing" },
  { label: "Partial Received", key: "partial received" },
  { label: "Allocated", key: "allocated" },
  { label: "Cancelled", key: "cancelled" },
];

export const LIMITPAGE = 10;

export const FILTER_KEY = "salesOrderFilters";

export const defaultValue = {
    page: 1,
    searchTerm: "",
    searchField: "name",
    statusFilter: "all",
    sortField: "created_at",
    sortOrder: "d",
  }
