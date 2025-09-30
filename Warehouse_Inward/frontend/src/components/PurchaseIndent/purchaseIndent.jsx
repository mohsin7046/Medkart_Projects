import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import { columns, searchFields, statusFilters } from "../../constant/productConstant.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE } from "../../constant/productConstant.js";

function PurchaseIndent() {

  const FILTER_KEY = "productFilters";
  const navigate = useNavigate();

  const getFilterState = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
      console.log(stored);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  };

  const setFilterState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };

  const initialFilters = getFilterState(FILTER_KEY, {
    page: 1,
    searchTerm: "",
    searchField: "name",
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
    const filters = {
      page,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    };
    setFilterState(FILTER_KEY, filters);
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const { data: products, metadata, loading, setData: setProducts } =
    useFetchData({
      endpoint: ALLEndpoint.ProductEndpoints.getProduct.endpoint,
      name: "product",
      page,
      limit,
      debounceDelay: 500,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    });

  const { deleteItem } = useDeleteData(
    ALLEndpoint.ProductEndpoints.deleteProduct.endpoint,
    ALLEndpoint.ProductEndpoints.deleteProduct.method
  );

  const handleDelete = (product_code) => {
    deleteItem({
      idField: "product_code",
      idValue: product_code,
      setState: setProducts,
    });
  };

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
    searchField: "name",
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
        columns={columns}
        data={products}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={searchFields}
        statusFilters={statusFilters}
        currentSearchTerm={searchTerm}
        currentSearchField={searchField}
        currentStatusFilter={statusFilter}
        currentSortField={sortField}
        currentSortOrder={sortOrder}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onAdd={() => navigate(ROUTES.PRODUCT.ADD)}
        onEdit={(product) => navigate(ROUTES.PRODUCT.EDIT(product.id))}
        onDelete={(product) => handleDelete(product.product_code)}
         onClear={handleClearFilters}
      />
    </div>
  );
}

export default Product;