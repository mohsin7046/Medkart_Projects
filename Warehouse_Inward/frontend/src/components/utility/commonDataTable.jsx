import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { useState,useEffect } from "react";
import { STATUS } from "../../constant/constant";

function CommonDataTable({
  columns = [],
  data = [],
  page = 1,
  limit = 10,
  metadata = {},
  loading = false,
  onEdit,
  onDelete,
  onSearch,
  onFilter,
  onSort,
  onAdd,
  onView,
  showActions = true,
  setPage,
  searchFields = [],
  statusFilters = [],
  extraAction,
  isCheckbox,
  currentSearchTerm = "",
  currentSearchField = "",
  currentStatusFilter = "",
  currentSortField = "created_at",
  currentSortOrder = "d",
  onSelectionChange,
  onClear
}) {
  const totalPages = metadata.totalPages || 1;
  const currentPage = metadata.page || page || 1;

  const [selectedIds, setSelectedIds] = useState([]);

  console.log(currentSearchField,currentSearchTerm,currentSortField,currentSortOrder,currentStatusFilter);

  const [searchTerm, setSearchTerm] = useState(currentSearchTerm || "");
  const [searchField, setSearchField] = useState(
    currentSearchField || searchFields[0]?.key || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    currentStatusFilter || statusFilters[0]?.key || ""
  );
  const [sortField, setSortField] = useState(currentSortField || "created_at");
  const [sortOrder, setSortOrder] = useState(currentSortOrder || "d");

  useEffect(() => {
    if (currentSearchTerm !== undefined && currentSearchTerm !== searchTerm) {
      setSearchTerm(currentSearchTerm);
    }
  }, [currentSearchTerm]);

  useEffect(() => {
    if (currentSearchField && currentSearchField !== searchField) {
      setSearchField(currentSearchField);
    }
  }, [currentSearchField]);

  useEffect(() => {
    if (currentStatusFilter && currentStatusFilter !== statusFilter) {
      setStatusFilter(currentStatusFilter);
    }
  }, [currentStatusFilter]);

  useEffect(() => {
    if (currentSortField && currentSortField !== sortField) {
      setSortField(currentSortField);
    }
  }, [currentSortField]);

  useEffect(() => {
    if (currentSortOrder && currentSortOrder !== sortOrder) {
      setSortOrder(currentSortOrder);
    }
  }, [currentSortOrder]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch({ field: searchField, value });
  };

  const handleSearchFieldChange = (e) => {
    const field = e.target.value;
    setSearchField(field);
    if (onSearch) onSearch({ field, value: searchTerm });
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    if (onFilter) onFilter({ status: val });
  };

  const handleSortChange = (field, order) => {
    setSortField(field);
    setSortOrder(order);
    if (onSort) onSort({ field, order });
  };

  const handleCheckboxChange = (id, status) => {
    if (status !== "pending") return;

    let updated = [];
    if (selectedIds.includes(id)) {
      updated = selectedIds.filter((x) => x !== id);
    } else {
      updated = [...selectedIds, id];
    }
    setSelectedIds(updated);
    if (onSelectionChange) onSelectionChange(updated);
  };

  const handleSelectAll = () => {
    const pendingIds = data
      .filter((item) => item.status === "pending")
      .map((item) => item.id);

    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
      if (onSelectionChange) onSelectionChange([]);
    } else {
      setSelectedIds(pendingIds);
      if (onSelectionChange) onSelectionChange(pendingIds);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md overflow-x-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="border px-3 py-1 rounded-md w-52"
          />

          {searchFields.length > 0 && (
            <select
              value={searchField}
              onChange={handleSearchFieldChange}
              className="border px-3 py-1 rounded-md"
            >
              {searchFields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          )}

          {statusFilters.length > 0 && (
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border px-3 py-1 rounded-md"
            >
              {statusFilters.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          )}

          <select
            value={sortField}
            onChange={(e) => handleSortChange(e.target.value, sortOrder)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="created_at">Created At</option>
            <option value="updated_at">Updated At</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => handleSortChange(sortField, e.target.value)}
            className="border px-3 py-1 rounded-md"
          >
            <option value="a">Ascending</option>
            <option value="d">Descending</option>
          </select>

          {onClear && (
      <button
        onClick={onClear}
        className="px-4 py-2 bg-gray-500 text-white rounded-md"
      >
        Clear Filters
      </button>
    )}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Add +
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {isCheckbox && (
                <th className="border px-4 py-2">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === data.length && data.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
              )}

              <th className="border px-4 py-2">IDX</th>

              {columns.map((col) => (
                <th key={col.key} className="border px-4 py-2">
                  {col.label}
                </th>
              ))}
              {showActions && <th className="border px-4 py-2">Action</th>}
              {extraAction && <th className="border px-4 py-2">Extra</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={item.id || idx} className="text-center">
                  {isCheckbox && (
                    <td className="border px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() =>
                          handleCheckboxChange(item.id, item.status)
                        }
                        disabled={item.status !== STATUS.PENDING}
                      />
                    </td>
                  )}
                  <td className="border px-4 py-2">
                    {(currentPage - 1) * limit + idx + 1}
                  </td>

                  {columns.map((col) => (
                    <td key={col.key} className={`border px-4 py-2`}>
                      <span
                        className={`${
                          col.background ? col.background(item[col.key]) : ""
                        } px-2 py-1 rounded-full inline-block`}
                      >
                        {col.render
                          ? col.render(item[col.key], item)
                          : item[col.key]}
                      </span>
                    </td>
                  ))}
                  {showActions && (
                    <td className="border px-4 py-2">
                      {onEdit && (
                        <button
                          disabled={[
                            STATUS.CANCELLED,
                            STATUS.COMPLETED,
                            STATUS.ALLOCATED,
                            STATUS.PARTIAL_RECEVIED,
                            STATUS.PROCESSING
                          ].includes(item.status)}
                          onClick={() => onEdit(item)}
                          className={`p-2 rounded-md hover:bg-gray-200 transition-colors mr-2 ${
                            [
                              STATUS.CANCELLED,
                              STATUS.COMPLETED,
                              STATUS.ALLOCATED,
                              STATUS.PARTIAL_RECEVIED,
                              STATUS.PROCESSING
                            ].includes(item.status)
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FiEdit className="text-green-600" size={18} />
                        </button>
                      )}
                      {onView && (
                        <button
                          disabled={[
                            STATUS.CANCELLED,
                            STATUS.COMPLETED,
                          ].includes(item.status)}
                          onClick={() => onView(item)}
                          className={`p-2 rounded-md hover:bg-gray-200 transition-colors mr-2 ${
                            [STATUS.CANCELLED, STATUS.COMPLETED].includes(
                              item.status
                            )
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FiEye className="text-orange-400" size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          disabled={[
                            STATUS.CANCELLED,
                            STATUS.COMPLETED,
                            STATUS.ALLOCATED,
                            STATUS.PARTIAL_RECEVIED,
                            STATUS.PROCESSING
                          ].includes(item.status)}
                          onClick={() => onDelete(item)}
                          className={`p-2 rounded-md hover:bg-gray-200 transition-colors mr-2 ${
                            [
                              STATUS.CANCELLED,
                              STATUS.COMPLETED,
                              STATUS.ALLOCATED,
                              STATUS.PARTIAL_RECEVIED,
                              STATUS.PROCESSING
                            ].includes(item.status)
                              ? "opacity-30 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          <FiTrash2 className="text-red-500" size={18} />
                        </button>
                      )}
                    </td>
                  )}
                  {extraAction && (
                    <td className="border px-4 py-2">{extraAction(item)}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActions ? 1 : 0) +
                    (extraAction ? 1 : 0) +
                    1
                  }
                  className="text-center py-4 text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <div className="flex justify-center items-center mt-4 space-x-2">
        <button
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default CommonDataTable;
