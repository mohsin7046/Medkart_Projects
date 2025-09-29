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

  if (!config) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-red-200">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-xl font-semibold text-red-600">Invalid view type</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-lg font-medium text-blue-900">Loading...</p>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border-2 border-blue-200">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-blue-900">No data available</p>
        </div>
      </div>
    </div>
  );

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, key) => acc?.[key], obj);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
     
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>Back</span>
        </button>

        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">
            {config.title}
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {config.headerFields.map((field, index) => {
            let value = getValue(data, field.key);
            if (field.isDate && value)
              value = new Date(value).toLocaleDateString();
            if (field.isCurrency && value) value = `₹${value}`;
            
            return (
              <div
                key={field.key}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-blue-100 hover:border-blue-300 transform hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                <p className="text-blue-600 text-xs font-semibold uppercase tracking-wide mb-2">
                  {field.label}
                </p>
                <p className="font-bold text-blue-900 text-lg break-words">
                  {value ?? "-"}
                </p>
              </div>
            );
          })}
        </div>


        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-900">
              {config.itemKey === "products" ? "Products" : 
               config.itemKey === "sales_orders" ? "Sales Orders" : "Orders"}
            </h3>
          </div>

          <div className="space-y-6">
            {data[config.itemKey]?.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-blue-100"
              >
            
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h4 className="text-white font-semibold text-lg">
                    Item #{i + 1}
                  </h4>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto rounded-xl border border-blue-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                          {config.itemColumns.map((col) => (
                            <th
                              key={col.key}
                              className="px-4 py-3 text-left font-semibold text-blue-900 whitespace-nowrap border-b-2 border-blue-200"
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="hover:bg-blue-50 transition-colors">
                          {config.itemColumns.map((col) => {
                            let value = getValue(item, col.key);
                            if (col.isDate && value)
                              value = new Date(value).toLocaleDateString();
                            if (col.isCurrency && value) value = `₹${value}`;
                            return (
                              <td
                                key={col.key}
                                className="px-4 py-3 text-blue-900 border-b border-blue-100 whitespace-nowrap"
                              >
                                {value ?? "-"}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {config.subItemKey && item[config.subItemKey] && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
                        <h4 className="text-lg font-semibold text-blue-900">
                          Products
                        </h4>
                      </div>
                      
                      <div className="overflow-x-auto rounded-xl border border-blue-100">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                              {config.subItemColumns.map((subCol) => (
                                <th
                                  key={subCol.key}
                                  className="px-4 py-3 text-left font-semibold text-blue-900 whitespace-nowrap border-b-2 border-blue-200"
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
                                className={`hover:bg-blue-50 transition-colors ${
                                  j % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                                }`}
                              >
                                {config.subItemColumns.map((subCol) => {
                                  let value = getValue(subItem, subCol.key);
                                  if (subCol.isDate && value)
                                    value = new Date(value).toLocaleDateString();
                                  if (subCol.isCurrency && value) value = `₹${value}`;
                                  return (
                                    <td
                                      key={subCol.key}
                                      className="px-4 py-3 text-blue-900 border-b border-blue-100 whitespace-nowrap"
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default CommonView;