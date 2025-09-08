import { useState, useEffect, useRef } from "react";

export function SearchSelect({ type, value, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isSelecting = useRef(false);

  useEffect(() => {

    if (value) {
      setQuery(value);
    }else {
      setQuery(""); 
    }

  }, [value]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    if (isSelecting.current) {

      isSelecting.current = false;
      return;
    }


    const delayDebounce = setTimeout(async () => {
      const res = await fetch(`http://localhost:3000/api/v1/${type}s/search/${query}`);
      const data = await res.json();
       setResults(data.data || []);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, type]);



  return (
    <div className="relative w-full">
      <input
        type="text"
        className="border p-2 w-full rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${type}...`}
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute bg-white border w-full max-h-40 overflow-y-auto z-10">
          {results.map((item) => (
            <li
              key={item.id || item[`${type}_code`]}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => {
                setQuery(item.name);
                isSelecting.current = true;
                setShowDropdown(false);
                onSelect(item);
              }}
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
