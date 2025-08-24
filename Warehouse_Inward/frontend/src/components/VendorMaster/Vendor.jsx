import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";

function Vendor() {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/vendors/getAllvendor"
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setVendors(data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };
    fetchData();
  }, []);

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendor_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gst_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : v.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (vendor_code) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/vendors/deleteVendor`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vendor_code }),
          }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        setVendors(vendors.filter((v) => v.vendor_code !== vendor_code));
      } catch (error) {
        console.error("Error deleting vendor:", error);
      }
    }
  };

  return (
    <div>
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name, code, email, or GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded-md w-64"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
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
            {filteredVendors.length > 0 ? (
              filteredVendors.map((v, idx) => (
                <tr key={v.id} className="text-center">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2 break-words">{v.vendor_code}</td>
                  <td className="border px-4 py-2 break-words">{v.name}</td>
                  <td className="border px-4 py-2 break-words">{v.email}</td>
                  <td className="border px-4 py-2 break-words">
                    {v.contact_person} ({v.contact_number})
                  </td>
                  <td className="border px-4 py-2 break-words">{v.gst_number}</td>
                  <td className="border px-4 py-2 break-words">{v.address}</td>
                  <td className="border px-4 py-2">{v.status}</td>
                  <td className="border px-4 py-2" >
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/vendor/edit/${v.id}`, { state: v })}
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
      </div>
    </div>
  );
}

export default Vendor;
