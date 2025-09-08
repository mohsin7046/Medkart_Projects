import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import {
  purchaseOrderColumns,
  purchaseOrderSearchFields,
  purchaseOrderStatusFilters,
} from "../../constant/purchaseOrderConstant.js";

function PurchaseOrder() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("order_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");

  const {
    data: orders,
    metadata,
    loading,
    setData: setOrders,
  } = useFetchData({
    endpoint: ALLEndpoint.PurchaseOrderEndpoints.getPurchaseOrder.endpoint,
    name: "order",
    page,
    limit,
    searchTerm,
    searchField,
    statusFilter,
    sortField,
    sortOrder,
    debounceDelay: 500,
  });

  const { deleteItem } = useDeleteData(
    ALLEndpoint.PurchaseOrderEndpoints.deletePurchaseOrder.endpoint,
    ALLEndpoint.PurchaseOrderEndpoints.deletePurchaseOrder.method
  );

  const handleDelete = (order_id) => {
    deleteItem({
      idField: "order_id",
      idValue: order_id,
      setState: setOrders,
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

  return (
    <CommonDataTable
      title="Purchase Order List"
      columns={purchaseOrderColumns}
      data={orders}
      page={page}
      limit={limit}
      metadata={metadata}
      loading={loading}
      setPage={setPage}
      searchFields={purchaseOrderSearchFields}
      statusFilters={purchaseOrderStatusFilters}
      onSearch={handleSearch}
      onFilter={handleFilter}
      onSort={handleSort}
      onAdd={() => navigate("/purchase-order/add")}
      onEdit={(order) =>
        navigate(`/purchase-order/edit/${order.id}`, { state: { order } })
      }
      onDelete={(order) => handleDelete(order.id)}
      extraAction={(order) => {
        const isDisabled = ["completed", "cancelled"].includes(order.status);
        return (
          <button
            disabled={isDisabled}
            onClick={() =>
              navigate(`/grn/add/${order.id}`, { state: { order } })
            }
            className={`bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 transition-colors ${
              isDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Create GRN
          </button>
        );
      }}
    />
  );
}

export default PurchaseOrder;
