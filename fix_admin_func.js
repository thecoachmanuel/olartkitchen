import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const funcOld = `export function AdminPanel({
  foodItems,
  orders,
  adminSettings,
  onUpdateSettings,
  onAddFoodItem,
  onUpdateFoodItem,
  onDeleteFoodItem,
  onUpdateOrderStatus,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  dbStatus,
  onBroadcastNotification
}: AdminPanelProps) {`;

const funcNew = `export function AdminPanel({
  foodItems,
  orders,
  adminSettings,
  onUpdateSettings,
  onAddFoodItem,
  onUpdateFoodItem,
  onDeleteFoodItem,
  onUpdateOrderStatus,
  onDeleteOrder,
  onClearOrders,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  dbStatus,
  usersList = [],
  onBroadcastNotification
}: AdminPanelProps) {`;

content = content.replace(funcOld, funcNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
