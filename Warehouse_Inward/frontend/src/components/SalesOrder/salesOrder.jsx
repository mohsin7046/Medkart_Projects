import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE, salesOrderColumns, salesOrderSearchFields, salesOrderStatusFilters } from "../../constant/salesOrderConstant.js";
import { toast } from "react-toastify";
import { STATUS } from "../../constant/constant.js";
import { getFilterState,setFilterState } from "../../constant/commonFilterLocal.js";
import { FILTER_KEY,defaultValue } from "../../constant/salesOrderConstant.js";
export const SalesOrder = () => {

  const initialFilters = getFilterState(FILTER_KEY, defaultValue);

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

  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState([]);

  const { data: salesOrders, metadata, loading, setData: setSalesOrders } =
    useFetchData({
      endpoint: ALLEndpoint.SalesOrderEndpoints.getSalesOrder.endpoint,
      name: "saleorder",
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
    ALLEndpoint.SalesOrderEndpoints.deleteSalesOrder.endpoint,
    ALLEndpoint.SalesOrderEndpoints.deleteSalesOrder.method
  );



  const handleDelete = (sales_order_id) => {
    console.log(sales_order_id);

    deleteItem({
      idField: "id",
      idValue: sales_order_id,
      setState: setSalesOrders,
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


  const handleSubmit = async (ids) => {
    try {
      const res = await fetch(ALLEndpoint.SalesOrderEndpoints.processSalesOrder.endpoint, {
        method: ALLEndpoint.SalesOrderEndpoints.processSalesOrder.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sales_order_ids: ids })
      });

      const data = await res.json();

      if (!res) {
        toast.error(data.error || "Failed to Process Sales Oder")
      }

      setSalesOrders((prevOrders) =>
        prevOrders.map((order) =>
          ids === order.id
            ? { ...order, status: STATUS.PROCESSED }
            : order
        )
      );

      console.log(data);
      toast.success("Successsfully processed the sales Order")

    } catch (error) {
      toast.error(error || "SOmething went wrong")
      console.error(error)
    }
  }

  return (
    <div>
      <CommonDataTable
        columns={salesOrderColumns}  
        data={salesOrders}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={salesOrderSearchFields}
        statusFilters={salesOrderStatusFilters}
        currentSearchTerm={searchTerm}
        currentSearchField={searchField}
        currentStatusFilter={statusFilter}
        currentSortField={sortField}
        currentSortOrder={sortOrder}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        isCheckbox={true}
        onAdd={() => navigate(ROUTES.SALES_ORDER.ADD)}
        onEdit={(order) => [STATUS.PENDING].includes(order.status) ? navigate(ROUTES.SALES_ORDER.EDIT(order.id)) : toast.error("Edit is not persibble without pending")}
        onDelete={(order) => handleDelete(order.id)}
        onView={(order) => {
          navigate(ROUTES.PURCHASE_ORDER.VIEW('salesOrder', order.id))
        }
        }
        onClear={handleClearFilters}
        extraAction={(order) => {
          const isDisabled = [STATUS.PENDING].includes(order.status);
          console.log(isDisabled);

          return (
            <button
              disabled={!isDisabled}
              onClick={() =>
                handleSubmit(order.id)
              }
              className={`bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors ${!isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Process Order
            </button>
          );
        }}
        onSelectionChange={(ids) => setSelectedIds(ids)}
      />
      <button
        onClick={() => handleSubmit(selectedIds)}
        disabled={selectedIds.length === 0}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Process Selected Orders
      </button>
    </div>
  );
};

export default SalesOrder;
