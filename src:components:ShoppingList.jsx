import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaCheck, FaUndo, FaPlus, FaMinus } from 'react-icons/fa';
import categoryManager from '../utils/categoryManager';

const ShoppingList = ({ items, onUpdate, onRemove }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const categorizedItems = categoryManager.categorizeItems(items);
  const categories = categoryManager.getAllCategories();

  const filteredItems = (categoryItems) => {
    return categoryItems.filter(item => {
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && !item.checked) ||
        (filter === 'completed' && item.checked);
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  };

  const handleQuantityChange = (item, delta) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    onUpdate(item.id, { quantity: newQuantity });
  };

  const getCategoryIcon = (category) => {
    return categoryManager.getCategoryEmoji(category);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          🛒 Shopping List
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({items.length} items)
          </span>
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-lg">Your shopping list is empty</p>
          <p className="text-sm">Use the voice command to add items!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = filteredItems(categorizedItems[category] || []);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">{getCategoryIcon(category)}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({categoryItems.length})
                  </span>
                </h3>
                
                <div className="space-y-2">
                  {categoryItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`list-item ${item.checked ? 'bg-gray-50 opacity-60' : ''}`}
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <button
                          onClick={() => onUpdate(item.id, { checked: !item.checked })}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                            item.checked 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {item.checked && <FaCheck className="text-white text-xs" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {item.name}
                          </p>
                          {item.unit && (
                            <span className="text-xs text-gray-400">{item.unit}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuantityChange(item, -1)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <FaMinus className="text-xs text-gray-500" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, 1)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors"
                          >
                            <FaPlus className="text-xs text-gray-500" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 rounded hover:bg-red-100 transition-colors text-gray-400 hover:text-red-500"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
