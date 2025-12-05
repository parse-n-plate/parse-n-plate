import { ParsedRecipe } from '@/contexts/RecipeContext';

/**
 * MOCK RECIPE DATA
 * 
 * ⚠️ NOTE: This is dummy data for UI development purposes.
 * Replace this with real API calls or database queries when ready.
 * 
 * This file contains mock recipe data organized by cuisine categories
 * to populate the landing page's featured recipes section.
 */

export interface MockRecipe {
  id: string;
  name: string;
  author: string;
  category: string;
  image: string; // Placeholder image URL - replace with real images
}

// Detailed Mock Parsed Recipe for Design Lab Testing
export const MOCK_PARSED_RECIPE: ParsedRecipe = {
  title: "Classic Beef Udon",
  description: "A comforting Japanese noodle soup with tender beef and savory broth.",
  author: "Namiko Hirasawa Chen",
  cookTimeMinutes: 15,
  prepTimeMinutes: 15,
  totalTimeMinutes: 30,
  servings: 2,
  imageUrl: "/assets/images/beef-udon.jpg",
  sourceUrl: "https://example.com/beef-udon",
  ingredients: [
    {
      groupName: "Soup Base",
      ingredients: [
        { amount: "4", units: "cups", ingredient: "dashi stock" },
        { amount: "2", units: "tbsp", ingredient: "soy sauce" },
        { amount: "2", units: "tbsp", ingredient: "mirin" },
        { amount: "1", units: "tsp", ingredient: "sugar" },
        { amount: "1", units: "pinch", ingredient: "salt" }
      ]
    },
    {
      groupName: "Beef Topping",
      ingredients: [
        { amount: "1/2", units: "lb", ingredient: "thinly sliced beef chuck" },
        { amount: "1", units: "tbsp", ingredient: "sugar" },
        { amount: "1", units: "tbsp", ingredient: "soy sauce" },
        { amount: "1", units: "tbsp", ingredient: "sake" }
      ]
    },
    {
      groupName: "Noodles & Garnish",
      ingredients: [
        { amount: "2", units: "packs", ingredient: "udon noodles" },
        { amount: "2", units: "stalks", ingredient: "green onions" },
        { amount: "2", units: "slices", ingredient: "narutomaki (fish cake)" },
        { amount: "1", units: "tsp", ingredient: "shichimi togarashi" }
      ]
    }
  ],
  instructions: [
    {
      stepNumber: 1,
      instruction: "In a pot, combine dashi stock, 2 tbsp soy sauce, 2 tbsp mirin, 1 tsp sugar, and a pinch of salt. Bring to a gentle boil, then reduce heat to low to keep warm.",
      ingredientsNeeded: ["dashi stock", "soy sauce", "mirin", "sugar", "salt"],
      toolsNeeded: ["pot", "spoon"],
      timerMinutes: 5,
      timerLabel: "Simmer Broth"
    },
    {
      stepNumber: 2,
      instruction: "Heat a frying pan over medium-high heat. Add the sliced beef and cook until browned.",
      ingredientsNeeded: ["thinly sliced beef chuck"],
      toolsNeeded: ["frying pan", "tongs"]
    },
    {
      stepNumber: 3,
      instruction: "Add 1 tbsp sugar, 1 tbsp soy sauce, and 1 tbsp sake to the beef. Cook for another 2-3 minutes until the sauce glazes the meat.",
      ingredientsNeeded: ["sugar", "soy sauce", "sake"],
      toolsNeeded: ["frying pan"],
      timerMinutes: 3,
      timerLabel: "Glaze Beef"
    },
    {
      stepNumber: 4,
      instruction: "In a separate large pot of boiling water, cook the udon noodles according to package instructions (usually 1-2 minutes for frozen/fresh udon). Drain well.",
      ingredientsNeeded: ["udon noodles"],
      toolsNeeded: ["large pot", "colander"],
      timerMinutes: 2,
      timerLabel: "Boil Noodles"
    },
    {
      stepNumber: 5,
      instruction: "Divide the drained noodles into serving bowls. Pour the hot soup broth over the noodles.",
      ingredientsNeeded: [],
      toolsNeeded: ["ladle", "serving bowls"]
    },
    {
      stepNumber: 6,
      instruction: "Top with the seasoned beef, sliced green onions, and narutomaki. Sprinkle with shichimi togarashi if desired. Serve immediately.",
      ingredientsNeeded: ["green onions", "narutomaki (fish cake)", "shichimi togarashi"],
      toolsNeeded: ["chopsticks"]
    }
  ]
};

