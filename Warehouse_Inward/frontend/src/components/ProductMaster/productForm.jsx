import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AsyncSelect from "react-select/async";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { combinations, categories, numericFields } from "../../constant/constant.js";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { TextAreaField } from "../../resuableComponent/TextAreaFeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    combination: [],
    product_mrp: "",
    product_price: "",
    last_purchase_price: "",
    unit_of_measure: "",
    hsn_code: "",
    gst_percentage: "",
    description: "",
    status: "active",
  });


  const fetchJSON = async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    return res.json();
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await fetchJSON(`${ALLEndpoint.ProductEndpoints.getProductById.endpoint}/${id}`);
        setFormData({
          name: data.name || "",
          product_code: data.product_code || "",
          category: data.category || "",
          combination: Array.isArray(data.combination) ? data.combination : [],
          product_mrp: data.product_mrp?.toString() || "",
          product_price: data.product_price?.toString() || "",
          last_purchase_price: data.last_purchase_price?.toString() || "",
          unit_of_measure: data.unit_of_measure || "",
          hsn_code: data.hsn_code || "",
          gst_percentage: data.gst_percentage?.toString() || "",
          description: data.description || "",
          status: data.status || "active",
        });
      } catch {
        toast.error("Error loading product details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value >= 0 ? value : prev[name]) : value,
    }));
  };

  const handleCombinationChange = (selected) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, combination: selected?.map((opt) => opt.value) || [] }));
  };

  const handleCategoryChange = (selected) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      category: selected?.value || "",
      unit_of_measure: selected?.uom || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = id
        ? ALLEndpoint.ProductEndpoints.updateProduct
        : ALLEndpoint.ProductEndpoints.addProduct;

      const payload = {
        ...formData,
        product_mrp: parseFloat(formData.product_mrp) || 0,
        product_price: parseFloat(formData.product_price) || 0,
        last_purchase_price: parseFloat(formData.last_purchase_price) || 0,
        gst_percentage: parseFloat(formData.gst_percentage) || 0,
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
      toast.success(id ? "Product updated!" : "Product added!");
      setIsDirty(false);
      navigate(ROUTES.PRODUCT.LIST);
    } catch (err) {
      toast.error("Error saving product!");
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async (inputValue) => {
    if (!inputValue) return [];
    try {
      const { data } = await fetchJSON(
        `${ALLEndpoint.ProductEndpoints.getCombinations.endpoint}?search=${inputValue}`
      );
      return data.map((item) => ({ value: item.value, label: item.label }));
    } catch {
      return [];
    }
  };

  const loadCategoryOptions = async (inputValue) => {
    try {
      const { data } = await fetchJSON(
        `${ALLEndpoint.ProductEndpoints.getCategories.endpoint}?search=${inputValue || ""}`
      );
      return data.map((item) => ({ value: item.value, label: item.label, uom: item.uom }));
    } catch {
      return [];
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {id ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField label="Product Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter product name" />

          <div>
            <label className="block mb-1">Category <span className="text-red-500">*</span></label>
            <AsyncSelect
              cacheOptions
              defaultOptions={categories}
              loadOptions={loadCategoryOptions}
              value={formData.category ? { value: formData.category, label: formData.category, uom: formData.unit_of_measure } : null}
              onChange={handleCategoryChange}
              isMulti={false}
              placeholder="Select category"
            />
          </div>
  
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Combination <span className="text-red-500">*</span></label>
            <AsyncSelect
              isMulti
              cacheOptions
              loadOptions={loadOptions}
              defaultOptions={combinations}
              value={formData.combination.map((c) => ({ value: c, label: c }))}
              onChange={handleCombinationChange}
              placeholder="Search and select combinations"
            />
          </div>

          <InputField label="Product MRP" name="product_mrp" value={formData.product_mrp} onChange={handleChange} required placeholder="Enter MRP" />
          <InputField label="Product Price" name="product_price" value={formData.product_price} onChange={handleChange} required placeholder="Enter price" />
          <InputField label="Last Purchase Price" name="last_purchase_price" value={formData.last_purchase_price} onChange={handleChange} required placeholder="Enter last purchase price" />
          <InputField label="Unit of Measure" name="unit_of_measure" value={formData.unit_of_measure} onChange={handleChange} readOnly placeholder="Unit of measure" />
          <InputField label="HSN Code" name="hsn_code" value={formData.hsn_code} onChange={handleChange} required placeholder="Enter HSN code" />
          <InputField label="GST Percentage" name="gst_percentage" value={formData.gst_percentage} onChange={handleChange} required placeholder="Enter GST %" />

          <TextAreaField label="Description" name="description" value={formData.description} onChange={handleChange} required placeholder="Enter description" />

          <div>
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={() =>
                (isDirty && !window.confirm("Unsaved changes. Continue?")) ||
                navigate(ROUTES.PRODUCT.LIST)
              }
            >
              Back
            </Button>

            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
