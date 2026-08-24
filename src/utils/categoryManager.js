class CategoryManager {
  constructor() {
    this.categories = {
      dairy: { icon: '🥛', color: 'bg-blue-100 text-blue-800' },
      produce: { icon: '🥬', color: 'bg-green-100 text-green-800' },
      meat: { icon: '🥩', color: 'bg-red-100 text-red-800' },
      bakery: { icon: '🍞', color: 'bg-yellow-100 text-yellow-800' },
      snacks: { icon: '🍿', color: 'bg-orange-100 text-orange-800' },
      beverages: { icon: '🥤', color: 'bg-cyan-100 text-cyan-800' },
      household: { icon: '🧹', color: 'bg-purple-100 text-purple-800' },
      uncategorized: { icon: '📦', color: 'bg-gray-100 text-gray-800' }
    };
  }

  getCategoryInfo(category) {
    return this.categories[category] || this.categories.uncategorized;
  }

  categorizeItems(items) {
    const categorized = {};
    for (const [category] of Object.entries(this.categories)) {
      categorized[category] = [];
    }
    
    for (const item of items) {
      const category = item.category || 'uncategorized';
      if (categorized[category]) {
        categorized[category].push(item);
      } else {
        categorized.uncategorized.push(item);
      }
    }
    
    return categorized;
  }

  getAllCategories() {
    return Object.keys(this.categories);
  }

  getCategoryEmoji(category) {
    return this.categories[category]?.icon || '📦';
  }
}

export default new CategoryManager();
