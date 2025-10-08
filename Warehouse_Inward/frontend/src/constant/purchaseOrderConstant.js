
import { STATUS_COLORS } from "./constant";

export const purchaseOrderColumns = [
  { key: "order_number", label: "Order Number" },
  { key: "vendor", label: "Vendor Name",render: (vendor) => vendor?.name || "-" },
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
    key: "total_order_qty",
    label: "Total Order Qty",
  },
  { key: "status", label: "Status" ,background: (val)=> STATUS_COLORS[val]  },
];

export const purchaseOrderSearchFields = [
  { key: "order_number", label: "Order Number" },
];

export const purchaseOrderStatusFilters = [
  { key: "all", label: "All Status" },
  { key: "PO SENT", label: "PO SENT" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const LIMITPAGE = 8;

export const FILTER_KEY = "purchaseOrderFilters";

export const defaultValue = {
    page: 1,
    searchTerm: "",
    searchField: "name",
    statusFilter: "all",
    sortField: "created_at",
    sortOrder: "d",
  }
