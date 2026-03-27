// Searchable combobox: type to filter options, pick from list, or clear (filters / reports).
import { useEffect, useId, useRef, useState } from "react";

/**
 * @param {"live"|"commit"} inputMode
 *   - live: input value is controlled by `value`; onChange fires on every keystroke (matches legacy report filters).
 *   - commit: typing only filters the list; parent `value` updates when user picks an option or clears.
 */
export default function SearchableSelect({
  id: idProp,
  options = [],
  value = "",
  onChange,
  placeholder = "Search or select…",
  allowClear = true,
  inputMode = "commit",
  className = "",
  size = "md",
  /** Show × next to chevron; list always has “Clear filter” when allowClear */
  showInlineClear = true,
}) {
  const autoId = useId();
  const id = idProp || `searchable-${autoId}`;
  const listboxId = `${id}-listbox`;
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (inputMode === "commit") {
      setDraft(value);
    }
  }, [value, inputMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayForFilter = inputMode === "live" ? value : draft;
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(String(displayForFilter).toLowerCase())
  );

  const inputPadding = size === "sm" ? "p-2 pr-20 text-sm" : "p-3 pr-10 text-base";

  const handleInputChange = (e) => {
    const v = e.target.value;
    if (inputMode === "live") {
      onChange(v);
    } else {
      setDraft(v);
    }
    setOpen(true);
  };

  const handleSelect = (opt) => {
    if (inputMode === "live") {
      onChange(opt);
    } else {
      onChange(opt);
      setDraft(opt);
    }
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    if (inputMode === "commit") {
      setDraft("");
    }
    setOpen(false);
  };

  const inputValue = inputMode === "live" ? value : draft;
  const hasSelection = Boolean(inputMode === "live" ? value : value);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        autoComplete="off"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={`w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${inputPadding}`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {showInlineClear && hasSelection && allowClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-0.5"
            title="Clear selection"
            aria-label="Clear selection"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-0.5"
          aria-label={open ? "Close list" : "Open list"}
        >
          <svg
            className={`w-5 h-5 transform transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 transition-colors"
        >
          {allowClear && (
            <div
              role="option"
              className="p-2 sm:p-3 border-b border-gray-100 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200"
              onClick={handleClear}
            >
              Clear filter (all)
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="p-3 text-gray-500 dark:text-gray-400 text-sm">No matches found</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={opt}
                role="option"
                aria-selected={value === opt}
                onClick={() => handleSelect(opt)}
                className={`p-2 sm:p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-800 dark:text-gray-200 ${
                  value === opt ? "bg-blue-100 dark:bg-blue-900/30" : ""
                }`}
              >
                {opt}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
