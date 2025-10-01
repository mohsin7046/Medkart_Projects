import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { purchaseIndentColumns, purchaseIndentSearchFields, salesIndentStatusFilters, LIMITPAGE } from "../../constant/purchaseIndentConstant.js";
import { ROUTES } from "../../constant/routePath.js";

function PurchaseIndent() {
  const FILTER_KEY = "purchaseIndentFilters";
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
    searchField: "purchase_indent_number",
    statusFilter: "all",
    sortField: "created_at",
    sortOrder: "d",
  });

  const [page, setPage] = useState(initialFilters.page);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [searchField, setSearchField] = useState(initialFilters.searchField);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [sortField, setSortField] = useState(initialFilters.sortField);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);

  const limit = LIMITPAGE;

  useEffect(() => {
    const filters = { page, searchTerm, searchField, statusFilter, sortField, sortOrder };
    setFilterState(FILTER_KEY, filters);
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const { data: purchaseIndents, metadata, loading, setData: setPurchaseIndents } =
    useFetchData({
      endpoint: ALLEndpoint.PurchaseIndentEnpoints.getPurchaseIndent.endpoint,
      name: "purchaseindent",
      page,
      limit,
      debounceDelay: 500,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    });

 
const flattenPurchaseIndents = (purchaseIndents || []).flatMap(indent =>
  indent.items.map(item => ({
    ...indent,
    product: item.product,         
    qty_to_be_order: item.qty_to_be_order,
    order_qty: item.order_qty,
    total_amount: item.total_amount 
  }))
);

  const handleSearch = ({ field, value }) => {
    setSearchField(field);
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilter = ({ status }) => {
    setStatusFilter(status);
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
      searchField: "purchase_indent_number",
      statusFilter: "all",
      sortField: "created_at",
      sortOrder: "d",
    };

    setPage(defaultFilters.page);
    setSearchTerm(defaultFilters.searchTerm);
    setSearchField(defaultFilters.searchField);
    setStatusFilter(defaultFilters.statusFilter);
    setSortField(defaultFilters.sortField);
    setSortOrder(defaultFilters.sortOrder);

    setFilterState(FILTER_KEY, defaultFilters);
  };

  return (
    <div>
      <CommonDataTable
        columns={purchaseIndentColumns}
        data={flattenPurchaseIndents}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={purchaseIndentSearchFields}
        statusFilters={salesIndentStatusFilters}
        currentSearchTerm={searchTerm}
        currentSearchField={searchField}
        currentStatusFilter={statusFilter}
        currentSortField={sortField}
        currentSortOrder={sortOrder}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onView={(indent) =>{
        navigate(ROUTES.PURCHASE_ORDER.VIEW('purchaseIndent', indent.id))
      }}
        onClear={handleClearFilters}
      />
    </div>
  );
}

export default PurchaseIndent;
