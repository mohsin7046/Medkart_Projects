export const getFilterState = (key, defaultValue) => {
    try {
      const stored = localStorage.getItem(key);
     
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return defaultValue;
    }
  };

  export const setFilterState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  };