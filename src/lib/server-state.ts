import { FoodItem, AdminSettings, Order, User } from '@/src/types';
import { INITIAL_FOOD_ITEMS, DEFAULT_ADMIN_SETTINGS, FOOD_CATEGORIES, SEED_ORDERS } from '@/src/data';

interface ServerState {
  memoryFoodItems: FoodItem[];
  memoryOrders: Order[];
  memorySettings: AdminSettings;
  memoryCategories: string[];
  memoryUsers: User[];
}

const globalWithState = globalThis as unknown as {
  _serverState?: ServerState;
};

if (!globalWithState._serverState) {
  globalWithState._serverState = {
    memoryFoodItems: JSON.parse(JSON.stringify(INITIAL_FOOD_ITEMS)),
    memoryOrders: JSON.parse(JSON.stringify(SEED_ORDERS)),
    memorySettings: JSON.parse(JSON.stringify(DEFAULT_ADMIN_SETTINGS)),
    memoryCategories: JSON.parse(JSON.stringify(FOOD_CATEGORIES.filter(c => c !== 'All'))),
    memoryUsers: [
      {
        name: 'Adewale Olaitan',
        email: 'manueloliver2908@gmail.com',
        phone: '08031234567',
        password: 'password123',
        createdAt: new Date().toISOString(),
      }
    ]
  };
}

export const serverState = globalWithState._serverState;
