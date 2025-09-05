import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import { columns,searchFields,statusFilters } from "../../constant/vendorConstant.js";

function Vendor() {
  const [page, setPage] = useState(1);
  const limit = 2;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");


  const { data: vendors, metadata, loading, setData: setVendors } = useFetchData({
    endpoint: ALLEndpoint.VendorEndpoints.getVendor.endpoint,
    name: "vendor",
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
    ALLEndpoint.VendorEndpoints.deleteVendor.endpoint,
    ALLEndpoint.VendorEndpoints.deleteVendor.method
  );

  const handleDelete = (vendor_code) => {
    deleteItem({
      idField: "vendor_code",
      idValue: vendor_code,
      setState: setVendors,
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
        columns={columns}
        data={vendors}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={searchFields}
        statusFilters={statusFilters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onAdd={() => navigate("/vendor/add")}
        onEdit={(vendor) =>
          navigate(`/vendor/edit/${vendor.id}`, { state: { vendor } })
        }
        onDelete={(vendor) => handleDelete(vendor.vendor_code)}
      />
    </div>
  );
}

export default Vendor;
