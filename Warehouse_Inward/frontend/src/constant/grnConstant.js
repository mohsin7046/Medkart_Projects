import { STATUS_COLORS } from "./constant";

export const grnColumns = [
  { key: "grn_number", label: "GRN Number" },
  { key: "order_id", label: "Order ID" },
  {
    key: "received_date",
    label: "Received Date",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-"),
  },
  {
    key: "total_amount",
    label: "Total Amount",
    render: (val) => `₹${val}`,
  },
  { key: "status", label: "Status" ,background: (val)=> STATUS_COLORS[val] },
];

export const grnSearchFields = [
  { key: "grn_number", label: "GRN Number" },
];

export const grnStatusFilters = [
  { key: "all", label: "All Status" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const LIMITPAGE = 8;