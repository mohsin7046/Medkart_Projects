import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import {  toast } from "react-toastify";

function Product() {
  const [products, setProducts] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); 

  const limit = 2;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit,
          sortby: `${sortField},${sortOrder}`,
        });

        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter !== "all") params.append("status", statusFilter);
        params.append("name", "product");

        if (searchField) {
          params.append("field", searchField);
        }

        const response = await fetch(
          `http://localhost:3000/api/v1/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data.data?.data || []);
        setMetadata(data.data?.metadata || {});
        toast.success("Products fetch successfully")
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, searchTerm, searchField, statusFilter, sortField, sortOrder]);

  const handleDelete = (product_code) => async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/products`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.error || "Failed to delete product");
          return;
        }

        toast.success("Product deleted successfully!");
        setProducts(products.filter((p) => p.product_code !== product_code));
       
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Something went wrong while deleting product.");
      }
    }
  };

  return (
    <div>

      <div className="bg-white shadow-md p-4 rounded-md mb-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded-md w-52"
          />

          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="name">Name</option>
            <option value="product_code">Product Code</option>
            <option value="category">Category</option>
            <option value="product_price">Price</option>
            <option value="product_mrp">MRP</option>
            <option value="hsn_code">HSN</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="a">Ascending</option>
            <option value="d">Descending</option>
          </select>
        </div>

        <button
          onClick={() => navigate("/product/add")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Add Product +
        </button>
      </div>

      <div className="bg-white shadow-md p-4 rounded-md overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">IDX</th>
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
              {products.length > 0 ? (
                products.map((p, idx) => (
                  <tr key={p.id} className="text-center">
                    <td className="border px-4 py-2">
                      {(page - 1) * limit + idx + 1}
                    </td>
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
                        onClick={handleDelete(p.product_code)}
                        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <FiTrash2 className="text-red-500" size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={!metadata.page || page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {metadata.page || 1} of {metadata.totalPages || 1}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= (metadata.totalPages || 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Product;
