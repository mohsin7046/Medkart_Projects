import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VIEW_CONFIG } from "../../constant/view.config.js";

function CommonView() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const config = VIEW_CONFIG[type];

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg shadow hover:opacity-90 transition"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        {config.title}
      </h2>

    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {config.headerFields.map((field) => {
          let value = getValue(data, field.key);
          if (field.isDate && value) value = new Date(value).toLocaleDateString();
          if (field.isCurrency && value) value = `₹${value}`;
          return (
            <div
              key={field.key}
              className="p-4 bg-white shadow rounded-lg border hover:shadow-md transition"
            >
              <p className="text-gray-500 text-sm">{field.label}</p>
              <p className="font-semibold text-gray-800 mt-1">{value ?? "-"}</p>
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
