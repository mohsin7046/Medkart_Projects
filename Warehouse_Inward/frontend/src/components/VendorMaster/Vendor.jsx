import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";

function Vendor() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");
  const [page, setPage] = useState(1);

  const limit = 2;
  const navigate = useNavigate();


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
    debounceDelay: 500
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

  return (
    <div>
      
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded-md w-52"
          />

          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="name">Name</option>
            <option value="vendor_code">Vendor Code</option>
            <option value="email">Email</option>
            <option value="gst_number">GST</option>
            <option value="contact_number">Contact Number</option>
            <option value="address">Address</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="a">Ascending</option>
            <option value="d">Descending</option>
          </select>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => navigate("/vendor/add")}
        >
          Add Vendor +
        </button>
      </div>


      <div className="bg-white shadow-md p-4 rounded-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">IDX</th>
                <th className="border px-4 py-2">Vendor Code</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Contact</th>
                <th className="border px-4 py-2">GST</th>
                <th className="border px-4 py-2">Address</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length > 0 ? (
                vendors.map((v, idx) => (
                  <tr key={v.id} className="text-center">
                    <td className="border px-4 py-2">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="border px-4 py-2 break-words">{v.vendor_code}</td>
                    <td className="border px-4 py-2 break-words">{v.name}</td>
                    <td className="border px-4 py-2 break-words">{v.email}</td>
                    <td className="border px-4 py-2 break-words">
                      {v.contact_person} ({v.contact_number})
                    </td>
                    <td className="border px-4 py-2 break-words">{v.gst_number}</td>
                    <td className="border px-4 py-2 break-words">{v.address}</td>
                    <td className="border px-4 py-2">{v.status}</td>
                    <td className="border px-4 py-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/vendor/edit/${v.id}`)}
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <FiEdit className="text-green-600" size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.vendor_code)}
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <FiTrash2 className="text-red-500" size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>


      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={!metadata.page || page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {metadata.page || 1} of {metadata.totalPages || 1}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= (metadata.totalPages || 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Vendor;
