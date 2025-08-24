import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

function ProductForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const passedProduct = location.state?.product;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    combination: [],
    product_mrp: "",
    product_price: "",
    last_purchase_price: "",
    unit_of_measure: "",
    hsn_code: "",
    description: "",
    product_code: "",
    status: "active",
  });

  const [comboInput, setComboInput] = useState("");

  useEffect(() => {
    if (passedProduct) {
      setFormData(passedProduct);
    }
  }, [passedProduct]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddCombination = () => {
    if (comboInput.trim() !== "") {
      setFormData({
        ...formData,
        combination: [...formData.combination, comboInput],
      });
      setComboInput("");
    }
  };

  const handleRemoveCombination = (index) => {
    const updated = formData.combination.filter((_, i) => i !== index);
    setFormData({ ...formData, combination: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = "http://localhost:3000/products/add-product";
      let method = "POST";

      if (id) {
        url = "http://localhost:3000/products/update";
        method = "PUT";
      }

      console.log(url, method, formData);
      

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save product");

      await response.json();
      navigate("/product");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        {id ? "Edit Product" : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Combination */}
        <div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Add Combination"
              className="w-full border px-3 py-2 rounded"
              value={comboInput}
              onChange={(e) => setComboInput(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddCombination}
              className="px-3 py-2 bg-green-500 text-white rounded"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.combination.map((c, idx) => (
              <span
                key={idx}
                className="bg-gray-200 px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleRemoveCombination(idx)}
                  className="ml-1 text-red-500 hover:text-red-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Product MRP */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product MRP
          </label>
          <input
            type="number"
            name="product_mrp"
            value={formData.product_mrp}
            onChange={handleChange}
            placeholder="Enter MRP"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product Price
          </label>
          <input
            type="number"
            name="product_price"
            value={formData.product_price}
            onChange={handleChange}
            placeholder="Enter selling price"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Last Purchase Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Last Purchase Price
          </label>
          <input
            type="number"
            name="last_purchase_price"
            value={formData.last_purchase_price}
            onChange={handleChange}
            placeholder="Enter last purchase price"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Unit of Measure */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Unit of Measure
          </label>
          <input
            type="text"
            name="unit_of_measure"
            value={formData.unit_of_measure}
            onChange={handleChange}
            placeholder="e.g., kg, liter, pcs"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* HSN Code */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            HSN Code
          </label>
          <input
            type="text"
            name="hsn_code"
            value={formData.hsn_code}
            onChange={handleChange}
            placeholder="Enter HSN code"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Description (full width) */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="3"
            className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Status
          </label>
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

        
        <div className="md:col-span-2 flex justify-between mt-6">
          <button
            type="button"
            onClick={() => navigate("/product")}
            className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            {id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
