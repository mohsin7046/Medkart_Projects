import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE } from "../../constant/gatePassConstant.js";



export const columns = [
  { key: "vendor", label: "Vendor Name", render: (vendor) => vendor?.name || "-" },
  { key: "product", label: "Product Name", render: (product) => product?.name || "-" },
  { key: "mrp", label: "MRP" },
  { key: "mrp_ptr_ratio", label: "MRP_PTR_RATIO" },
  {
    key: "created_at",
    label: "Created At",
    render: (val) => (val ? new Date(val).toLocaleDateString("en-GB") : "-"),
  },
];


export const searchFields = [
  { key: "", label: "ALL" },
  { key: "vendor.name", label: "Vendor Name" },
  { key: "product.name", label: "Product Name" },
];


function MRP_PTR_RATIO() {
  const FILTER_KEY = "mrp_ptr_ratio_Filters";
  const navigate = useNavigate();

  const getFilterState = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const setFilterState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  };

  const initialFilters = getFilterState(FILTER_KEY, {
    page: 1,
    searchTerm: "",
    searchField: "vendor.name",
    sortField: "created_at",
    sortOrder: "d",
  });

  const [page, setPage] = useState(initialFilters.page);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [searchField, setSearchField] = useState(initialFilters.searchField);
  const [sortField, setSortField] = useState(initialFilters.sortField);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);

  const limit = LIMITPAGE;

  useEffect(() => {
    const filters = { page, searchTerm, searchField, sortField, sortOrder };
    setFilterState(FILTER_KEY, filters);
  }, [page, searchTerm, searchField, sortField, sortOrder]);

  const { data, metadata, loading } = useFetchData({
    endpoint: ALLEndpoint.Mrp_ptr_ratio_Endpoints.get_mrp_ptr_ratio.endpoint,
    name: "mrp_ptr_ratio",
    page,
    limit,
    debounceDelay: 500,
    searchTerm,
    searchField,
    sortField,
    sortOrder,
  });


  const handleSearch = ({ field, value }) => {
    setSearchField(field);
    setSearchTerm(value);
    setPage(1);
  };

  const handleSort = ({ field, order }) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      page: 1,
      searchTerm: "",
      searchField: "vendor.name",
      sortField: "created_at",
      sortOrder: "d",
    };
    setPage(defaultFilters.page);
    setSearchTerm(defaultFilters.searchTerm);
    setSearchField(defaultFilters.searchField);
    setSortField(defaultFilters.sortField);
    setSortOrder(defaultFilters.sortOrder);
    setFilterState(FILTER_KEY, defaultFilters);
  };

  return (
    <div>
      <CommonDataTable
        columns={columns}
        data={data}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={searchFields}
        currentSearchTerm={searchTerm}
        currentSearchField={searchField}
        currentSortField={sortField}
        currentSortOrder={sortOrder}
        onSearch={handleSearch}
        onSort={handleSort}
        onAdd={() => navigate(ROUTES.MRP_PTR_RATIO.ADD)}
        onEdit={(item) => navigate(ROUTES.MRP_PTR_RATIO.EDIT(item.id))}
        onClear={handleClearFilters}
      />
    </div>
  );
}

export default MRP_PTR_RATIO;
