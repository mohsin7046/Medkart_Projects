import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ALLEndpoint } from "../../constant/endPoints.js";


function GRNView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [grn, setGrn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRN = async () => {
      try {
        const res = await fetch(`${ALLEndpoint.GRNEndpoints.getGRNById.endpoint}/${id}`);

        if(!res.ok){
          toast.error("Failed to fetch GRN")
        }

        const response = await res.json()
        const data  = response.data;
        console.log(data);
        
      
        setGrn(data);
        
        
        toast.success("✅ GRN data loaded successfully!");
      } catch (err) {
        toast.error( "❌ Failed to load GRN");
      } finally {
        setLoading(false);
      }
    };

    fetchGRN();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!grn) {
    return (
      <p className="text-red-500 text-center mt-6 text-lg">
        ⚠️ No GRN data found.
      </p>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg shadow-md transition"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold mb-6 text-gray-800">📦 GRN Details</h2>

      <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><span className="font-semibold">GRN Number:</span> {grn.grn_number}</p>
          <p><span className="font-semibold">Order Number:</span> {grn.purchaseOrder.order_number}</p>
          <p><span className="font-semibold">Received Date:</span> {new Date(grn.received_date).toLocaleDateString()}</p>
          <p><span className="font-semibold">Total Amount:</span> ₹{grn.total_amount}</p>
          <p className="col-span-2">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                grn.status === "completed"
                  ? "bg-green-100 text-green-700"
                  : grn.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {grn.status}
            </span>
          </p>
        </div>
      </div>

 
      <h3 className="text-2xl font-semibold mb-3 text-gray-800">🛒 Items</h3>
      <div className="overflow-x-auto shadow-lg border border-gray-100">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead>
            <tr className="bg-gray-200 text-gray-800">
              <th className="border px-4 py-2">Product ID</th>
              <th className="border px-4 py-2">Batch</th>
              <th className="border px-4 py-2">Expiry</th>
              <th className="border px-4 py-2">Qty</th>
              <th className="border px-4 py-2">Shortage Qty</th>
              <th className="border px-4 py-2">Damaged Qty</th>
              <th className="border px-4 py-2">Price</th>
              <th className="border px-4 py-2">MRP</th>
              <th className="border px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {grn.goodReceiptNoteItems?.map((item, index) => (
              <tr
                key={item.id}
                className={`text-center ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50 transition`}
              >
                <td className="border px-4 py-2">{item.product_id}</td>
                <td className="border px-4 py-2">{item.batch_number}</td>
                <td className="border px-4 py-2">
                  {new Date(item.expiry_date).toLocaleDateString()}
                </td>
                <td className="border px-4 py-2">{item.recevied_qty}</td>
                <td className="border px-4 py-2">{item.shortage_qty}</td>
                <td className="border px-4 py-2">{item.damaged_qty}</td>
                <td className="border px-4 py-2">₹{item.item_price}</td>
                <td className="border px-4 py-2">₹{item.item_mrp}</td>
                <td className="border px-4 py-2 font-semibold">₹{item.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GRNView;
