

 export const columns = [
    { key: "vendor", label: "Vendor Name", render: (vendor) => vendor?.name || "-"  },
    { key: "product", label: "Product Name", render: (product) => product?.name || "-"  },
    { key: "mrp", label: "MRP" ,render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-")},
    { key: "mrp_ptr_ratio", label: "MRP_PTR_RATIO"},
    { key: "created_at", label: "CreatedAt",render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-") },
  ];

export const searchFields = [
  { key: "vendor.name", label: "Vendor Name" },
  { key: "product.name", label: "Product Name" },
];


export const LIMITPAGE = 8;