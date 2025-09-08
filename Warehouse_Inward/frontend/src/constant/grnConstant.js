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
  { key: "status", label: "Status" },
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
