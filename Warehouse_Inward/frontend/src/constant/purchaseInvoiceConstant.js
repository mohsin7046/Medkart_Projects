import { STATUS_COLORS } from "./constant";

export const invoiceColumns = [
  { key: "invoice_number", label: "Invoice Number" },
  { key: "goodReceiptNote", label: "GRN ID",render: (goodReceiptNote) => goodReceiptNote?.id || "-"  },
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
  { key: "status", label: "Status",background: (val)=> STATUS_COLORS[val]  },
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

export const LIMITPAGE = 8;
