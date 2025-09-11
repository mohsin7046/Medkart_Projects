import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { SearchSelect } from "../utility/SearchSelect.jsx";

function SalesOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_number: "",
    address: "",
    order_type: "B2C",
    items: [
      { product_id: "", vendor_id: "", product_name: "", ordered_qty: "", product_mrp: "", product_price: "" },
    ],
  });

  useEffect(() => {
    if (id){
    const fetchSalesOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ALLEndpoint.SalesOrderEndpoints.getById}/${id}`);
        const data = await res.json();
        const order = data?.data;
        if (!order) return;

        setFormData({
          name: order.name || "",
          email: order.email || "",
          contact_number: order.contact_number || "",
          address: order.address || "",
          order_type: order.order_type || "B2C",
          items: order.items?.map((i) => ({
            product_id: i.product_id || "",
            vendor_id: i.vendor_id || "",
            product_name: i.product_name || "",
            ordered_qty: i.ordered_qty?.toString() || "",
            product_mrp: i.product_mrp?.toString() || "",
            product_price: i.product_price?.toString() || "",
          })) || [],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load sales order");
      }
      setLoading(false);
    };
    fetchSalesOrder();
}
  }, [id]);

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    setIsDirty(true);
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: "", vendor_id: "", product_name: "", ordered_qty: "", product_mrp: "", product_price: "" }],
    });
  };

  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = ALLEndpoint.SalesOrderEndpoints.addSalesOrder.endpoint;
      let method = ALLEndpoint.SalesOrderEndpoints.addSalesOrder.method;
      if (id) {
        url = ALLEndpoint.SalesOrderEndpoints.updateSalesOrder.endpoint;
        method = ALLEndpoint.SalesOrderEndpoints.updateSalesOrder.method;
      }

      const payload = {
        ...formData,
        items: formData.items.map((i) => ({
          ...i,
          ordered_qty: parseFloat(i.ordered_qty) || 0,
          product_mrp: parseFloat(i.product_mrp) || 0,
          product_price: parseFloat(i.product_price) || 0,
        })),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const resData = await res.json();
        toast.error(resData.message || "Something went wrong");
        setLoading(false);
        return;
      }

      toast.success(id ? "Sales order updated!" : "Sales order created!");
      setIsDirty(false);
      navigate(ROUTES.SALES_ORDER.LIST);
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Error saving sales order");
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !window.confirm("Unsaved changes may be lost. Continue?")) return;
    navigate(ROUTES.SALES_ORDER.LIST);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{id ? "Edit Sales Order" : "Add Sales Order"}</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
          <div>
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
          </div>
          <div>
            <label>Contact Number</label>
            <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" required />
          </div>
          <div>
            <label>Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg" />
          </div>
          <div>
            <label>Order Type</label>
            <select name="order_type" value={formData.order_type} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg">
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </div>

        
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-2">Products</h3>
            {formData.items.map((item, idx) => (
              <div key={idx} className="border p-4 rounded mb-4 grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                
                <div>
                  <label>Vendor</label>
                  <SearchSelect
                    type="vendor"
                    value={item.vendor_id ? item.vendor_name : ""}
                    onSelect={(v) => handleItemChange(idx, "vendor_id", v.id)}
                  />
                </div>

              
                <div>
                  <label>Product</label>
                  <SearchSelect
                    type="product"
                    value={item.product_name || ""}
                    onSelect={(p) => {
                        console.log(p);
                        
                      handleItemChange(idx, "product_id", p.id);
                      handleItemChange(idx, "product_name", p.name);
                      handleItemChange(idx, "product_mrp", p.product_mrp);
                      handleItemChange(idx, "product_price", p.product_price);
                    }}
                  />
                </div>

               
                <div>
                  <label>Ordered Qty</label>
                  <input
                    type="number"
                    value={item.ordered_qty}
                    onChange={(e) => handleItemChange(idx, "ordered_qty", e.target.value)}
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

               
                <div>
                  <label>MRP</label>
                  <input type="number" value={item.product_mrp} readOnly disabled={!item.product_id} className="w-full border px-2 py-1 rounded bg-gray-100" />
                </div>

            
                <div>
                  <label>Price</label>
                  <input type="number" value={item.product_price} readOnly disabled={!item.product_id} className="w-full border px-2 py-1 rounded bg-gray-100" />
                </div>

                {/* Remove button */}
                <div className="flex items-end">
                  <button type="button" onClick={() => removeItem(idx)} className="bg-red-500 text-white px-3 py-1 rounded mt-2">
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addItem} className="bg-green-500 text-white px-4 py-2 rounded">
              Add Product
            </button>
          </div>

          <div className="md:col-span-2 flex justify-between mt-8">
            <button type="button" onClick={handleBack} className="bg-gray-500 text-white px-5 py-2 rounded">
              Back
            </button>
            <button type="submit" disabled={loading} className={`px-5 py-2 rounded text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              {loading ? "Saving..." : id ? "Update Sales Order" : "Create Sales Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalesOrderForm;
