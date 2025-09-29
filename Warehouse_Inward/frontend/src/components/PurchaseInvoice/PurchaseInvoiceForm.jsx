import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { ROUTES } from "../../constant/routePath.js";
import { toast } from "react-toastify";
import { InputField } from "../../resuableComponent/Inputfeild.jsx";
import { Button } from "../../resuableComponent/Button.jsx";

function PurchaseInvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRN = async () => {
      try {
        const res = await fetch(`${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`);
        if (!res.ok) throw new Error("Failed to fetch GRN");
        const grn = (await res.json()).data;

        setFormData({
          grn_number: grn.grn_number,
          order_id: grn.order_id,
          invoice_date: new Date().toISOString().slice(0, 10),
          total_amount: grn.total_amount,
          status: grn.status,
          items: grn.goodReceiptNoteItems?.map((item) => ({
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
      } catch (err) {
        toast.error("Failed to fetch GRN");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGRN();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      grn_id: Number(id),
      invoice_date: formData.invoice_date,
      items: formData.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.recevied_qty,
        item_price: i.item_price,
        item_mrp: i.item_mrp,
      })),
    };

    try {
      const endpoint = ALLEndpoint.PurchaseInvoiceEndpoints.addPurchaseInvoice;
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

      toast.success("Invoice created successfully!");
      navigate(ROUTES.PURCHASE_INVOICE.LIST);
    } catch (err) {
      console.error(err);
      toast.error("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !formData) return <p className="text-center text-lg font-medium">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Create Purchase Invoice</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="GRN Number" value={formData.grn_number} readOnly />
            <InputField label="Order ID" value={formData.order_id} readOnly />
            <InputField label="Invoice Date" value={formData.invoice_date} readOnly />
            <InputField label="Status" value={formData.status} readOnly />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">Items</h3>
            <div className="space-y-4">
              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-3 border p-3 rounded-lg bg-gray-50">
                  <InputField label="Product ID" value={item.product_id} readOnly />
                  <InputField label="Batch" value={item.batch_number} readOnly />
                  <InputField label="Expiry" value={item.expiry_date} readOnly />
                  <InputField label="Ordered Qty" value={item.ordered_qty} readOnly />
                  <InputField label="Receive Qty" value={item.recevied_qty} readOnly />
                  <InputField label="Shortage" value={item.shortage_qty} readOnly />
                  <InputField label="Damaged" value={item.damaged_qty} readOnly />
                  <InputField label="Price" value={item.item_price} readOnly />
                  <InputField label="MRP" value={item.item_mrp} readOnly />
                </div>
              ))}
            </div>
          </div>

          <InputField label="Total Amount" value={formData.total_amount} full readOnly />

          <div className="flex justify-center">
            <Button type="submit" variant="primary" loading={loading}>
              Save Invoice
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseInvoiceForm;
