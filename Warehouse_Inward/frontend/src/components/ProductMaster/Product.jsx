import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";

function Product() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/products/getAllProducts"
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : p.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (product_code) => async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `http://localhost:3000/products/deleteProduct`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_code }),
          }
        );
        if (!response.ok){
          const Error = response.json();
          alert("Error",Error.error);
          return;
        }

        setProducts(products.filter((p) => p.product_code !== product_code));
        alert("Product deleted successfully");
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div>
      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search by name, code, or category..."
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
          onClick={() => navigate("/product/add")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Product +
        </button>
      </div>

      <div className="bg-white shadow-md p-4 rounded-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Product Code</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Category</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">MRP</th>
              <th className="border px-4 py-2">Unit</th>
              <th className="border px-4 py-2">HSN</th>
              <th className="border px-4 py-2">GST %</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p, idx) => (
                <tr key={p.id} className="text-center">
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{p.product_code}</td>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.category}</td>
                  <td className="border px-4 py-2">₹{p.product_price}</td>
                  <td className="border px-4 py-2">₹{p.product_mrp}</td>
                  <td className="border px-4 py-2">{p.unit_of_measure}</td>
                  <td className="border px-4 py-2">{p.hsn_code}</td>
                  <td className="border px-4 py-2">{p.gst_percentage}%</td>
                  <td className="border px-4 py-2">{p.status}</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() =>
                        navigate(`/product/edit/${p.id}`, {
                          state: { product: p },
                        })
                      }
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors mr-2"
                    >
                      <FiEdit className="text-green-600" size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(p.product_code)}
                      className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <FiTrash2 className="text-red-500" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Product;
