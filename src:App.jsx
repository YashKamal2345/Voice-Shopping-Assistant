import React, { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import VoiceInput from './components/VoiceInput';
import ShoppingList from './components/ShoppingList';
import SmartSuggestions from './components/SmartSuggestions';
import VoiceSearch from './components/VoiceSearch';
import useShoppingList from './hooks/useShoppingList';
import './App.css';

function App() {
  const {
    items,
    addItem,
    removeItem,
    updateItem,
    getCategorizedItems
  } = useShoppingList();

  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleVoiceCommand = useCallback((command) => {
    try {
      switch (command.type) {
        case 'ADD_ITEM': {
          const { name, quantity, unit, category } = command.payload;
          const newItem = addItem(name, quantity, unit, category);
          toast.success(`Added ${name} to your list!`);
          break;
        }
        case 'REMOVE_ITEM': {
          const { name } = command.payload;
          const itemToRemove = items.find(item => 
            item.name.toLowerCase() === name.toLowerCase()
          );
          if (itemToRemove) {
            removeItem(itemToRemove.id);
            toast.success(`Removed ${name} from your list`);
          } else {
            toast.error(`Couldn't find ${name} in your list`);
          }
          break;
        }
        case 'SEARCH': {
          const { query } = command.payload;
          handleSearch({
            query,
            priceMin: null,
            priceMax: null,
            brand: null
          });
          toast.info(`Searching for ${query}...`);
          break;
        }
        default:
          toast.info('Command received');
      }
    } catch (error) {
      toast.error('Error processing command');
      console.error('Command error:', error);
    }
  }, [items, addItem, removeItem]);

  const handleSearch = useCallback((searchParams) => {
    // Simulate search results
    const mockResults = [
      { name: searchParams.query || 'Item 1', price: 2.99, brand: 'Brand A' },
      { name: searchParams.query ? `${searchParams.query} Premium` : 'Item 2', price: 4.99, brand: 'Brand B' },
      { name: searchParams.query ? `Organic ${searchParams.query}` : 'Item 3', price: 3.49, brand: 'Organic Co' }
    ];

    let filtered = mockResults;
    
    if (searchParams.priceMin) {
      filtered = filtered.filter(item => item.price >= searchParams.priceMin);
    }
    if (searchParams.priceMax) {
      filtered = filtered.filter(item => item.price <= searchParams.priceMax);
    }
    if (searchParams.brand) {
      filtered = filtered.filter(item => 
        item.brand.toLowerCase().includes(searchParams.brand.toLowerCase())
      );
    }

    setSearchResults(filtered);
    setShowSearchResults(true);
    toast.success(`Found ${filtered.length} results`);
  }, []);

  const handleAddSearchResult = useCallback((item) => {
    addItem(item.name, 1, '', '');
    toast.success(`Added ${item.name} to your list!`);
    setShowSearchResults(false);
  }, [addItem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            🎤 Voice Shopping Assistant
          </h1>
          <p className="text-gray-600 text-lg">
            Add items to your shopping list using your voice
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Voice Input & Suggestions */}
          <div className="lg:col-span-1 space-y-6">
            <VoiceInput onCommand={handleVoiceCommand} />
            <SmartSuggestions 
              currentItems={items} 
              onAddItem={(name, quantity, unit, category) => {
                addItem(name, quantity, unit, category);
                toast.success(`Added ${name} to your list!`);
              }}
            />
          </div>

          {/* Right Column - Shopping List & Search */}
          <div className="lg:col-span-2 space-y-6">
            <VoiceSearch onSearch={handleSearch} />
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  🔍 Search Results
                </h3>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{result.name}</p>
                        <p className="text-sm text-gray-500">
                          ${result.price.toFixed(2)} - {result.brand}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddSearchResult(result)}
                        className="px-3 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Close results
                </button>
              </div>
            )}

            <ShoppingList 
              items={items}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
