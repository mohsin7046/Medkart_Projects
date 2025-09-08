import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import {
  invoiceColumns,
  invoiceSearchFields,
  invoiceStatusFilters,
} from "../../constant/purchaseInvoiceConstant.js";

function PurchaseInvoiceList() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("invoice_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");

  const {
    data: invoices,
    metadata,
    loading,
    setData: setInvoices,
  } = useFetchData({
    endpoint: ALLEndpoint.PurchaseInvoiceEndpoints.getPurchaseInvoice.endpoint,
    name: "invoice",
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
    ALLEndpoint.PurchaseInvoiceEndpoints.deletePurchaseInvoice.endpoint,
    ALLEndpoint.PurchaseInvoiceEndpoints.deletePurchaseInvoice.method
  );

  const handleDelete = (invoice_id) => {
    deleteItem({
      idField: "invoice_id",
      idValue: invoice_id,
      setState: setInvoices,
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
    <div>
      <CommonDataTable
        columns={invoiceColumns}
        data={invoices}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={invoiceSearchFields}
        statusFilters={invoiceStatusFilters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onAdd={() => navigate("/purchase-invoice/add")}
        onEdit={(invoice) =>
          navigate(`/purchase-invoice/view/${invoice.id}`, { state: { invoice } })
        }
        onDelete={(invoice) => handleDelete(invoice.id)}
      />
    </div>
  );
}

export default PurchaseInvoiceList;
