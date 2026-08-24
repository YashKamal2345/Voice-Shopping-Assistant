import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

const VoiceSearch = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [brand, setBrand] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {
      query: searchQuery,
      priceMin: priceRange.min ? parseFloat(priceRange.min) : null,
      priceMax: priceRange.max ? parseFloat(priceRange.max) : null,
      brand: brand || null
    };
    onSearch(searchParams);
  };

  const sampleSearches = [
    'organic apples',
    'milk under $5',
    'bread brand',
    'chocolate'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-3 text-gray-400 hover:text-primary-500 transition-colors"
          >
            <FaFilter />
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min price ($)"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="Max price ($)"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <input
              type="text"
              placeholder="Brand name"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </motion.div>

        <button
          type="submit"
          className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          Search
        </button>
      </form>

      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Quick searches:</p>
        <div className="flex flex-wrap gap-2">
          {sampleSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(search);
                onSearch({ query: search, priceMin: null, priceMax: null, brand: null });
              }}
              className="text-xs px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceSearch;
