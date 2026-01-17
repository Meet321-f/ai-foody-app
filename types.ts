export interface Recipe {
  id: string | number;
  title: string;
  image: string;
  description?: string;
  cookTime?: string;
  servings?: number | string;
  category?: string;
  area?: string;
  ingredients?: string[];
  instructions?: string[];
  originalData?: any;
  prepTime?: string;
  calories?: string;
  difficulty?: string;
  [key: string]: any;
}

export interface Category {
  id: number | string;
  name: string;
  image: string;
  description?: string;
}

export interface RecipeCardProps {
  recipe: Recipe;
}
export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  quantity?: string;
}

export interface ShoppingGroup {
  recipeId: string;
  recipeTitle: string;
  items: ShoppingItem[];
}
