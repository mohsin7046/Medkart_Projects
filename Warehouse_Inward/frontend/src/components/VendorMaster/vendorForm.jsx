import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { TextAreaField } from "../../resuableComponent/TextAreaFeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";

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
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.VendorEndpoints.getVendorById.endpoint}/${id}`);
        const { data, message } = await res.json();
        if (!res.ok) throw new Error(message || "Error fetching vendor");

        setFormData({
          name: data.name || "",
          email: data.email || "",
          vendor_code: data.vendor_code || "",
          contact_person: data.contact_person || "",
          contact_number: data.contact_number?.toString() || "",
          gst_number: data.gst_number?.toString() || "",
          address: data.address || "",
          status: data.status || "active",
        });

        toast.success("Vendor loaded successfully");
      } catch (err) {
        toast.error("Error loading vendor details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;

    if (["contact_number", "gst_number"].includes(name)) {
      if (value === "" || (/^\d*$/.test(value) && parseInt(value, 10) >= 0)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = id
        ? ALLEndpoint.VendorEndpoints.updateVendor
        : ALLEndpoint.VendorEndpoints.addVendor;

      const res = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        (Array.isArray(data.message) ? data.message : [data]).forEach((err) =>
          toast.error(err.field ? `${err.field}: ${err.message}` : err.message || "Error")
        );
        return;
      }

      toast.success(id ? "Vendor updated successfully!" : "Vendor added successfully!");
      setIsDirty(false);
      navigate(ROUTES.VENDOR.LIST);
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !window.confirm("Unsaved changes will be lost. Continue?")) return;
    navigate(ROUTES.VENDOR.LIST);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {id ? "Edit Vendor" : "Add Vendor"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Vendor Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter vendor name" />
          <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter email address" />
          <InputField label="Contact Person" name="contact_person" value={formData.contact_person} onChange={handleChange} required placeholder="Enter contact person" />
          <InputField label="Contact Number" name="contact_number" value={formData.contact_number} onChange={handleChange} required placeholder="Enter contact number" />
          <InputField label="GST Number" name="gst_number" value={formData.gst_number} onChange={handleChange} required placeholder="Enter GST number" />

          <div>
            <label className="block text-gray-700 font-medium mb-1">Status <span className="text-red-500">*</span></label>
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

          <TextAreaField label="Address" name="address" value={formData.address} onChange={handleChange} required placeholder="Enter vendor address" />

          <div className="md:col-span-2 flex justify-between mt-8">
            <Button type="button" variant="secondary" onClick={handleBack}>Back</Button>
            <Button type="submit" variant="primary" loading={loading}>
              {id ? "Update Vendor" : "Add Vendor"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VendorForm;
