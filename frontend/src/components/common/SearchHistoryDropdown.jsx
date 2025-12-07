import React from 'react';

const SearchHistoryDropdown = ({ items = [], query = '', visible = false, onSelect, onClear }) => {
  if (!visible) return null;

  const q = (query || '').trim().toLowerCase();
  const filtered = q ? items.filter(i => i.toLowerCase().includes(q)) : items;

  return (
    <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
      <div className="p-2">
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 px-2 py-2">No recent searches</div>
        ) : (
          filtered.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelect && onSelect(item)}
              className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-sm text-gray-800 dark:text-gray-100"
            >
              {item}
            </button>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-2 flex justify-end">
          <button
            onClick={onClear}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchHistoryDropdown;
