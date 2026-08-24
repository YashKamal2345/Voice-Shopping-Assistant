import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import categoryManager from '../utils/categoryManager';
import suggestionsEngine from '../utils/suggestionsEngine';

const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('shoppingItems');
      const savedHistory = localStorage.getItem('shoppingHistory');
      
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
        for (const item of JSON.parse(savedHistory)) {
          suggestionsEngine.addToHistory(item.name);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('shoppingItems', JSON.stringify(items));
    }
  }, [items, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('shoppingHistory', JSON.stringify(history));
    }
  }, [history, loading]);

  const addItem = (name, quantity = 1, unit = '', category = null) => {
    const itemCategory = category || 'uncategorized';
    
    const existingItem = items.find(item => 
      item.name.toLowerCase() === name.toLowerCase()
    );
    
    if (existingItem) {
      const updatedItems = items.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setItems(updatedItems);
      return existingItem;
    }
    
    const newItem = {
      id: uuidv4(),
      name,
      quantity,
      unit,
      category: itemCategory,
      addedAt: new Date().toISOString(),
      checked: false
    };
    
    setItems(prev => [...prev, newItem]);
    setHistory(prev => [...prev, { ...newItem, purchasedAt: new Date().toISOString() }]);
    suggestionsEngine.addToHistory(name);
    
    return newItem;
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id, updates) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const toggleItem = (id) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const clearCheckedItems = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };

  const clearAllItems = () => {
    setItems([]);
  };

  const getItemsByCategory = () => {
    return categoryManager.categorizeItems(items);
  };

  const getItemCount = () => {
    return items.length;
  };

  const getTotalQuantity = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCategorizedItems = () => {
    return categoryManager.categorizeItems(items);
  };

  return {
    items,
    history,
    loading,
    addItem,
    removeItem,
    updateItem,
    toggleItem,
    clearCheckedItems,
    clearAllItems,
    getItemsByCategory,
    getItemCount,
    getTotalQuantity,
    getCategorizedItems
  };
};

export default useShoppingList;
