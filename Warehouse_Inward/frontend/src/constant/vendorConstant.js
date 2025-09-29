import { STATUS_COLORS } from "./constant";

export const columns = [
    { key: "vendor_code", label: "Vendor Code" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact_person", label: "Contact Person" },
    { key: "contact_number", label: "Contact Number" },
    { key: "address", label: "Address" },
    { key: "status", label: "Status" , background: (val)=> STATUS_COLORS[val]  },
  ];

export const searchFields = [
    { key: "name", label: "Name" },
    { key: "vendor_code", label: "Vendor Code" },
    { key: "email", label: "Email" },
    { key: "contact_number", label: "Contact Number" },
    { key: "address", label: "Address" },
  ];

export const statusFilters = [
    { key: "all", label: "All Status" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];

  export const LIMITPAGE = 8;