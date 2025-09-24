import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { toast } from "react-toastify";

function PurchaseInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRN = async () => {
      try {
        const response = await fetch(
          `${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`
        );
        if (!response.ok) throw new Error("Failed to fetch GRN");
        const data = await response.json();
        const grn = data.data;

        setFormData({
          grn_number: grn.grn_number,
          order_id: grn.order_id,
          invoice_date: new Date().toISOString().slice(0, 10),
          total_amount: grn.total_amount,
          status: grn.status,
          items:
            grn.goodReceiptNoteItems?.map((item) => ({
              product_id: item.product_id,
              batch_number: item.batch_number,
              expiry_date: item.expiry_date?.slice(0, 10),
              ordered_qty: item.ordered_qty,
              recevied_qty: item.recevied_qty,
              damaged_qty: item.damaged_qty,
              shortage_qty: item.shortage_qty,
              item_price: item.item_price,
              item_mrp: item.item_mrp,
              totalAmount: item.totalAmount,
            })) || [],
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching GRN:", err);
        setLoading(false);
      }
    };

    fetchGRN();
  }, [id]);

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const payload = {
      grn_id: Number(id),
      invoice_date: formData.invoice_date,
      items: formData.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.recevied_qty,
        item_price: item.item_price,
        item_mrp: item.item_mrp,
      })),
    };

    try {
      const url = `${ALLEndpoint.PurchaseInvoiceEndpoints.addPurchaseInvoice.endpoint}`;
      const response = await fetch(url, {
        method: `${ALLEndpoint.PurchaseInvoiceEndpoints.addPurchaseInvoice.method}`,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const resData = await response.json();

        if (Array.isArray(resData.message)) {
          resData.message.forEach((err) => {
            toast.error(`${err.field}: ${err.message}`);
          });
        } else {
          toast.error(resData.error || resData.message || "Something went wrong");
        }
        setLoading(false);
        return;
      }

      toast.success("Invoice created successfully!");
      navigate(ROUTES.PURCHASE_INVOICE.LIST);
    } catch (err) {
      console.error("Error saving invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) {
    return <p className="text-center text-lg font-medium">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Create Purchase Invoice
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="GRN Number" value={formData.grn_number} />
            <InputField label="Order ID" value={formData.order_id} />
            <InputField label="Invoice Date" value={formData.invoice_date} />
            <InputField label="Status" value={formData.status} />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Items</h3>
            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-3 border p-3 rounded-lg bg-gray-50"
                >
                  <InputField label="Product ID" value={item.product_id} />
                  <InputField label="Batch" value={item.batch_number} />
                  <InputField label="Expiry" value={item.expiry_date} />
                  <InputField label="Ordered Qty" value={item.ordered_qty} />
                  <InputField label="Received Qty" value={item.recevied_qty} />
                  <InputField label="Shortage" value={item.shortage_qty} />
                  <InputField label="Damaged" value={item.damaged_qty} />
                  <InputField label="Price" value={item.item_price} />
                  <InputField label="MRP" value={item.item_mrp} />
                </div>
              ))}
            </div>
          </div>

       
          <InputField
            label="Total Amount"
            value={formData.total_amount}
            full
          />

      
          <div className="flex justify-center">
            <button
              type="submit"
              className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition flex items-center justify-center ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Invoice"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const InputField = ({ label, value, full = false }) => (
  <div className={`${full ? "col-span-full" : ""}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type="text"
      value={value}
      readOnly
      className="w-full border rounded-md px-3 py-2 bg-gray-100 focus:outline-none"
    />
  </div>
);

export default PurchaseInvoiceForm;
