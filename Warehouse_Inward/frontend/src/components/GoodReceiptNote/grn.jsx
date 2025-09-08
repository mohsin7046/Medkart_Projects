import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import CommonDataTable from "../../components/utility/commonDataTable.jsx";
import {
  grnColumns,
  grnSearchFields,
  grnStatusFilters,
} from "../../constant/grnConstant.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE } from "../../constant/grnConstant.js";

function GRNList() {
  const [page, setPage] = useState(1);
  const limit = LIMITPAGE;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("grn_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");

  const {
    data: grns,
    metadata,
    loading,
    setData: setGrns,
  } = useFetchData({
    endpoint: ALLEndpoint.GRNEndpoints.getGRN.endpoint,
    name: "grn",
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
    ALLEndpoint.GRNEndpoints.deleteGRN.endpoint,
    ALLEndpoint.GRNEndpoints.deleteGRN.method
  );

  const handleDelete = (grn_id) => {
    deleteItem({
      idField: "grn_id",
      idValue: grn_id,
      setState: setGrns,
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
      columns={grnColumns}
      data={grns}
      page={page}
      limit={limit}
      metadata={metadata}
      loading={loading}
      setPage={setPage}
      searchFields={grnSearchFields}
      statusFilters={grnStatusFilters}
      onSearch={handleSearch}
      onFilter={handleFilter}
      onSort={handleSort}
      onEdit={(grn) =>
        navigate(ROUTES.GRN.EDIT(grn.id))
      }
      onView={(grn) =>
        navigate(ROUTES.GRN.VIEW('grn',grn.id))
      }
      onDelete={(grn) => handleDelete(grn.id)}
      extraAction={(grn) => (
        <button
          onClick={() => navigate(ROUTES.PURCHASE_INVOICE.ADD(grn.id))}
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Invoice
        </button>
      )}
    />
  );
}

export default GRNList;
