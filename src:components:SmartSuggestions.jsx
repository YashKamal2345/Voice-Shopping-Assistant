import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaTags, FaShoppingBag, FaLeaf } from 'react-icons/fa';
import suggestionsEngine from '../utils/suggestionsEngine';

const SmartSuggestions = ({ currentItems, onAddItem }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [currentItems]);

  const loadSuggestions = () => {
    setLoading(true);
    try {
      const allSuggestions = suggestionsEngine.getAllSuggestions(currentItems);
      setSuggestions(allSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestionIcon = (type) => {
    switch(type) {
      case 'personalized': return <FaShoppingBag className="text-blue-500" />;
      case 'seasonal': return <FaLeaf className="text-green-500" />;
      case 'running-low': return <FaLightbulb className="text-yellow-500" />;
      case 'substitute': return <FaTags className="text-purple-500" />;
      default: return <FaLightbulb className="text-gray-500" />;
    }
  };

  const getSuggestionColor = (type) => {
    switch(type) {
      case 'personalized': return 'border-blue-200 bg-blue-50';
      case 'seasonal': return 'border-green-200 bg-green-50';
      case 'running-low': return 'border-yellow-200 bg-yellow-50';
      case 'substitute': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const handleAddSuggestion = (suggestion) => {
    onAddItem(suggestion.item, 1, '', '');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-500">No suggestions available yet.</p>
        <p className="text-sm text-gray-400">Start adding items to get personalized suggestions!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaLightbulb className="text-yellow-500 mr-2" />
          Smart Suggestions
        </h3>
        <button
          onClick={loadSuggestions}
          className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={`${suggestion.item}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className={`suggestion-card ${getSuggestionColor(suggestion.type)}`}
              onClick={() => handleAddSuggestion(suggestion)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {suggestion.item}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {suggestion.reason}
                  </p>
                  <button
                    className="mt-2 text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddSuggestion(suggestion);
                    }}
                  >
                    Add to list
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {suggestions.length === 8 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Showing top suggestions
        </p>
      )}
    </div>
  );
};

export default SmartSuggestions;
