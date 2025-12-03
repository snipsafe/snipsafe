import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ onSearch, languages = [], tags = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    language: 'all',
    tags: '',
    author: ''
  });

  const debouncedSearch = useCallback(() => {
    const delayedSearch = setTimeout(() => {
      onSearch(searchTerm, filters);
    }, 500); // Increased delay to reduce API calls

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, filters, onSearch]);

  useEffect(() => {
    const cleanup = debouncedSearch();
    return cleanup;
  }, [debouncedSearch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ language: 'all', tags: '', author: '' });
    setSearchTerm('');
    onSearch('', { language: 'all', tags: '', author: '' });
  };

  const hasActiveFilters = filters.language !== 'all' || filters.tags || filters.author || searchTerm;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search snippets by title, description, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 mr-2" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang._id} value={lang._id}>
                    {lang._id} ({lang.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                placeholder="react, javascript, api"
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Author
              </label>
              <input
                type="text"
                placeholder="username"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Popular Tags */}
          {tags.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 15).map(tag => (
                  <button
                    key={tag._id}
                    onClick={() => handleFilterChange('tags', tag._id)}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-full border border-slate-600 hover:border-indigo-500 transition-colors"
                  >
                    {tag._id} ({tag.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
