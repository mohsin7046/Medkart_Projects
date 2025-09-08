
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { VIEW_CONFIG } from "../../constant/view.config.js";

function CommonView() {
  const { type,id } = useParams(); 
  
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
    <div className="p-6 bg-white shadow rounded">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-700 text-white rounded"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {config.headerFields.map((field) => {
          let value = getValue(data, field.key);
          if (field.isDate && value) value = new Date(value).toLocaleDateString();
          if (field.isCurrency && value) value = `₹${value}`;
          return (
            <p key={field.key}>
              <strong>{field.label}:</strong> {value ?? "-"}
            </p>
          );
        })}
      </div>

      <h3 className="text-xl font-semibold mb-2">Items</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              {config.itemColumns.map((col) => (
                <th key={col.key} className="border px-4 py-2">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data[config.itemKey]?.map((item, i) => (
              <tr key={i} className="text-center">
                {config.itemColumns.map((col) => {
                  let value = getValue(item, col.key);
                  if (col.isDate && value) value = new Date(value).toLocaleDateString();
                  if (col.isCurrency && value) value = `₹${value}`;
                  return (
                    <td key={col.key} className="border px-4 py-2">
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
