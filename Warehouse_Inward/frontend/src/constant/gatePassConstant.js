import { STATUS_COLORS } from "./constant.js";

 export const columns = [
    { key: "gate_pass_number", label: "GatePass Number" },
    { key: "vendor", label: "Vendor Name", render: (vendor) => vendor?.name || "-"  },
    { key: "invoice_date", label: "Invoice Date" ,render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-")},
    { key: "no_of_boxes", label: "No. of Boxes"},
    { key: "created_at", label: "CreatedAt",render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-") },
    { key: "status", label: "Status" ,background: (val)=> STATUS_COLORS[val] },
  ];

export const searchFields = [
    { key: "gate_pass_number", label: "GatePass Number" },
  ];

export const statusFilters = [
    { key: "all", label: "All Status" },
    { key: "In checking", label: "In Checking" },
    { key: "Inward Completed", label: "Inward Completed" },
    { key: "Checked", label: "Checked" },
  ]

export const LIMITPAGE = 8;