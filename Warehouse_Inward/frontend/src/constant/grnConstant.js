import { STATUS_COLORS } from "./constant";

export const grnColumns = [
  { key: "grn_number", label: "GRN Number" },
  {
    key: "gatePass",
    label: "Gate Pass Number",
    render: (gatePass) => gatePass?.gate_pass_number || "-", 
  },
  { key: "total_qty", label: "Total Qty" },
  { key: "total_products", label: "Total Products" },
  {
    key: "total_amount",
    label: "Total Amount",
    render: (val) => `₹${val}`,
  },
  { 
    key: "status", 
    label: "Status",
    render: (val) => val,
    background: (val) => STATUS_COLORS[val],
  },
  {
    key: "created_at",
    label: "Created Date",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-"),
  },
];

export const grnSearchFields = [
  { key: "grn_number", label: "GRN Number" },
  { key: "gate_pass_number", label: "Gate Pass Number" },
];

export const grnStatusFilters = [
  { key: "all", label: "All Status" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const LIMITPAGE = 8;
