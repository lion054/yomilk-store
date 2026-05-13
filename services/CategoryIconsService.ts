/**
 * CategoryIconsService - Provides icons, colors, and styling for product categories
 * Maps category names to emojis, background colors, and text colors
 * Based on Angular implementation: core/services/category-icons/category-icons.service.ts
 */

const categoryMappings = {
  // Fruits & Vegetables
  'FRUITS': { icon: '🍎', bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)', textColor: '#fff', initials: 'FR' },
  'FRUIT': { icon: '🍊', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'FR' },
  'VEGETABLES': { icon: '🥬', bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)', textColor: '#fff', initials: 'VG' },
  'VEGETABLE': { icon: '🥕', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'VG' },

  // Dairy Products
  'DAIRY': { icon: '🥛', bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)', textColor: '#fff', initials: 'DA' },
  'MILK': { icon: '🥛', bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)', textColor: '#fff', initials: 'ML' },
  'FRESH MILK': { icon: '🥛', bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)', textColor: '#fff', initials: 'FM' },
  'FRESH MILK PRODUCT': { icon: '🥛', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', textColor: '#fff', initials: 'FM' },
  'YOGHURT': { icon: '🥄', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'YG' },
  'YOGURT': { icon: '🥄', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'YG' },
  'YOGHURT PRODUCT': { icon: '🥄', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'YG' },
  'CHEESE': { icon: '🧀', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', textColor: '#fff', initials: 'CH' },
  'CHEESE PRODUCT': { icon: '🧀', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', textColor: '#fff', initials: 'CH' },
  'CREAM': { icon: '🍦', bgColor: 'linear-gradient(135deg, #1abc9c, #16a085)', textColor: '#fff', initials: 'CR' },
  'FRESH CREAM': { icon: '🍦', bgColor: 'linear-gradient(135deg, #1abc9c, #16a085)', textColor: '#fff', initials: 'CR' },
  'YOLAC': { icon: '🥛', bgColor: 'linear-gradient(135deg, #0d7377, #14a085)', textColor: '#fff', initials: 'YL' },
  'YOLAC PRODUCT': { icon: '🥛', bgColor: 'linear-gradient(135deg, #0d7377, #14a085)', textColor: '#fff', initials: 'YL' },
  'LIFE': { icon: '💊', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', textColor: '#fff', initials: 'LF' },

  // Meat & Seafood
  'MEAT': { icon: '🥩', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', textColor: '#fff', initials: 'MT' },
  'SEAFOOD': { icon: '🐟', bgColor: 'linear-gradient(135deg, #0d7377, #14a085)', textColor: '#fff', initials: 'SF' },
  'CHICKEN': { icon: '🍗', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', textColor: '#fff', initials: 'CH' },
  'BEEF': { icon: '🥩', bgColor: 'linear-gradient(135deg, #c0392b, #e74c3c)', textColor: '#fff', initials: 'BF' },
  'PORK': { icon: '🥓', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', textColor: '#fff', initials: 'PK' },

  // Bakery & Bread
  'BREAD': { icon: '🍞', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'BR' },
  'BAKERY': { icon: '🧁', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'BK' },
  'PASTRY': { icon: '🥐', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', textColor: '#fff', initials: 'PS' },

  // Beverages
  'BEVERAGES': { icon: '🥤', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', textColor: '#fff', initials: 'BV' },
  'DRINKS': { icon: '🥤', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', textColor: '#fff', initials: 'DR' },
  'JUICE': { icon: '🧃', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'JC' },
  'SODA': { icon: '🥤', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', textColor: '#fff', initials: 'SD' },
  'WATER': { icon: '💧', bgColor: 'linear-gradient(135deg, #0d7377, #14a085)', textColor: '#fff', initials: 'WR' },

  // Snacks & Sweets
  'SNACKS': { icon: '🍿', bgColor: 'linear-gradient(135deg, #ff6b35, #ff9a63)', textColor: '#fff', initials: 'SN' },
  'SNACK': { icon: '🍿', bgColor: 'linear-gradient(135deg, #ff6b35, #ff9a63)', textColor: '#fff', initials: 'SN' },
  'CHIPS': { icon: '🍟', bgColor: 'linear-gradient(135deg, #ff6b35, #ff9a63)', textColor: '#fff', initials: 'CP' },
  'CANDY': { icon: '🍬', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'CD' },
  'CHOCOLATE': { icon: '🍫', bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)', textColor: '#fff', initials: 'CL' },

  // Frozen & Refrigerated
  'FROZEN': { icon: '❄️', bgColor: 'linear-gradient(135deg, #3498db, #2980b9)', textColor: '#fff', initials: 'FZ' },
  'ICE CREAM': { icon: '🍨', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'IC' },

  // Household & Care
  'PERSONAL CARE': { icon: '🧴', bgColor: 'linear-gradient(135deg, #8e44ad, #9b59b6)', textColor: '#fff', initials: 'PC' },
  'HOUSEHOLD': { icon: '🏠', bgColor: 'linear-gradient(135deg, #2c3e50, #4a6580)', textColor: '#fff', initials: 'HH' },
  'HOMECARE': { icon: '🏠', bgColor: 'linear-gradient(135deg, #2c3e50, #4a6580)', textColor: '#fff', initials: 'HC' },
  'CLEANING': { icon: '🧽', bgColor: 'linear-gradient(135deg, #1abc9c, #16a085)', textColor: '#fff', initials: 'CL' },

  // Grocery & Pantry
  'GROCERY': { icon: '🛒', bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)', textColor: '#fff', initials: 'GR' },
  'CONDIMENTS': { icon: '🧂', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'CD' },
  'CANNED': { icon: '🥫', bgColor: 'linear-gradient(135deg, #ff6b35, #ff9a63)', textColor: '#fff', initials: 'CN' },
  'CEREALS': { icon: '🥣', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', textColor: '#fff', initials: 'CR' },
  'PASTA': { icon: '🍝', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'PS' },
  'RICE': { icon: '🍚', bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)', textColor: '#fff', initials: 'RC' },
  'FLOUR': { icon: '🌾', bgColor: 'linear-gradient(135deg, #e67e22, #f39c12)', textColor: '#fff', initials: 'FL' },
  'OIL': { icon: '🫒', bgColor: 'linear-gradient(135deg, #27ae60, #1a5c38)', textColor: '#fff', initials: 'OL' },
  'SPICES': { icon: '🌶️', bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)', textColor: '#fff', initials: 'SP' },

  // Baby & Pet
  'BABY': { icon: '👶', bgColor: 'linear-gradient(135deg, #e91e63, #f06292)', textColor: '#fff', initials: 'BB' },
  'PET': { icon: '🐕', bgColor: 'linear-gradient(135deg, #27ae60, #1a5c38)', textColor: '#fff', initials: 'PT' },
  'PETCARE': { icon: '🐾', bgColor: 'linear-gradient(135deg, #0d7377, #14a085)', textColor: '#fff', initials: 'PC' },

  // Health & Wellness
  'VITAMINS': { icon: '💊', bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)', textColor: '#fff', initials: 'VT' },
  'SUPPLEMENTS': { icon: '💊', bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)', textColor: '#fff', initials: 'SM' },

  // Pantry
  'PANTRY': { icon: '📦', bgColor: 'linear-gradient(135deg, #7f8c8d, #636e72)', textColor: '#fff', initials: 'PT' },

  // Default fallback
  'DEFAULT': { icon: '📦', bgColor: 'linear-gradient(135deg, #7f8c8d, #636e72)', textColor: '#fff', initials: 'XX' }
};

/**
 * Get icon data for a category name
 * @param categoryName - The name of the category (case-insensitive)
 * @returns CategoryIcon object with icon, bgColor, and textColor
 */
export const getCategoryIcon = (categoryName: any) => {
  if (!categoryName) {
    return categoryMappings['DEFAULT'];
  }

  const normalized = String(categoryName).toUpperCase().trim();

  // Try exact match first
  if ((categoryMappings as any)[normalized]) {
    return (categoryMappings as any)[normalized];
  }

  // Try partial match (check if any key is contained in the category name)
  for (const key of Object.keys(categoryMappings)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return (categoryMappings as any)[key];
    }
  }

  // Return default if no match found
  return (categoryMappings as any)['DEFAULT'];
};

/**
 * Get just the emoji icon for a category
 * @param categoryName - The name of the category
 * @returns The emoji icon as a string
 */
export const getIcon = (categoryName: any) => {
  return getCategoryIcon(categoryName).icon;
};

/**
 * Get the background color for a category
 * @param categoryName - The name of the category
 * @returns The background color as a hex string
 */
export const getBgColor = (categoryName: any) => {
  return getCategoryIcon(categoryName).bgColor;
};

/**
 * Get the text color for a category
 * @param categoryName - The name of the category
 * @returns The text color as a hex string
 */
export const getTextColor = (categoryName: any) => {
  return getCategoryIcon(categoryName).textColor;
};
