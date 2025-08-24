import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function VendorForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const vendor = location?.state; 
 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_person: "",
    contact_number: "",
    gst_number: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    if (id && vendor) {
      setFormData({
        ...vendor,
        status: vendor.status || "active",
      });
    }
  }, [id, vendor]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = id
        ? `http://localhost:3000/vendors/update`
        : "http://localhost:3000/vendors/add-vendor";

      const method = id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Network error");

      await response.json();
      navigate("/vendor"); 
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg p-8 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {id ? "Edit Vendor" : "Add Vendor"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Vendor Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter vendor name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter email address"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter contact person name"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Contact Number</label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter contact number"
          />
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter GST number"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Address (full width row) */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            placeholder="Enter vendor address"
            rows="3"
          ></textarea>
        </div>

        {/* Buttons (full width row) */}
        <div className="md:col-span-2 flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/vendor")}
            className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            {id ? "Update Vendor" : "Add Vendor"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VendorForm;
