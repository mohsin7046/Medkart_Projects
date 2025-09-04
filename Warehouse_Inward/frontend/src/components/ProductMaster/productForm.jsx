import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    product_code:"",
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

  const unitOptions = [
    { value: "pcs", label: "PCS" },
    { value: "ml", label: "ML" },
    { value: "kg", label: "KG" },
    { value: "liter", label: "Liter" },
    { value: "packet", label: "Packet" },
  ];

  const combinationOptions = [
    { value: "paracetemol", label: "paracetemol" },
    { value: "azithromycin", label: "azithromycin" },
    { value: "cetrazin", label: "cetrazin" },
    { value: "diclo", label: "diclo" },
    { value: "paracetemol 500", label: "paracetemol 500" },
    { value: "paracetemol 700", label: "paracetemol 700" },
    { value: "azithromycin 500", label: "azithromycin 500" },
  ];

  
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:3000/api/v1/products/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch product");
          }
          const res = await response.json();

         const data = res.data;
         
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

          setLoading(false);
        } catch (error) {
          console.error(error);
          toast.error("Error loading product details");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;

    if (
      ["product_mrp", "product_price", "last_purchase_price", "gst_percentage"].includes(name)
    ) {
      if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCombinationChange = (selected) => {
    setIsDirty(true);
    setFormData({
      ...formData,
      combination: selected ? selected.map((opt) => opt.value) : [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "http://localhost:3000/api/v1/products";
      let method = "POST";

      if (id) {
        url = `http://localhost:3000/api/v1/products`;
        method = "PUT";
      }

      const payload = {
        ...formData,
        product_mrp: formData.product_mrp ? parseFloat(formData.product_mrp) : 0,
        product_price: formData.product_price ? parseFloat(formData.product_price) : 0,
        last_purchase_price: formData.last_purchase_price
          ? parseFloat(formData.last_purchase_price)
          : 0,
        gst_percentage: formData.gst_percentage
          ? parseFloat(formData.gst_percentage)
          : 0,
        hsn_code: formData.hsn_code,
      };

      console.log(payload);
      

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const Error = await response.json();
        toast.error("Error: " + Error.error);
        setLoading(false);
        return;
      }

      await response.json();
      toast.success(id ? "Product updated successfully!" : "Product added successfully!");
      setIsDirty(false);
      setLoading(false);
      navigate("/product");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      if (!window.confirm("Entered data may be lost. Do you want to continue?")) {
        return;
      }
    }
    navigate("/product");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          {id ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- Product fields --- */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">
              Combination <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              options={combinationOptions}
              value={formData.combination.map((c) => ({ value: c, label: c }))}
              onChange={handleCombinationChange}
              placeholder="Select or type combinations"
            />
          </div>

          {/* Numbers */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Product MRP</label>
            <input
              type="text"
              name="product_mrp"
              value={formData.product_mrp}
              onChange={handleChange}
              placeholder="Enter MRP"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Product Price</label>
            <input
              type="text"
              name="product_price"
              value={formData.product_price}
              onChange={handleChange}
              placeholder="Enter selling price"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Last Purchase Price</label>
            <input
              type="text"
              name="last_purchase_price"
              value={formData.last_purchase_price}
              onChange={handleChange}
              placeholder="Enter last purchase price"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Dropdowns */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Unit of Measure</label>
            <select
              name="unit_of_measure"
              value={formData.unit_of_measure}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            >
              <option value="">Select unit</option>
              {unitOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">HSN Code</label>
            <input
              type="text"
              name="hsn_code"
              value={formData.hsn_code}
              onChange={handleChange}
              placeholder="Enter HSN code"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">GST Percentage</label>
            <input
              type="text"
              name="gst_percentage"
              value={formData.gst_percentage}
              onChange={handleChange}
              placeholder="Enter GST %"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          {/* Textarea */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              rows="3"
              className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              required
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
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
              {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
