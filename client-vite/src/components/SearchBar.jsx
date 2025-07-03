import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) onSearch(query);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter song name..."
        className="px-4 py-2 rounded-md border w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;
