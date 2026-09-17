export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export type GroceryCategory =
  | 'Fruits'
  | 'Vegetables'
  | 'Dairy'
  | 'Meat & Fish'
  | 'Bakery'
  | 'Beverages'
  | 'Snacks'
  | 'Frozen'
  | 'Household'
  | 'Other';

export type Grocery = {
  id: number;
  name: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
  price: number;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GroceryInput = {
  name: string;
  category: GroceryCategory;
  quantity: number;
  unit: string;
  price: number;
};
