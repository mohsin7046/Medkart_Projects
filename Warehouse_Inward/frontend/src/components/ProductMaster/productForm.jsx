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
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
      <h2 className="text-xl font-bold mb-4">
        {id ? "Edit Product" : "Add Product"}
      </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full border px-3 py-2 rounded"
          value={formData.name}
          onChange={handleChange}
        />

        <input
          type="text"
          name="category"
          placeholder="Category"
          className="w-full border px-3 py-2 rounded"
          value={formData.category}
          onChange={handleChange}
        />

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
                className="bg-gray-200 px-2 py-1 rounded-md text-sm"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">

        <input
          type="number"
          name="product_mrp"
          placeholder="Product MRP"
          className="w-full border  px-3 py-2 rounded"
          value={formData.product_mrp}
          onChange={handleChange}
        />
        <input
          type="number"
          name="product_price"
          placeholder="Product Price"
          className="w-full border px-3 py-2 rounded"
          value={formData.product_price}
          onChange={handleChange}
        />
        </div>
        <input
          type="number"
          name="last_purchase_price"
          placeholder="Last Purchase Price"
          className="w-full border px-3 py-2 rounded"
          value={formData.last_purchase_price}
          onChange={handleChange}
        />
        <input
          type="text"
          name="unit_of_measure"
          placeholder="Unit of Measure"
          className="w-full border px-3 py-2 rounded"
          value={formData.unit_of_measure}
          onChange={handleChange}
        />
        <input
          type="text"
          name="hsn_code"
          placeholder="HSN Code"
          className="w-full border px-3 py-2 rounded"
          value={formData.hsn_code}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
          value={formData.description}
          onChange={handleChange}
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
            <button type="button" onClick={() => navigate("/product")} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {id ? "Update" : "Submit"}
        </button>
        </div>
      </form>
      
    </div>
  );
}

export default ProductForm;
