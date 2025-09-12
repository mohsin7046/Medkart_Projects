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
        console.log(response);
        
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
          if (field.isDate && value)
            value = new Date(value).toLocaleDateString();
          if (field.isCurrency && value) value = `₹${value}`;
          return (
            <div
              key={field.key}
              className="p-4 bg-white shadow rounded-lg border hover:shadow-md transition"
            >
              <p className="text-gray-500 text-sm">{field.label}</p>
              <p className="font-semibold text-gray-800 mt-1">
                {value ?? "-"}
              </p>
            </div>
          );
        })}
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Orders</h3>
      <div className="space-y-6">
        {data[config.itemKey]?.map((item, i) => (
          <div
            key={i}
            className="bg-white shadow-lg rounded-xl border p-4 hover:shadow-xl transition"
          >

            <table className="w-full text-sm border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  {config.itemColumns.map((col) => (
                    <th
                      key={col.key}
                      className="border px-3 py-2 text-left font-medium text-gray-700"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  {config.itemColumns.map((col) => {
                    let value = getValue(item, col.key);
                    if (col.isDate && value)
                      value = new Date(value).toLocaleDateString();
                    if (col.isCurrency && value) value = `₹${value}`;
                    return (
                      <td
                        key={col.key}
                        className="border px-3 py-2 text-gray-800"
                      >
                        {value ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>

     
            {config.subItemKey && item[config.subItemKey] && (
              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">
                  Products
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        {config.subItemColumns.map((subCol) => (
                          <th
                            key={subCol.key}
                            className="border px-3 py-2 text-left font-medium text-gray-700"
                          >
                            {subCol.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {item[config.subItemKey].map((subItem, j) => (
                        <tr
                          key={j}
                          className={j % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          {config.subItemColumns.map((subCol) => {
                            let value = getValue(subItem, subCol.key);
                            if (subCol.isDate && value)
                              value = new Date(value).toLocaleDateString();
                            if (subCol.isCurrency && value) value = `₹${value}`;
                            return (
                              <td
                                key={subCol.key}
                                className="border px-3 py-2 text-gray-800"
                              >
                                {Array.isArray(value)
                                  ? value.join(", ")
                                  : value ?? "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommonView;
