import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const navItemsOld = `  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant' as const, label: 'AI Assistant', icon: Bot },
    { id: 'food' as const, label: 'Food Items', icon: Utensils },
    { id: 'categories' as const, label: 'Meal Categories', icon: SlidersHorizontal },
    { id: 'addons' as const, label: 'Premium Sides', icon: Sparkles },
    { id: 'orders' as const, label: 'Orders Ledger', icon: ShoppingCart, badge: orders.length },
    { id: 'promo' as const, label: 'Milestone Promo', icon: Gift, badge: settingsPromoEnabled ? qualifiedOrders.length : 0 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];`;

const navItemsNew = `  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant' as const, label: 'AI Assistant', icon: Bot },
    { id: 'users' as const, label: 'Users Tracker', icon: Users },
    { id: 'food' as const, label: 'Food Items', icon: Utensils },
    { id: 'categories' as const, label: 'Meal Categories', icon: SlidersHorizontal },
    { id: 'addons' as const, label: 'Premium Sides', icon: Sparkles },
    { id: 'orders' as const, label: 'Orders Ledger', icon: ShoppingCart, badge: orders.length },
    { id: 'promo' as const, label: 'Milestone Promo', icon: Gift, badge: settingsPromoEnabled ? qualifiedOrders.length : 0 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];`;

content = content.replace(navItemsOld, navItemsNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
