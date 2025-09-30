import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VIEW_CONFIG } from "../../constant/view.config.js";

function CommonView() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const config = VIEW_CONFIG[type];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (!config) return;
    const fetchData = async () => {
      try {
        const res = await fetch(`${config.endpoint}/${id}`);
        const response = await res.json();
        setData(response.data);
      } catch (err) {
        console.error("❌ Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, type]);

  if (!config) return <p className="p-4 text-red-600">Invalid view type</p>;
  if (loading) return <p className="p-4">Loading...</p>;
  if (!data) return <p className="p-4 text-red-600">No data available</p>;

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  const handleAction = async (action) => {
    if (!window.confirm(`Are you sure you want to ${action.label}?`)) return;
    setActionLoading(action.key);
    console.log(data);
    

    try {
      const res = await fetch(
        `${action.endpoint}`,
        {
          method: action.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: action.body ? JSON.stringify(action.body(id)) : null,
        }
      );

      const result = await res.json();
      if (res.ok) {
        alert(`✅ ${action.label} successful!`);
       
        setData((prev) => ({
          ...prev,
          status: "processed",
          ...result.data, 
        }));
      } else {
        alert(`Failed: ${result.message || "Something went wrong"}`);
      }
    } catch (err) {
      console.error("Action failed", err);
      alert(`Failed to ${action.label}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg shadow hover:opacity-90 transition"
        >
          ← Back
        </button>

        <div className="flex gap-3">
          {config.actions?.map(
            (action) =>
              (!action.showWhen || action.showWhen(data)) && (
                <button
                  key={action.key}
                  onClick={() => handleAction(action)}
                  disabled={actionLoading === action.key}
                  className={`px-4 py-2 rounded-lg shadow transition text-white ${
                    actionLoading === action.key
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {actionLoading === action.key
                    ? `${action.label}...`
                    : action.label}
                </button>
              )
          )}
        </div>
      </div>

      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {config.title}
      </h2>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {config.headerFields.map((field) => {
          let value = getValue(data, field.key);
          if (field.isDate && value) value = new Date(value).toLocaleDateString();
          if (field.isCurrency && value) value = `₹${value}`;
          return (
            <div
              key={field.key}
              className="p-3 bg-white shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition"
            >
              <p className="text-gray-500 text-xs">{field.label}</p>
              <p className="font-semibold text-gray-800 text-sm mt-1 break-words">
                {value ?? "-"}
              </p>
            </div>
          );
        })}
      </div>

   
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Orders</h3>
      <div className="overflow-x-auto w-full">
        <table className="min-w-full border border-gray-300 text-sm table-fixed">
          <thead className="bg-gray-100">
            <tr>
              {config.itemColumns.map((col) => (
                <th
                  key={col.key}
                  className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data[config.itemKey]?.map((item, i) => (
              <tr key={i} className="bg-white">
                {config.itemColumns.map((col) => {
                  let value = getValue(item, col.key);
                  if (col.isDate && value)
                    value = new Date(value).toLocaleDateString();
                  if (col.isCurrency && value) value = `₹${value}`;
                  if (col.isStatus && value) {
                    value = (
                      <span
                        className={`px-2 py-1 rounded text-white text-xs ${
                          value === "active"
                            ? "bg-green-500"
                            : value === "inactive"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {value}
                      </span>
                    );
                  }
                  return (
                    <td
                      key={col.key}
                      className="border border-gray-300 px-2 py-1 text-gray-800"
                    >
                      {value ?? "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CommonView;
