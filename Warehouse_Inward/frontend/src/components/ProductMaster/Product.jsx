import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonDataTable from "../utility/commonDataTable.jsx";
import { ALLEndpoint } from "../../constant/endPoints.js";
import { useFetchData } from "../../hooks/useFetchData.hooks.js";
import { useDeleteData } from "../../hooks/useDeleteData.hooks.js";
import { columns, searchFields, statusFilters } from "../../constant/productConstant.js";
import { ROUTES } from "../../constant/routePath.js";
import { LIMITPAGE } from "../../constant/productConstant.js";

function Product() {
  const [page, setPage] = useState(1);
  const limit = LIMITPAGE;
  const navigate = useNavigate();

  const FILTER_KEY = "productFilters";

const setFilterState = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getFilterState = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("d");


  const { data: products, metadata, loading, setData: setProducts } =
    useFetchData({
      endpoint: ALLEndpoint.ProductEndpoints.getProduct.endpoint,
      name: "product",
      page,
      limit,
      debounceDelay: 500,
      searchTerm,
      searchField,
      statusFilter,
      sortField,
      sortOrder,
    });

  const { deleteItem } = useDeleteData(
    ALLEndpoint.ProductEndpoints.deleteProduct.endpoint,
    ALLEndpoint.ProductEndpoints.deleteProduct.method
  );

  const handleDelete = (product_code) => {
    deleteItem({
      idField: "product_code",
      idValue: product_code,
      setState: setProducts,
    });
  };

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


  return (
    <div>
      <CommonDataTable
        columns={columns}
        data={products}
        page={page}
        limit={limit}
        metadata={metadata}
        loading={loading}
        setPage={setPage}
        searchFields={searchFields}
        statusFilters={statusFilters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onSort={handleSort}
        onAdd={() => navigate(ROUTES.PRODUCT.ADD)}
        onEdit={(product) =>
          navigate(ROUTES.PRODUCT.EDIT(product.id))
        }
        onDelete={(product) => handleDelete(product.product_code)}
      />
    </div>
  );
}

export default Product;
