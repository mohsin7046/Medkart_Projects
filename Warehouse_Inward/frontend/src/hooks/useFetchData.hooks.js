import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useFetchData = ({
  endpoint,
  name,
  page = 1,
  limit = 10,
  searchTerm = "",
  searchField = "",
  statusFilter = "all",
  sortField = "created_at",
  sortOrder = "d",
  debounceDelay = 500,
}) => {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);


   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, debounceDelay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceDelay]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit,
          sortby: `${sortField},${sortOrder}`,
        });

         if (debouncedSearch) params.append("search", debouncedSearch);
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (name) params.append("name", name);
        if (searchField) params.append("field", searchField);

        const response = await fetch(`${endpoint}?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();

        console.log(result);
        
        
        setData(result.data?.data || []);
        setMetadata(result.data?.metadata || {});
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(`Failed to load ${name || "data"}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, name, page, limit, debouncedSearch, searchField, statusFilter, sortField, sortOrder]);

  return { data, metadata, loading, setData };
};
