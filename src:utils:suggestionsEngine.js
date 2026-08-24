class SuggestionsEngine {
  constructor() {
    this.seasonalProducts = {
      summer: ['watermelon', 'strawberry', 'peach', 'mango', 'tomato', 'cucumber'],
      winter: ['orange', 'apple', 'grapefruit', 'potato', 'onion', 'carrot'],
      spring: ['asparagus', 'strawberry', 'artichoke', 'spinach', 'lettuce'],
      fall: ['pumpkin', 'apple', 'pear', 'squash', 'sweet potato']
    };
    
    this.substitutes = {
      'milk': ['almond milk', 'soy milk', 'oat milk'],
      'butter': ['margarine', 'coconut oil', 'avocado'],
      'sugar': ['honey', 'stevia', 'maple syrup'],
      'bread': ['gluten-free bread', 'whole grain bread', 'rye bread'],
      'pasta': ['zucchini noodles', 'quinoa pasta', 'rice noodles'],
      'rice': ['quinoa', 'cauliflower rice', 'couscous']
    };
    
    this.purchaseHistory = [];
    this.frequentItems = [];
  }

  addToHistory(item) {
    this.purchaseHistory.push({
      item,
      timestamp: new Date().toISOString()
    });
    this.updateFrequentItems();
  }

  updateFrequentItems() {
    const frequency = {};
    for (const entry of this.purchaseHistory) {
      frequency[entry.item] = (frequency[entry.item] || 0) + 1;
    }
    
    this.frequentItems = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 5);
  }

  getSeasonalSuggestions() {
    const month = new Date().getMonth();
    let season = 'summer';
    if (month >= 2 && month <= 4) season = 'spring';
    else if (month >= 5 && month <= 7) season = 'summer';
    else if (month >= 8 && month <= 10) season = 'fall';
    else season = 'winter';
    
    const products = this.seasonalProducts[season] || [];
    return products.slice(0, 5).map(product => ({
      item: product,
      reason: `In season (${season})`,
      type: 'seasonal'
    }));
  }

  getSubstituteSuggestions(item) {
    const itemLower = item.toLowerCase();
    let suggestions = [];
    
    for (const [key, substitutes] of Object.entries(this.substitutes)) {
      if (itemLower.includes(key)) {
        suggestions = substitutes.map(sub => ({
          item: sub,
          reason: `Alternative for ${key}`,
          type: 'substitute'
        }));
        break;
      }
    }
    
    return suggestions.slice(0, 3);
  }

  getPersonalizedSuggestions() {
    if (this.frequentItems.length === 0) {
      return this.getSeasonalSuggestions().slice(0, 3);
    }
    
    return this.frequentItems.slice(0, 3).map(item => ({
      item: item,
      reason: 'You usually buy this',
      type: 'personalized'
    }));
  }

  getRunningLowSuggestions(items) {
    // Simulate running low based on purchase history
    const suggestions = [];
    const allItems = items.map(item => item.name.toLowerCase());
    
    for (const frequentItem of this.frequentItems.slice(0, 3)) {
      if (!allItems.includes(frequentItem.toLowerCase())) {
        suggestions.push({
          item: frequentItem,
          reason: 'You might be running low',
          type: 'running-low'
        });
      }
    }
    
    return suggestions;
  }

  getAllSuggestions(currentItems = []) {
    const suggestions = [];
    
    // Get personalized suggestions
    suggestions.push(...this.getPersonalizedSuggestions());
    
    // Get seasonal suggestions (if not already in personalized)
    const seasonal = this.getSeasonalSuggestions();
    for (const s of seasonal) {
      if (!suggestions.some(sug => sug.item === s.item)) {
        suggestions.push(s);
      }
    }
    
    // Get running low suggestions
    const runningLow = this.getRunningLowSuggestions(currentItems);
    for (const s of runningLow) {
      if (!suggestions.some(sug => sug.item === s.item)) {
        suggestions.push(s);
      }
    }
    
    // Get substitute suggestions based on current items
    for (const item of currentItems) {
      const substitutes = this.getSubstituteSuggestions(item.name);
      for (const s of substitutes) {
        if (!suggestions.some(sug => sug.item === s.item)) {
          suggestions.push(s);
        }
      }
    }
    
    // Limit to 8 suggestions
    return suggestions.slice(0, 8);
  }
}

export default new SuggestionsEngine();
