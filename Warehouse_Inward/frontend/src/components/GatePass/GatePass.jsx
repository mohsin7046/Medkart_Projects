import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { columns, searchFields, statusFilters } from "../../constant/gatePassConstant.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE } from "../../constant/gatePassConstant.js";
import { STATUS } from "../../constant/constant.js";

function GatePass() {

  const FILTER_KEY = "gatePassFilters";
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
    searchField: "gate_pass_number",
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

  const { data: gatepass, metadata, loading, setData: setGatePass } =
    useFetchData({
      endpoint: ALLEndpoint.GatePassEndpoints.getGatePass.endpoint,
      name: "gatepass",
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
    console.log(field);
    
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
    searchField: "gate_pass_number",
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
        data={gatepass}
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
        onAdd={() => navigate(ROUTES.GATEPASS.ADD)}
        onView={(gp) => {
          navigate(ROUTES.GATEPASS.VIEW('gatePass', gp.id))
        }}
        onEdit={(gp) => navigate(ROUTES.GATEPASS.EDIT(gp.id))}
        onClear={handleClearFilters}
        extraAction={(gp) => {
          const inchecking = gp.status === STATUS.INCHECKING;
          return (
              <button
                disabled={!inchecking}
                onClick={() => navigate(ROUTES.GRN.ADD(gp.id))}
                className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200
          ${!inchecking
                    ? "bg-green-300 cursor-not-allowed opacity-60"
                    : "bg-green-500 hover:bg-green-600"}
        `}
              >
                Add GRN
              </button>
          
          );
        }}
      />
    </div>
  );
}

export default GatePass;