import { toast } from "react-toastify";
import { useCallback } from "react";

export const useDeleteData = (endpoint, method = "DELETE",msg) => {
  const deleteItem = useCallback(
    async ({ idField, idValue, setState }) => {
     
      if (window.confirm(msg||"Are you sure you want to delete this item?")) {
        try {
          const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [idField]: idValue }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
            
            toast.error(errorData.message || "Failed to delete item");
            return false;
          }

          if (setState) {
            setState((prev) => prev.filter((item) => item[idField] !== idValue));
          }

          toast.success("Item deleted successfully");
          return true;
        } catch (error) {
          console.error("Error deleting item:", error);
          toast.error("Failed to delete item");
          return false;
        }
      }
      return false;
    },
    [endpoint, method]
  );

  return { deleteItem };
};
