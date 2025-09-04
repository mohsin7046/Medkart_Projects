import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

function VendorForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
    if (id) {
      const fetchVendor = async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://localhost:3000/api/v1/vendors/${id}`);
          if (!res.ok) throw new Error("Failed to fetch vendor");
          const response = await res.json();
          const data = response.data;

          console.log(data);
          
          setFormData({
            name: data.name || "",
            email: data.email || "",
            vendor_code:data.vendor_code,
            contact_person: data.contact_person || "",
            contact_number: data.contact_number?.toString() || "",
            gst_number: data.gst_number?.toString() || "",
            address: data.address || "",
            status: data.status || "active",
          });

          setLoading(false);
        } catch (error) {
          console.error(error);
          toast.error("Error loading vendor details");
          setLoading(false);
        }
      };

      fetchVendor();
    }
  }, [id]);


  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;


    if (["contact_number", "gst_number"].includes(name)) {
      if (value === "" || (/^\d*$/.test(value) && parseInt(value, 10) >= 0)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "http://localhost:3000/api/v1/vendors";
      let method = "POST";

      if (id) {
        url = `http://localhost:3000/api/v1/vendors`;
        method = "PUT";
      }

      console.log(formData);
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        toast.error("Error: " + err.error);
        setLoading(false);
        return;
      }

      await response.json();
      toast.success(id ? "Vendor updated successfully!" : "Vendor added successfully!");
      setIsDirty(false);
      setLoading(false);
      navigate("/vendor");
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  // Handle back/cancel with confirmation
  const handleBack = () => {
    if (isDirty) {
      if (!window.confirm("Entered data may be lost. Do you want to continue?")) {
        return;
      }
    }
    navigate("/vendor");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {id ? "Edit Vendor" : "Add Vendor"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendor Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Vendor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter vendor name"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_person"
              value={formData.contact_person}
              onChange={handleChange}
              placeholder="Enter contact person"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* GST Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              GST Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="gst_number"
              value={formData.gst_number}
              onChange={handleChange}
              placeholder="Enter GST number"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter vendor address"
              rows="3"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-between mt-8">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg shadow text-white ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Saving..." : id ? "Update Vendor" : "Add Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorForm;
