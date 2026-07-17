import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const propsOld = `interface AdminPanelProps {
  foodItems: FoodItem[];
  orders: Order[];
  adminSettings: AdminSettings;
  onUpdateSettings: (settings: AdminSettings) => void;
  onAddFoodItem: (item: Omit<FoodItem, 'id' | 'currentPreOrders'>) => void;
  onUpdateFoodItem: (item: FoodItem) => void;
  onDeleteFoodItem: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (category: string) => void;
  dbStatus?: { isConnected: boolean; mode: string; databaseName: string | null; error: string | null } | null;
  onBroadcastNotification?: (title: string, message: string, type: 'order_status' | 'system' | 'reminder' | 'deal') => void;
}`;

const propsNew = `interface AdminPanelProps {
  foodItems: FoodItem[];
  orders: Order[];
  adminSettings: AdminSettings;
  onUpdateSettings: (settings: AdminSettings) => void;
  onAddFoodItem: (item: Omit<FoodItem, 'id' | 'currentPreOrders'>) => void;
  onUpdateFoodItem: (item: FoodItem) => void;
  onDeleteFoodItem: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder?: (orderId: string) => void;
  onClearOrders?: () => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onUpdateCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (category: string) => void;
  dbStatus?: { isConnected: boolean; mode: string; databaseName: string | null; error: string | null } | null;
  usersList?: any[];
  onBroadcastNotification?: (title: string, message: string, type: 'order_status' | 'system' | 'reminder' | 'deal') => void;
}`;

content = content.replace(propsOld, propsNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