// Cuisine categories available for filtering
export const CUISINE_CATEGORIES = [
  'Asian',
  'Italian',
  'Mexican',
  'Mediterranean',
  'French',
  'Indian',
  'Japanese',
  'Korean',
  'Hawaiian',
] as const;

// Mock recipe data - replace with real data source
// NOTE: Image paths point to /assets/images/ folder
// Add your recipe images to public/assets/images/ and name them accordingly
export const MOCK_RECIPES: MockRecipe[] = [
  {
    id: 'mock-1',
    name: 'Beef Udon',
    author: 'Namiko Hirasawa Chen',
    category: 'Asian',
    image: '/assets/images/beef-udon.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-2',
    name: 'Garlic Shrimp Ramen',
    author: 'Cameron Tillman',
    category: 'Asian',
    image: '/assets/images/garlic-shrimp-ramen.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-3',
    name: 'Pad Thai',
    author: 'Thai Kitchen',
    category: 'Asian',
    image: '/assets/images/pad-thai.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-4',
    name: 'Mushroom Risotto',
    author: 'Darrell Schroeder',
    category: 'Italian',
    image: '/assets/images/mushroom-risotto.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-5',
    name: 'Spaghetti Carbonara',
    author: 'Italian Chef',
    category: 'Italian',
    image: '/assets/images/spaghetti-carbonara.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-6',
    name: 'Tacos al Pastor',
    author: 'Maria Lopez',
    category: 'Mexican',
    image: '/assets/images/tacos-al-pastor.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-7',
    name: 'Beef Wellington',
    author: 'Gordon Ramsay',
    category: 'French',
    image: '/assets/images/beef-wellington.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-8',
    name: 'Chicken Tikka Masala',
    author: 'Indian Spice',
    category: 'Indian',
    image: '/assets/images/chicken-tikka-masala.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-9',
    name: 'Sushi Platter',
    author: 'Tokyo Sushi',
    category: 'Japanese',
    image: '/assets/images/sushi-platter.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-10',
    name: 'Bibimbap',
    author: 'Korean Kitchen',
    category: 'Korean',
    image: '/assets/images/bibimbap.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-11',
    name: 'Poke Bowl',
    author: 'Hawaiian Fresh',
    category: 'Hawaiian',
    image: '/assets/images/poke-bowl.jpg', // Add image to public/assets/images/
  },
  {
    id: 'mock-12',
    name: 'Greek Salad',
    author: 'Mediterranean Delight',
    category: 'Mediterranean',
    image: '/assets/images/greek-salad.jpg', // Add image to public/assets/images/
  },
];

/**
 * Get recipes filtered by category
 * @param category - The cuisine category to filter by (empty string for all)
 * @returns Filtered array of recipes
 */
export function getRecipesByCategory(category: string): MockRecipe[] {
  if (!category) {
    return MOCK_RECIPES;
  }
  return MOCK_RECIPES.filter((recipe) => recipe.category === category);
}

/**
 * Get a specific recipe by ID
 * @param id - The recipe ID
 * @returns The recipe or undefined if not found
 */
export function getRecipeById(id: string): MockRecipe | undefined {
  return MOCK_RECIPES.find((recipe) => recipe.id === id);
}

