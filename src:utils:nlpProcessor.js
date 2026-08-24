import nlp from 'compromise';

class NLPProcessor {
  constructor() {
    this.supportedLanguages = ['en', 'es', 'fr', 'de'];
    this.currentLanguage = 'en';
    
    // Common shopping phrases in multiple languages
    this.phrases = {
      en: {
        add: ['add', 'buy', 'get', 'need', 'want', 'put', 'include'],
        remove: ['remove', 'delete', 'take off', 'get rid of'],
        quantity: ['bottle', 'pack', 'kg', 'g', 'liter', 'piece', 'dozen'],
        search: ['find', 'search', 'look for', 'show me']
      },
      es: {
        add: ['añadir', 'comprar', 'necesito', 'quiero', 'poner', 'agregar'],
        remove: ['quitar', 'eliminar', 'borrar', 'remover'],
        quantity: ['botella', 'paquete', 'kg', 'g', 'litro', 'pieza', 'docena'],
        search: ['buscar', 'encontrar', 'mostrar']
      },
      fr: {
        add: ['ajouter', 'acheter', 'besoin', 'veux', 'mettre', 'inclure'],
        remove: ['supprimer', 'enlever', 'retirer'],
        quantity: ['bouteille', 'paquet', 'kg', 'g', 'litre', 'pièce', 'douzaine'],
        search: ['trouver', 'chercher', 'montrer']
      },
      de: {
        add: ['hinzufügen', 'kaufen', 'brauche', 'möchte', 'nehmen', 'einschließen'],
        remove: ['entfernen', 'löschen', 'wegnehmen'],
        quantity: ['flasche', 'packung', 'kg', 'g', 'liter', 'stück', 'dutzend'],
        search: ['finden', 'suchen', 'zeigen']
      }
    };
    
    this.categories = {
      dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
      produce: ['apple', 'banana', 'orange', 'tomato', 'potato', 'onion', 'garlic'],
      meat: ['chicken', 'beef', 'pork', 'fish', 'shrimp'],
      bakery: ['bread', 'cake', 'cookie', 'muffin', 'bagel'],
      snacks: ['chips', 'candy', 'chocolate', 'popcorn'],
      beverages: ['water', 'juice', 'soda', 'coffee', 'tea'],
      household: ['soap', 'shampoo', 'detergent', 'tissue']
    };
  }

  detectLanguage(text) {
    // Simple language detection based on common words
    const textLower = text.toLowerCase();
    for (const lang of this.supportedLanguages) {
      if (lang !== 'en') {
        const sampleWords = this.phrases[lang].add.slice(0, 3);
        if (sampleWords.some(word => textLower.includes(word))) {
          return lang;
        }
      }
    }
    return 'en';
  }

  parseVoiceCommand(text, language = null) {
    try {
      const detectedLang = language || this.detectLanguage(text);
      this.currentLanguage = detectedLang;
      
      const doc = nlp(text);
      const tokens = text.toLowerCase().split(' ');
      
      // Determine action type
      let action = 'add';
      let item = '';
      let quantity = 1;
      let unit = '';
      let searchQuery = '';
      
      // Check for action words
      const actionWords = this.phrases[detectedLang] || this.phrases.en;
      
      if (tokens.some(token => actionWords.remove.includes(token))) {
        action = 'remove';
      } else if (tokens.some(token => actionWords.search.includes(token))) {
        action = 'search';
      }
      
      // Extract item name (remove action words and common filler words)
      const stopWords = ['please', 'the', 'to', 'for', 'of', 'with', 'from', 'on', 'at', 'by'];
      let cleanedTokens = tokens.filter(token => 
        !stopWords.includes(token) && 
        !actionWords.add.includes(token) &&
        !actionWords.remove.includes(token) &&
        !actionWords.search.includes(token)
      );
      
      // Extract quantity
      const numbers = doc.match('#Value').text();
      if (numbers) {
        const numMatch = text.match(/\d+/);
        if (numMatch) {
          quantity = parseInt(numMatch[0]);
          // Remove number from cleaned tokens
          cleanedTokens = cleanedTokens.filter(token => !token.includes(numMatch[0]));
        }
      }
      
      // Extract unit
      const unitWords = actionWords.quantity || [];
      let unitFound = '';
      for (const unitWord of unitWords) {
        if (cleanedTokens.some(token => token.includes(unitWord))) {
          unitFound = unitWord;
          cleanedTokens = cleanedTokens.filter(token => token !== unitFound);
          break;
        }
      }
      
      // Remaining tokens form the item name
      item = cleanedTokens.join(' ').trim();
      
      // If no item found, try to get it from the text differently
      if (!item) {
        // Try to find noun phrases
        const nouns = doc.match('#Noun+').text();
        if (nouns) {
          item = nouns;
        } else {
          // Fallback: get the last few words
          const words = text.split(' ');
          item = words.slice(-3).join(' ').trim();
        }
      }
      
      // Categorize item
      const category = this.categorizeItem(item);
      
      return {
        action,
        item: item || 'unknown item',
        quantity,
        unit: unitFound,
        category,
        language: detectedLang,
        originalText: text,
        searchQuery: action === 'search' ? item : ''
      };
    } catch (error) {
      console.error('Error parsing voice command:', error);
      return {
        action: 'add',
        item: text,
        quantity: 1,
        unit: '',
        category: 'uncategorized',
        language: 'en',
        originalText: text,
        searchQuery: ''
      };
    }
  }

  categorizeItem(item) {
    const itemLower = item.toLowerCase();
    for (const [category, items] of Object.entries(this.categories)) {
      if (items.some(keyword => itemLower.includes(keyword))) {
        return category;
      }
    }
    return 'uncategorized';
  }

  extractPriceFilter(text) {
    const priceMatch = text.match(/\$?(\d+(\.\d{2})?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1]);
    }
    return null;
  }

  extractBrand(text) {
    const brands = ['organic', 'non-organic', 'brand', 'store', 'generic'];
    const words = text.toLowerCase().split(' ');
    for (const brand of brands) {
      if (words.includes(brand)) {
        return brand;
      }
    }
    return null;
  }
}

export default new NLPProcessor();
