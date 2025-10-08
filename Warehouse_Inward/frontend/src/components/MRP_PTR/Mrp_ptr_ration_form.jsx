import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function MRP_PTR_RATIO_FORM() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    product_id: "",
    product_name: "",
    vendor_id: "",
    vendor_name: "",
    mrp: "",
    mrp_ptr_ratio: "",
  });

  // Fetch existing data if editing
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${ALLEndpoint.Mrp_ptr_ratio_Endpoints.get_mrp_ptr_ratioById.endpoint}/${id}`);
        const { data } = await res.json();

        setFormData({
          product_id: data.product.id,
          product_name: data.product.name,
          vendor_id: data.vendor.id,
          vendor_name: data.vendor.name,
          mrp: data.mrp || "",
          mrp_ptr_ratio: data.mrp_ptr_ratio || "",
        });
      } catch {
        toast.error("Error loading mapping details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVendorSelect = (vendor) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      vendor_id: vendor.id,
      vendor_name: vendor.name,
    }));
  };

  const handleProductSelect = (product) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      product_id: product.id,
      product_name: product.name,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = id
        ? ALLEndpoint.Mrp_ptr_ratio_Endpoints.update_mrp_ptr_ratio
        : ALLEndpoint.Mrp_ptr_ratio_Endpoints.add_mrp_ptr_ratio;

      const payload = {
        ...(id && { id: parseInt(id) }),
        product_id: formData.product_id,
        vendor_id: formData.vendor_id,
        mrp: parseFloat(formData.mrp) || 0,
        mrp_ptr_ratio: parseFloat(formData.mrp_ptr_ratio) || 0,
      };

      const res = await fetch(endpoint.endpoint, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        (Array.isArray(data.message) ? data.message : [data]).forEach((err) =>
          toast.error(err.field ? `${err.field}: ${err.message}` : err.message || "Error")
        );
        return;
      }

      toast.success(id ? "Mapping updated!" : "Mapping created!");
      setIsDirty(false);
      navigate(ROUTES.MRP_PTR_RATIO.LIST);
    } catch {
      toast.error("Error saving mapping!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {id ? "Edit MRP-PTR Mapping" : "Add MRP-PTR Mapping"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
          <div>
            <label className="block mb-1">Vendor <span className="text-red-500">*</span></label>
            <SearchSelect
              type="vendor"
              value={formData.vendor_name}
              onSelect={handleVendorSelect}
              selectedIds={formData.vendor_id ? [formData.vendor_id] : []}
            />
          </div>

          <div>
            <label className="block mb-1">Product <span className="text-red-500">*</span></label>
            <SearchSelect
              type="product"
              value={formData.product_name}
              onSelect={handleProductSelect}
              selectedIds={formData.product_id ? [formData.product_id] : []}
            />
          </div>

          <InputField
            label="MRP"
            name="mrp"
            type="number"
            value={formData.mrp}
            onChange={handleChange}
            required
            placeholder="Enter MRP"
          />

          <InputField
            label="MRP PTR Ratio"
            name="mrp_ptr_ratio"
            type="number"
            value={formData.mrp_ptr_ratio}
            onChange={handleChange}
            required
            placeholder="Enter MRP PTR Ratio"
          />

          <div className="flex justify-between mt-6">
            <Button
              variant="secondary"
              onClick={() =>
                (isDirty && !window.confirm("Unsaved changes. Continue?")) ||
                navigate(ROUTES.MRP_PTR_RATIO.LIST)
              }
            >
              Back
            </Button>

            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving..." : id ? "Update Mapping" : "Add Mapping"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MRP_PTR_RATIO_FORM;
