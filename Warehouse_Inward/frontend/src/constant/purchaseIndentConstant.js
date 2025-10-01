import { STATUS_COLORS } from "./constant";

export const purchaseIndentColumns = [
  { key: "purchase_indent_number", label: "Indent No" },

  { 
    key: "vendor", 
    label: "Vendor Name",
    render: (vendor) => vendor?.name || "-" 
  },

  { 
    key: "product", 
    label: "Product",
    render: (product) => product?.name || "-" 
  },

  { key: "qty_to_be_order", label: "Qty To Be Ordered" },
  { key: "order_qty", label: "Ordered Qty" },
  { key: "total_amount", label: "Total Amount", render: (val) => `₹${val}` },

  { 
    key: "status", 
    label: "Status",
    background: (val)=> STATUS_COLORS[val] 
  },

  { 
    key: "created_at", 
    label: "Created At",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-") 
  },
];

export const purchaseIndentSearchFields = [
  { label: "Purchase Indent No", key: "purchase_indent_number" },
];

export const salesIndentStatusFilters = [
  { label: "All", key: "all" },
  { label: "Pending", key: "pending" },
  { label: "Completed", key: "completed" }
];


export const LIMITPAGE = 5;

export const FILTER_KEY_INDENT = "purchaseIndentFilters";

export const defaultIndentValue = {
  page: 1,
  searchTerm: "",
  searchField: "purchase_indent_number", 
  statusFilter: "all",
  sortField: "created_at",
  sortOrder: "d",
};
