export const invoiceColumns = [
  { key: "invoice_number", label: "Invoice Number" },
  { key: "grn_id", label: "GRN ID" },
  {
    key: "invoice_date",
    label: "Invoice Date",
    render: (val) => new Date(val).toLocaleDateString(),
  },
  {
    key: "total_amount",
    label: "Total Amount",
    render: (val) => `₹${val}`,
  },
  { key: "status", label: "Status" },
];

export const invoiceSearchFields = [
  { key: "invoice_number", label: "Invoice Number" },
];

export const invoiceStatusFilters = [
  { key: "all", label: "All Status" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];
