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
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-md">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Vendor" : "Add Vendor"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="contact_person"
          placeholder="Contact Person"
          value={formData.contact_person}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="gst_number"
          placeholder="GST Number"
          value={formData.gst_number}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        ></textarea>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex justify-between">
          <button type="button" onClick={() => navigate("/vendor")} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {id ? "Update Vendor" : "Add Vendor"}
        </button>
        </div>
      </form>
    </div>
  );
}

export default VendorForm;
