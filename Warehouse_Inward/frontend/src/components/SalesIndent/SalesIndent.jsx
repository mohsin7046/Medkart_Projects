import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE, salesIndentColumns, salesIndentSearchFields, salesIndentStatusFilters,FILTER_KEY_INDENT,defaultIndentValue } from "../../constant/salesIndentConstant.js";
import { getFilterState, setFilterState } from "../../constant/commonFilterLocal.js";

export const SalesIndent = () => {
  
  const limit = LIMITPAGE;
  const navigate = useNavigate();
  const initialFilters = getFilterState(FILTER_KEY_INDENT, defaultIndentValue);

  const [page, setPage] = useState(initialFilters.page);
  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm);
  const [searchField, setSearchField] = useState(initialFilters.searchField);
  const [statusFilter, setStatusFilter] = useState(initialFilters.statusFilter);
  const [sortField, setSortField] = useState(initialFilters.sortField);
  const [sortOrder, setSortOrder] = useState(initialFilters.sortOrder);

    useEffect(() => {
    const filters = { page, searchTerm, searchField, statusFilter, sortField, sortOrder };
    setFilterState(FILTER_KEY_INDENT, filters);
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const { data: salesOrders, metadata, loading, setData: setSalesIndents } =
    useFetchData({
      endpoint: ALLEndpoint.SalesIndentEndpoints.getSalesIndent.endpoint,
      name: "saleindent",
      page,
      limit,
      debounceDelay: 500,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    });


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
    setPage(defaultIndentValue.page);
    setSearchTerm(defaultIndentValue.searchTerm);
    setSearchField(defaultIndentValue.searchField);
    setStatusFilter(defaultIndentValue.statusFilter);
    setSortField(defaultIndentValue.sortField);
    setSortOrder(defaultIndentValue.sortOrder);

    setFilterState(FILTER_KEY_INDENT, defaultIndentValue);
  };


  return (
    <div>
      <CommonDataTable
        columns={salesIndentColumns}
        data={salesOrders}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={salesIndentSearchFields}
        statusFilters={salesIndentStatusFilters}
        currentSearchTerm={searchTerm}
        currentSearchField={searchField}
        currentStatusFilter={statusFilter}
        currentSortField={sortField}
        currentSortOrder={sortOrder}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onClear={handleClearFilters}
        onView={(order) => {
          navigate(ROUTES.SALES_INDENT.VIEW('salesIndent', order.id))
        }
        }
      />
    </div>
  );
};

