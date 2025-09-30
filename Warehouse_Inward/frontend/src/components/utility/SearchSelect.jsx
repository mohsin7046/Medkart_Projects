import { useState,useEffect,useRef } from "react";

export function SearchSelect({ type, value, onSelect, selectedIds = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const isSelecting = useRef(false);

  useEffect(() => {
    if (value) setQuery(value);
    else setQuery("");
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
      if (value && query === value) {
        setShowDropdown(false);
        return;
      }
      const res = await fetch(`http://localhost:5000/api/v1/${type}s/search/${query}`);
      const data = await res.json();

    
      const filtered = (data.data || []).filter(
        (item) => !selectedIds.includes(item.id)
      );

      setResults(filtered);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, type, selectedIds]);

  return (
    <div className="relative">
      <input
        className="border w-full rounded-lg px-3 py-2  focus:ring-2 focus:ring-blue-400 outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search ${type}...`}
      />
      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow">
          {results.map((item) => (
            <li
              key={item.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
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
