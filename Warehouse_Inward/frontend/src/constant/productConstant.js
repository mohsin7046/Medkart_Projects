 export const columns = [
    { key: "product_code", label: "Product Code" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "product_price", label: "Price", render: (val) => `₹${val}` },
    { key: "product_mrp", label: "MRP", render: (val) => `₹${val}` },
    { key: "unit_of_measure", label: "Unit" },
    { key: "hsn_code", label: "HSN" },
    { key: "gst_percentage", label: "GST %", render: (val) => `${val}%` },
    { key: "status", label: "Status" },
  ];

export const searchFields = [
    { key: "name", label: "Name" },
    { key: "product_code", label: "Product Code" },
    { key: "category", label: "Category" },
    { key: "hsn_code", label: "HSN" },
  ];

export const statusFilters = [
    { key: "all", label: "All Status" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "InActive" },
  ]