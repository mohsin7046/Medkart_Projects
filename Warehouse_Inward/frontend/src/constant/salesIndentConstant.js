export const salesIndentColumns = [
  { key: "indent_number", label: "Indent No" },
  { key: "product", label: "Name",render: (product) => product?.name || "-"  },
  { key: "total_remain_product", label: "Total Reamin Product" },
  { key: "total_sales_order", label: "Total Sales Order" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created At",render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-") },
];


export const salesIndentSearchFields = [
  { label: "Indent No", key: "indent_number" },
];

export const salesIndentStatusFilters = [
  { label: "All", key: "all" },
  { label: "Open", key: "open" },
  { label: "Closed", key: "closed" }
];


export const LIMITPAGE = 5;