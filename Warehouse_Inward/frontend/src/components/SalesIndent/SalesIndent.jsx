import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE, salesIndentColumns, salesIndentSearchFields, salesIndentStatusFilters } from "../../constant/salesIndentConstant.js";
import { toast } from "react-toastify";
import { STATUS } from "../../constant/constant.js";


export const SalesIndent = () => {
  const [page, setPage] = useState(1);
  const limit = LIMITPAGE;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("indent_number");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");

  const { data: salesOrders, metadata, loading, setData: setSalesIndents } =
    useFetchData({
      endpoint: ALLEndpoint.SalesIndentEndpoints.getSalesIndent.endpoint,
      name: "saleindent",
      page,
      limit,
      debounceDelay: 500,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    });


  const handleSearch = ({ field, value }) => {
    setSearchField(field);
    setSearchTerm(value);
    setPage(1);
  };


  const handleFilter = ({ status }) => {
    setStatusFilter(status);
    setPage(1);
  };


  const handleSort = ({ field, order }) => {
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  const handleSubmit = async (id) => {
    console.log(id);

    try {
      const res = await fetch(ALLEndpoint.SalesOrderEndpoints.processSalesOrder.endpoint, {
        method: ALLEndpoint.SalesOrderEndpoints.processSalesOrder.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sales_order_ids: id })
      });

      const data = await res.json();

      if (!res) {
        toast.error(data.error || "Failed to Process Sales Oder")
      }

      console.log(data);
      toast.success("Successsfully processed the sales Order")

    } catch (error) {
      toast.error(error || "SOmething went wrong")
      console.error(error)
    }
  }

  return (
    <div>
      <CommonDataTable
        columns={salesIndentColumns}
        data={salesOrders}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={salesIndentSearchFields}
        statusFilters={salesIndentStatusFilters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onView={(order) => {
          navigate(ROUTES.SALES_INDENT.VIEW('salesIndent', order.id))
        }
        }
      />
    </div>
  );
};

