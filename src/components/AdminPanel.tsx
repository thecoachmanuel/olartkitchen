/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  KeyRound, LogOut, LayoutDashboard, Utensils, ShoppingCart, Settings, 
  Plus, Edit2, Trash2, CheckCircle2, AlertCircle, TrendingUp, DollarSign, Users, Clock, ToggleLeft, ToggleRight, X, SlidersHorizontal, Upload, Sparkles, Mail, Phone, Menu,
  Gift, Send, Loader2, Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem, Order, AdminSettings } from '../types';
import { AiAssistant } from './AiAssistant';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminPanelProps {
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
  onDeleteUser?: (email: string) => void;
  onUpdateUser?: (email: string, data: any) => void;
  onBroadcastNotification?: (title: string, message: string, type: 'order_status' | 'system' | 'reminder' | 'deal') => void;
}

const CHART_COLORS = [
  '#f59e0b', // Amber 500
  '#10b981', // Emerald 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
  '#f43f5e', // Rose 500
];

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg font-sans">
        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-1">
          {new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomCategoryTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg font-sans">
        <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{payload[0].name}</p>
        <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
          {payload[0].value} Portion{payload[0].value > 1 ? 's' : ''} Ordered
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminPanel({
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
  usersList = [],
  onDeleteUser,
  onUpdateUser,
  onBroadcastNotification,
  onClearOrders,
}: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('olart-admin-logged-in') === 'true';
    }
    return false;
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'food' | 'orders' | 'categories' | 'settings' | 'promo' | 'addons' | 'assistant' | 'users'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'dashboard' || tab === 'food' || tab === 'orders' || tab === 'categories' || tab === 'settings' || tab === 'promo' || tab === 'addons' || tab === 'assistant' || tab === 'users') {
        return tab as 'dashboard' | 'food' | 'orders' | 'categories' | 'settings' | 'promo' | 'addons' | 'assistant' | 'users';
      }
    }
    return 'dashboard';
  });

  // Orders Filter State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all');

  // Category management local state
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [categoryEditValue, setCategoryEditValue] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inline confirmation states for delete operations (to avoid native confirm block in iframe sandbox)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deletingCategoryName, setDeletingCategoryName] = useState<string | null>(null);

  // Form states
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Food Item Form fields
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemCloseTime, setItemCloseTime] = useState('');
  const [itemMaxPreOrders, setItemMaxPreOrders] = useState('');
  const [itemCategory, setItemCategory] = useState(categories[0] || 'Rice Platters');
  const [itemAvailable, setItemAvailable] = useState(true);
  const [itemFormError, setItemFormError] = useState('');

  // AI Generation State and Handlers
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  const handleGenerateDescription = async () => {
    if (!itemName.trim()) {
      alert("Please enter a Meal Title first so the AI knows what to describe!");
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: itemName.trim(), category: itemCategory }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.description) {
        setItemDescription(data.description);
      } else {
        throw new Error("No description returned by AI.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to generate description");
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateImage = () => {
    if (!itemName.trim()) {
      alert("Please enter a Meal Title first to generate a relevant image!");
      return;
    }
    setIsGeneratingImg(true);
    // Create a descriptive prompt for Pollinations AI
    const cleanName = itemName.trim();
    const cleanCategory = itemCategory ? `under category ${itemCategory}` : '';
    const prompt = `${cleanName} ${cleanCategory}, luxury gourmet food photography, professional studio plate presentation, Michelin star styling, delicious, appetizing, fine dining, 8k resolution, cinematic lighting, dramatic shadows`;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;
    
    // Pre-preload image to ensure smooth rendering and reliable loading state
    const img = new Image();
    img.onload = () => {
      setItemImage(imageUrl);
      setIsGeneratingImg(false);
    };
    img.onerror = () => {
      // Fallback
      setItemImage(imageUrl);
      setIsGeneratingImg(false);
    };
    img.src = imageUrl;
  };

  // Settings fields
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(adminSettings.whatsappNumber);
  const [settingsBank, setSettingsBank] = useState(adminSettings.bankName);
  const [settingsAccountName, setSettingsAccountName] = useState(adminSettings.accountName);
  const [settingsAccountNumber, setSettingsAccountNumber] = useState(adminSettings.accountNumber);
  const [settingsMusicEnabled, setSettingsMusicEnabled] = useState(!!adminSettings.musicEnabled);
  const [settingsMusicVolume, setSettingsMusicVolume] = useState(adminSettings.musicVolume ?? 0.15);
  const [settingsLogoName, setSettingsLogoName] = useState(adminSettings.logoName || 'OlartKitchen');
  const [settingsLogoEmoji, setSettingsLogoEmoji] = useState(adminSettings.logoEmoji || '🍲');
  const [settingsLogoImage, setSettingsLogoImage] = useState(adminSettings.logoImage || '');
  const [settingsFooterPlatformName, setSettingsFooterPlatformName] = useState(adminSettings.footerPlatformName || 'Olart Kitchen Pre-Order Platform');
  const [settingsFooterCopyright, setSettingsFooterCopyright] = useState(adminSettings.footerCopyright || '© 2026 Olart Culinary Enterprise. Lagos, Nigeria. All rights reserved.');
  const [settingsContactEmail, setSettingsContactEmail] = useState(adminSettings.contactEmail || 'info@olartkitchen.com');
  const [settingsContactPhone, setSettingsContactPhone] = useState(adminSettings.contactPhone || '+2348168882014');
  const [settingsContactAddress, setSettingsContactAddress] = useState(adminSettings.contactAddress || 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria');
  const [settingsContactHours, setSettingsContactHours] = useState(adminSettings.contactHours || 'Monday - Saturday: 9:00 AM - 9:00 PM, Sunday: 12:00 PM - 8:00 PM');
  const [settingsContactDescription, setSettingsContactDescription] = useState(adminSettings.contactDescription || 'Have questions about our premium Nigerian dishes, custom event catering, or pre-order deliveries? Reach out to our culinary experts!');
  const [settingsPromoMinAmount, setSettingsPromoMinAmount] = useState(adminSettings.promoMinAmount ?? 15000);
  const [settingsPromoRewardName, setSettingsPromoRewardName] = useState(adminSettings.promoRewardName || 'Free bottle of legendary Hibiscus Zobo');
  const [settingsPromoEnabled, setSettingsPromoEnabled] = useState(() => adminSettings.promoEnabled !== false);
  const [settingsAddons, setSettingsAddons] = useState<{ id: string; name: string; price: number }[]>(() => adminSettings.addons || []);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);
  const [promoSavedMessage, setPromoSavedMessage] = useState(false);
  const [addonsSavedMessage, setAddonsSavedMessage] = useState(false);
  const [promoCopiedId, setPromoCopiedId] = useState<string | null>(null);

  // Live from Kitchen form state
  const [kitchenLivePreset, setKitchenLivePreset] = useState('Olart is seasoning the fresh croaker fish for our Signature Seafood Okro!');
  const [kitchenLiveMessage, setKitchenLiveMessage] = useState('');
  const [kitchenLiveSentMessage, setKitchenLiveSentMessage] = useState(false);

  const handleAddAddon = () => {
    if (!newAddonName.trim()) return;
    const price = Number(newAddonPrice) || 0;
    const id = 'addon-' + Date.now();
    setSettingsAddons(prev => [...prev, { id, name: newAddonName.trim(), price }]);
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (id: string) => {
    setSettingsAddons(prev => prev.filter(addon => addon.id !== id));
  };

  useEffect(() => {
    if (adminSettings) {
      setSettingsWhatsapp(adminSettings.whatsappNumber || '');
      setSettingsBank(adminSettings.bankName || '');
      setSettingsAccountName(adminSettings.accountName || '');
      setSettingsAccountNumber(adminSettings.accountNumber || '');
      setSettingsMusicEnabled(!!adminSettings.musicEnabled);
      setSettingsMusicVolume(adminSettings.musicVolume ?? 0.15);
      setSettingsLogoName(adminSettings.logoName || 'OlartKitchen');
      setSettingsLogoEmoji(adminSettings.logoEmoji || '🍲');
      setSettingsLogoImage(adminSettings.logoImage || '');
      setSettingsFooterPlatformName(adminSettings.footerPlatformName || 'Olart Kitchen Pre-Order Platform');
      setSettingsFooterCopyright(adminSettings.footerCopyright || '© 2026 Olart Culinary Enterprise. Lagos, Nigeria. All rights reserved.');
      setSettingsContactEmail(adminSettings.contactEmail || 'info@olartkitchen.com');
      setSettingsContactPhone(adminSettings.contactPhone || '+2348168882014');
      setSettingsContactAddress(adminSettings.contactAddress || 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria');
      setSettingsContactHours(adminSettings.contactHours || 'Monday - Saturday: 9:00 AM - 9:00 PM, Sunday: 12:00 PM - 8:00 PM');
      setSettingsContactDescription(adminSettings.contactDescription || 'Have questions about our premium Nigerian dishes, custom event catering, or pre-order deliveries? Reach out to our culinary experts!');
      setSettingsPromoMinAmount(adminSettings.promoMinAmount ?? 15000);
      setSettingsPromoRewardName(adminSettings.promoRewardName || 'Free bottle of legendary Hibiscus Zobo');
      setSettingsPromoEnabled(adminSettings.promoEnabled !== false);
      setSettingsAddons(adminSettings.addons || []);
    }
  }, [adminSettings]);

  // Sync activeTab state to URL search parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin') {
        const currentTab = params.get('tab');
        if (currentTab !== activeTab) {
          params.set('tab', activeTab);
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({ ...window.history.state }, '', newUrl);
        }
      }
    }
  }, [activeTab]);

  const [isDragOverLogo, setIsDragOverLogo] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image size is too large. Please upload an image smaller than 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverLogo(true);
  };

  const handleLogoDragLeave = () => {
    setIsDragOverLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please drop an image file.");
        return;
      }
      if (file.size > 1.5 * 1024 * 1024) {
        alert("Image size is too large. Please upload an image smaller than 1.5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsLogoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Currency Formatter
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback for static deployments (e.g. Vercel) where Express backend is unavailable
    const fallbackEmail = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ADMIN_EMAIL) || 'admin@olart.com';
    const fallbackPassword = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ADMIN_PASSWORD) || 'password123';

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      
      // If it returns HTML (e.g. 404 from Vercel fallback), this will throw and trigger the catch block
      const data = await response.json(); 
      
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('olart-admin-logged-in', 'true');
        }
        setLoginError('');
      } else {
        setLoginError(data.error || 'Invalid administrator credentials.');
      }
    } catch (error) {
      // Backend is unreachable, fallback to static credentials
      if (loginEmail.trim().toLowerCase() === fallbackEmail.trim().toLowerCase() && loginPassword === fallbackPassword) {
        setIsLoggedIn(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('olart-admin-logged-in', 'true');
        }
        setLoginError('');
      } else {
        setLoginError('Invalid administrator credentials.');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('olart-admin-logged-in');
    }
    setLoginEmail('');
    setLoginPassword('');
  };

  // Open item modal for creation
  const openAddModal = () => {
    setEditingItem(null);
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800');
    setItemFormError('');
    
    // Default close time to 4 hours from now
    const fourHours = new Date();
    fourHours.setHours(fourHours.getHours() + 4);
    // Format to local datetime-local input string
    const offset = fourHours.getTimezoneOffset();
    const localTime = new Date(fourHours.getTime() - (offset*60*1000));
    setItemCloseTime(localTime.toISOString().slice(0, 16));
    
    setItemMaxPreOrders('30');
    setItemCategory(categories[0] || 'Rice Platters');
    setItemAvailable(true);
    setShowItemModal(true);
  };

  // Open item modal for editing
  const openEditModal = (item: FoodItem) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemDescription(item.description);
    setItemPrice(item.price.toString());
    setItemImage(item.image);
    setItemFormError('');
    
    // Parse ISO time back to datetime-local local timezone format
    const itemDate = new Date(item.closeTime);
    const offset = itemDate.getTimezoneOffset();
    const localTime = new Date(itemDate.getTime() - (offset*60*1000));
    setItemCloseTime(localTime.toISOString().slice(0, 16));

    setItemMaxPreOrders(item.maxPreOrders.toString());
    setItemCategory(item.category);
    setItemAvailable(item.available);
    setShowItemModal(true);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError('');

    if (!itemCloseTime) {
      setItemFormError('Please select a closing date and time.');
      return;
    }

    const selectedTime = new Date(itemCloseTime);
    const now = new Date();
    if (selectedTime <= now) {
      setItemFormError('Pre-order closing target must be a future date and time.');
      return;
    }

    const targetCloseTime = selectedTime.toISOString();
    
    const itemData = {
      name: itemName,
      description: itemDescription,
      price: parseFloat(itemPrice) || 0,
      image: itemImage,
      closeTime: targetCloseTime,
      maxPreOrders: parseInt(itemMaxPreOrders) || 10,
      category: itemCategory,
      available: itemAvailable,
    };

    if (editingItem) {
      onUpdateFoodItem({
        ...editingItem,
        ...itemData,
      });
    } else {
      onAddFoodItem(itemData);
    }
    setShowItemModal(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      whatsappNumber: settingsWhatsapp,
      bankName: settingsBank,
      accountName: settingsAccountName,
      accountNumber: settingsAccountNumber,
      musicEnabled: settingsMusicEnabled,
      musicVolume: settingsMusicVolume,
      logoName: settingsLogoName,
      logoEmoji: settingsLogoEmoji,
      logoImage: settingsLogoImage,
      footerPlatformName: settingsFooterPlatformName,
      footerCopyright: settingsFooterCopyright,
      contactEmail: settingsContactEmail,
      contactPhone: settingsContactPhone,
      contactAddress: settingsContactAddress,
      contactHours: settingsContactHours,
      contactDescription: settingsContactDescription,
      promoMinAmount: Number(settingsPromoMinAmount) || 0,
      promoRewardName: settingsPromoRewardName,
      promoEnabled: settingsPromoEnabled,
      addons: settingsAddons,
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...adminSettings,
      promoMinAmount: Number(settingsPromoMinAmount) || 0,
      promoRewardName: settingsPromoRewardName,
      promoEnabled: settingsPromoEnabled,
    });
    setPromoSavedMessage(true);
    setTimeout(() => setPromoSavedMessage(false), 3000);
  };

  const handleSaveAddons = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...adminSettings,
      addons: settingsAddons,
    });
    setAddonsSavedMessage(true);
    setTimeout(() => setAddonsSavedMessage(false), 3000);
  };

  // Calculate stats values
  const totalRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'paid' || o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingPayments = orders.filter(o => o.status === 'pending').length;
  const activeTimersCount = foodItems.filter(item => new Date(item.closeTime).getTime() > Date.now() && item.available).length;

  // Promo qualified orders
  const qualifiedOrders = orders.filter(
    order => order.status !== 'cancelled' && order.totalAmount >= settingsPromoMinAmount
  );

  // Chart data calculations
  const salesByDate: { [key: string]: number } = {};
  const sortedOrdersForChart = [...orders].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  sortedOrdersForChart.forEach(order => {
    if (order.status === 'paid' || order.status === 'preparing' || order.status === 'confirmed' || order.status === 'delivered') {
      const date = new Date(order.createdAt);
      const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      salesByDate[dateStr] = (salesByDate[dateStr] || 0) + order.totalAmount;
    }
  });

  const displaySalesData = Object.keys(salesByDate).length > 0 
    ? Object.keys(salesByDate).map(date => ({
        date,
        amount: salesByDate[date],
      }))
    : [
        { date: 'Jul 11', amount: 33500 },
        { date: 'Jul 12', amount: 18500 },
        { date: 'Jul 13', amount: 59500 },
        { date: 'Jul 14', amount: 44000 },
        { date: 'Jul 15', amount: 67500 }
      ];

  const categoryCounts: { [key: string]: number } = {};
  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      order.items.forEach(item => {
        const foodItem = foodItems.find(f => f.id === item.foodItemId);
        const category = foodItem ? foodItem.category : 'Swallow & Soups';
        categoryCounts[category] = (categoryCounts[category] || 0) + item.quantity;
      });
    }
  });

  const displayCategoryData = Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts).map(category => ({
        name: category,
        value: categoryCounts[category],
      })).sort((a, b) => b.value - a.value)
    : [
        { name: 'Swallow & Soups', value: 12 },
        { name: 'Rice Platters', value: 24 },
        { name: 'Ewa Aganyin & Beans', value: 8 },
        { name: 'Grills & Suya', value: 18 },
        { name: 'Chops & Sweet Things', value: 15 }
      ];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-white/70 dark:bg-neutral-900/50 border border-neutral-200/50 dark:border-neutral-800/50 shadow-2xl backdrop-blur-md">
          <div className="text-center space-y-2 mb-8">
            <div className="mx-auto w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <KeyRound size={22} />
            </div>
            <h2 className="font-sans font-bold text-2xl text-neutral-900 dark:text-neutral-100">{(adminSettings.logoName || 'Olart').split(' ')[0]} Admin</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Authenticate using credentials to manage inventory and pre-orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="admin-email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Admin Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="demo@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-neutral-400/50 dark:placeholder:text-neutral-600/50"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="admin-password" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder:text-neutral-400/50 dark:placeholder:text-neutral-600/50"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white cursor-pointer shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200"
              id="admin-login-submit"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant' as const, label: 'AI Assistant', icon: Bot },
    { id: 'users' as const, label: 'Users Tracker', icon: Users },
    { id: 'food' as const, label: 'Food Items', icon: Utensils },
    { id: 'categories' as const, label: 'Meal Categories', icon: SlidersHorizontal },
    { id: 'addons' as const, label: 'Premium Sides', icon: Sparkles },
    { id: 'orders' as const, label: 'Orders Ledger', icon: ShoppingCart, badge: orders.length },
    { id: 'promo' as const, label: 'Milestone Promo', icon: Gift, badge: settingsPromoEnabled ? qualifiedOrders.length : 0 },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const minDateTimeLocal = (() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localNow = new Date(now.getTime() - (offset * 60 * 1000));
    return localNow.toISOString().slice(0, 16);
  })();

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-neutral-950 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl p-5 shrink-0 sticky top-28 self-stretch min-h-[520px]">
        <div className="mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            {adminSettings.logoImage ? (
              <img src={adminSettings.logoImage} alt="Logo" className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-sm">{adminSettings.logoEmoji || '🍳'}</span>
            )}
            <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
              {adminSettings.logoName || 'Olart Admin'}
            </span>
          </div>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold mt-1">Admin Control Room</p>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
                id={`tab-admin-desktop-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent size={15} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
                    isActive
                      ? 'bg-white text-amber-600'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/55 dark:border-neutral-700/55'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900 mt-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-red-500 hover:text-white dark:bg-neutral-900 dark:hover:bg-red-500 dark:hover:text-white text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer shadow-sm animate-pulse-subtle"
          >
            <LogOut size={13} />
            <span>Logout Session</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden w-full flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-neutral-900/30 border border-neutral-200/40 dark:border-neutral-800/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
          <div>
            <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider block">
              {navigationItems.find((n) => n.id === activeTab)?.label}
            </span>
            <span className="text-[9px] text-neutral-400 font-semibold block">Admin Workspace</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>

      {/* MOBILE MENU DRAWER OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden" id="mobile-sidebar-drawer">
            {/* Scrim overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 max-w-xs bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 p-5 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-2">
                    {adminSettings.logoImage ? (
                      <img src={adminSettings.logoImage} alt="Logo" className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm">{adminSettings.logoEmoji || '🍳'}</span>
                    )}
                    <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
                      {adminSettings.logoName || 'Olart Admin'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                        }`}
                        id={`tab-admin-mobile-${item.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent size={15} className="shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
                            isActive
                              ? 'bg-white text-amber-600'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/55 dark:border-neutral-700/55'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-red-500 hover:text-white dark:bg-neutral-900 dark:hover:bg-red-500 dark:hover:text-white text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer shadow-sm"
                >
                  <LogOut size={14} />
                  <span>Logout Session</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN WORKSPACE / PANEL CONTENT */}
      <div className="flex-1 w-full space-y-6">
        {/* Panel Page Title on Desktop */}
        <div className="hidden lg:block pb-2 border-b border-neutral-100 dark:border-neutral-900/60">
          <h2 className="text-base font-extrabold text-neutral-950 dark:text-neutral-50 tracking-tight">
            {navigationItems.find((n) => n.id === activeTab)?.label}
          </h2>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-light">
            {activeTab === 'dashboard' && 'Visual statistics, pre-order totals, active trends, and real-time ledger status.'}
            {activeTab === 'assistant' && 'Your AI Assistant powered by Gemini to help manage the kitchen.'}
            {activeTab === 'users' && 'Track registered users, view contact information, and monitor order frequency.'}
            {activeTab === 'food' && 'Manage food item inventory, upload photos, change prices, and set available stocks.'}
            {activeTab === 'categories' && 'Add and rename meal categories to organize the pre-order catalog.'}
            {activeTab === 'addons' && 'Configure premium sides and addons available to customers during checkout.'}
            {activeTab === 'orders' && 'Confirm customer pre-orders, update kitchen workflow states, and review customer contact cards.'}
            {activeTab === 'promo' && 'Configure and monitor pre-order milestone promo rewards, minimum spend thresholds, and qualified customers.'}
            {activeTab === 'settings' && 'Update delivery configurations, banking details, countdown clocks, and custom brand assets.'}
          </p>
        </div>

        <div className="min-h-[45vh]" id="admin-panel-content">
        
        {/* TAB: AI ASSISTANT */}
        {activeTab === 'assistant' && (
          <AiAssistant
            foodItems={foodItems}
            orders={orders}
            settings={adminSettings}
            categories={categories}
          />
        )}

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block">Total Revenue</span>
                  <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{formatNaira(totalRevenue)}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block">Total Pre-Orders</span>
                  <span className="text-xl font-bold text-neutral-900 dark:text-neutral-50">{orders.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <ShoppingCart size={18} />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block">Pending Payment</span>
                  <span className={`text-xl font-bold ${pendingPayments > 0 ? 'text-amber-500' : 'text-neutral-900 dark:text-neutral-50'}`}>{pendingPayments}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold block">Active Countdowns</span>
                  <span className="text-xl font-bold text-emerald-500">{activeTimersCount}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Clock size={18} />
                </div>
              </div>
            </div>

            {/* Visual Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="visual-analytics-section">
              {/* Daily Sales Chart */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <TrendingUp size={16} className="text-amber-500" />
                      <span>Daily Revenue Trend</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                      {Object.keys(salesByDate).length > 0 ? 'Live transaction total sales per day' : 'Sample sales analytics trend'}
                    </p>
                  </div>
                  {Object.keys(salesByDate).length === 0 && (
                    <span className="text-[9px] font-black tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                      Demo Data
                    </span>
                  )}
                </div>
                
                <div className="h-[240px] w-full" id="daily-sales-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={displaySalesData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:hidden" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" className="hidden dark:block" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#888888" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        stroke="#888888" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `₦${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Meal Categories Chart */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Utensils size={16} className="text-emerald-500" />
                      <span>Popular Meal Categories</span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                      {Object.keys(categoryCounts).length > 0 ? 'Portions ordered per category' : 'Sample category order distribution'}
                    </p>
                  </div>
                  {Object.keys(categoryCounts).length === 0 && (
                    <span className="text-[9px] font-black tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
                      Demo Data
                    </span>
                  )}
                </div>

                <div className="h-[240px] w-full flex flex-col sm:flex-row items-center justify-center gap-4" id="categories-chart-container">
                  <div className="w-full sm:w-[50%] h-[180px] sm:h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {displayCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomCategoryTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="w-full sm:w-[50%] space-y-2">
                    {displayCategoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full shrink-0" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} 
                          />
                          <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-[120px]" title={entry.name}>
                            {entry.name}
                          </span>
                        </div>
                        <span className="font-mono text-neutral-900 dark:text-neutral-100 font-bold bg-neutral-100 dark:bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-200/20">
                          {entry.value} pt
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold">
                  <TrendingUp size={16} />
                  <span>Interactive Live Operations</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Welcome to the Olart administration center. Pre-order timers are active and counting down live for customers. When a user requests checkout, they pay manually to your bank account and submit a notification. Ensure you cross-reference their <strong>payment reference</strong> with your bank statement, and mark their order as <strong>Confirmed</strong> to update the official register!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('food')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    View Food Catalog &rarr;
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/50 space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Fulfillment Account Credentials</h3>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500">Active Bank:</span>
                    <span className="font-bold">{adminSettings.bankName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500">Account Name:</span>
                    <span className="font-bold">{adminSettings.accountName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500">Account Number:</span>
                    <span className="font-mono font-bold text-amber-500">{adminSettings.accountNumber}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">WhatsApp Contact:</span>
                    <span className="font-mono font-bold text-green-500">{adminSettings.whatsappNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FOOD CRUD */}
        {activeTab === 'food' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Food Inventory catalog ({foodItems.length})</h2>
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer transition-colors shadow-md shadow-amber-500/10"
                id="btn-admin-add-item"
              >
                <Plus size={14} />
                <span>Add Pre-Order Meal</span>
              </button>
            </div>

            {/* Food Items Table / List */}
            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      <th className="p-4">Meal Item</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Reservations</th>
                      <th className="p-4">Pre-Order Closes</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {foodItems.map((item) => {
                      const isExpired = new Date(item.closeTime).getTime() <= Date.now();
                      const isSoldOut = item.currentPreOrders >= item.maxPreOrders;
                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-all">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover bg-neutral-100"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <p className="font-bold text-neutral-900 dark:text-neutral-50">{item.name}</p>
                                <p className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">{item.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 font-semibold text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800/30">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-bold text-neutral-950 dark:text-neutral-100">
                            {formatNaira(item.price)}
                          </td>
                          <td className="p-4 font-medium">
                            <span className={isSoldOut ? 'text-red-500 font-bold' : ''}>
                              {item.currentPreOrders} / {item.maxPreOrders}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                            {new Date(item.closeTime).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="p-4">
                            {isSoldOut ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wide">
                                Sold Out
                              </span>
                            ) : isExpired ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20 uppercase tracking-wide">
                                Closed
                              </span>
                            ) : item.available ? (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wide animate-pulse">
                                Active
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-300/30 dark:border-neutral-700/20 uppercase tracking-wide">
                                Paused
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {deletingItemId === item.id ? (
                              <div className="flex items-center justify-end gap-1.5 animate-fade-in">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Confirm Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteFoodItem(item.id);
                                    setDeletingItemId(null);
                                  }}
                                  className="px-2 py-1 text-[10px] font-bold rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
                                  title="Yes, Delete"
                                  id={`confirm-delete-${item.id}`}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingItemId(null)}
                                  className="px-2 py-1 text-[10px] font-bold rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                                  title="Cancel"
                                  id={`cancel-delete-${item.id}`}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                                  title="Edit Item"
                                  id={`edit-item-${item.id}`}
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => setDeletingItemId(item.id)}
                                  className="p-1.5 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                                  title="Delete Item"
                                  id={`delete-item-${item.id}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: USERS TRACKER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Registered Users Tracker ({usersList?.length || 0})
              </h2>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-[10px] uppercase tracking-wider text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-800">
                      <th className="p-4 w-1/3">User Details</th>
                      <th className="p-4 w-1/4">Contact Info</th>
                      <th className="p-4 w-1/4 text-right">Orders Count</th>
                      <th className="p-4 w-1/4 text-right">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {(!Array.isArray(usersList) || usersList.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-sm font-medium">
                          No users registered yet.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((user: any, idx: number) => {
                        const userEmail = user.email || '';
                        const userPhone = user.phone || '';
                        const userName = user.name || 'Unknown';
                        const userCreatedAt = user.createdAt || new Date().toISOString();
                        
                        const userOrders = orders.filter(o => 
                          (o.customerEmail && userEmail && o.customerEmail.toLowerCase() === userEmail.toLowerCase()) || 
                          (o.customerPhone && userPhone && o.customerPhone === userPhone)
                        );
                        return (
                          <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-all">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                  {userName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                                    {userName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <a href={`mailto:${userEmail}`} className="text-xs font-mono text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                  <Mail size={12} /> {userEmail}
                                </a>
                                <a href={`tel:${userPhone}`} className="text-xs font-mono text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                  <Phone size={12} /> {userPhone}
                                </a>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-xs font-bold font-mono">
                                {userOrders.length}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                  {new Date(userCreatedAt).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                  })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const newName = window.prompt('Update user name:', userName);
                                      if (newName && newName !== userName) {
                                        onUpdateUser?.(userEmail, { name: newName });
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:text-amber-600 cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this user?')) {
                                        onDeleteUser?.(userEmail);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS LEDGER */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Customer Pre-Orders Ledger ({orders.length})
              </h2>
              {orders.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all order history? This cannot be undone.')) {
                      onClearOrders?.();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-bold transition-colors cursor-pointer shadow-sm border border-red-200 dark:border-red-900/50"
                >
                  Clear History
                </button>
              )}
            </div>

            {/* HIGHLY POLISHED STATUS FILTERS */}
            <div className="flex flex-wrap gap-2 pb-2">
              <button
                onClick={() => setOrderStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderStatusFilter === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-all"
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setOrderStatusFilter('new')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  orderStatusFilter === 'new'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-new"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                <span>New & Pending ({orders.filter(o => o.status === 'pending').length})</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('paid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  orderStatusFilter === 'paid'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-paid"
              >
                <span>Verified ({orders.filter(o => o.status === 'paid').length})</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('preparing')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  orderStatusFilter === 'preparing'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-preparing"
              >
                <span>In Kitchen ({orders.filter(o => o.status === 'preparing').length})</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('ready')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  orderStatusFilter === 'ready'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-ready"
              >
                <span>Ready ({orders.filter(o => o.status === 'confirmed').length})</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  orderStatusFilter === 'delivered'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-delivered"
              >
                <span>Delivered ({orders.filter(o => o.status === 'delivered').length})</span>
              </button>
              <button
                onClick={() => setOrderStatusFilter('cancelled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  orderStatusFilter === 'cancelled'
                    ? 'bg-neutral-500 text-white dark:bg-neutral-700 shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800'
                }`}
                id="filter-order-cancelled"
              >
                <span>Cancelled ({orders.filter(o => o.status === 'cancelled').length})</span>
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-400">
                <ShoppingCart size={40} className="mx-auto text-neutral-300 dark:text-neutral-800 mb-2" />
                <p className="text-sm">No pre-orders have been submitted yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        <th className="p-4">Order Ref</th>
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Meals Reserved</th>
                        <th className="p-4">Amount Due</th>
                        <th className="p-4">Payment Ref</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {orders
                        .filter((order) => {
                          if (orderStatusFilter === 'all') return true;
                          if (orderStatusFilter === 'new') return order.status === 'pending';
                          if (orderStatusFilter === 'paid') return order.status === 'paid';
                          if (orderStatusFilter === 'preparing') return order.status === 'preparing';
                          if (orderStatusFilter === 'ready') return order.status === 'confirmed';
                          if (orderStatusFilter === 'delivered') return order.status === 'delivered';
                          if (orderStatusFilter === 'cancelled') return order.status === 'cancelled';
                          return true;
                        })
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((order) => {
                          // Define what qualifies as a "New" order visually: pending status, and placed within the last 12 hours
                          const isNew = order.status === 'pending' && (Date.now() - new Date(order.createdAt).getTime() < 12 * 60 * 60 * 1000);

                          return (
                            <tr 
                              key={order.id} 
                              className={`transition-all align-top ${
                                isNew 
                                  ? 'bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.06] border-l-2 border-l-amber-500' 
                                  : 'hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20'
                              }`}
                            >
                              <td className="p-4 font-mono text-xs font-bold text-neutral-800 dark:text-neutral-300">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>{order.id}</span>
                                  {isNew && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500 text-[8px] font-black text-white uppercase tracking-wider animate-pulse shadow-sm">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <span className="block text-[9px] text-neutral-400 font-normal mt-1">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <p className="font-bold text-neutral-900 dark:text-neutral-50">{order.customerName}</p>
                                  <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                                  <p className="text-xs text-neutral-400">{order.customerEmail}</p>
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                                    {order.deliveryMethod} {order.deliveryAddress ? `| ${order.deliveryAddress}` : ''}
                                  </p>
                                </div>
                              </td>
                              <td className="p-4 text-xs font-medium text-neutral-800 dark:text-neutral-300">
                                <ul className="list-disc list-inside space-y-2">
                                  {order.items.map((it, idx) => (
                                    <li key={idx} className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-2">
                                        <span>{it.name}</span>
                                        <span className="font-mono font-bold bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">x{it.quantity}</span>
                                      </div>
                                      {it.addons && it.addons.length > 0 && (
                                        <div className="pl-4 text-[10px] text-neutral-500 italic">
                                          + {it.addons.map(a => a.name).join(', ')}
                                        </div>
                                      )}
                                      {it.notes && (
                                        <div className="pl-4 text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                                          Note: {it.notes}
                                        </div>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td className="p-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                                {formatNaira(order.totalAmount)}
                              </td>
                              <td className="p-4 font-mono text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
                                {order.paymentReference}
                              </td>
                              <td className="p-4">
                                <select
                                  value={order.status}
                                  onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                                  className={`text-[11px] font-extrabold px-2 py-1 rounded-lg border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 uppercase ${
                                    order.status === 'confirmed'
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                      : order.status === 'delivered'
                                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
                                      : order.status === 'preparing'
                                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                      : order.status === 'paid'
                                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                                      : order.status === 'pending'
                                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
                                  }`}
                                >
                                  <option value="pending" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">Pending Verification</option>
                                  <option value="paid" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">Payment Verified</option>
                                  <option value="preparing" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">In Kitchen</option>
                                  <option value="confirmed" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">Ready & Dispatched</option>
                                  <option value="delivered" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">Delivered</option>
                                  <option value="cancelled" className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-bold">Cancelled</option>
                                </select>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex flex-col gap-1.5 items-end justify-center min-h-[36px]">
                                  {order.status === 'pending' && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'paid')}
                                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                                      >
                                        Verify Payment
                                      </button>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-red-500 dark:bg-neutral-800 hover:text-white dark:hover:bg-red-500/20 text-neutral-500 dark:text-neutral-400 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                        title="Cancel Order"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'paid' && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                                      >
                                        Send to Kitchen 🍳
                                      </button>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                                        className="px-2.5 py-1.5 bg-neutral-100 hover:bg-red-500 dark:bg-neutral-800 hover:text-white dark:hover:bg-red-500/20 text-neutral-500 dark:text-neutral-400 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                        title="Cancel Order"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'preparing' && (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm animate-pulse"
                                      >
                                        Ready & Dispatch ✅
                                      </button>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'paid')}
                                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
                                      >
                                        Back to Paid
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                        <CheckCircle2 size={12} />
                                        <span>{order.deliveryMethod === 'delivery' ? 'Dispatched' : 'Ready'}</span>
                                      </span>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                                        className="px-2.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                                      >
                                        Mark Delivered ✅
                                      </button>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer underline"
                                      >
                                        Revert to Kitchen
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'delivered' && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 bg-teal-500/5 dark:bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                                        <CheckCircle2 size={12} className="text-teal-500" />
                                        <span>Delivered</span>
                                      </span>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'confirmed')}
                                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer underline"
                                      >
                                        Revert to Ready
                                      </button>
                                    </div>
                                  )}
                                  {order.status === 'cancelled' && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-red-500 font-bold flex items-center gap-1 bg-red-500/5 dark:bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/10">
                                        <AlertCircle size={12} />
                                        <span>Cancelled</span>
                                      </span>
                                      <button
                                        onClick={() => onUpdateOrderStatus(order.id, 'pending')}
                                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer underline"
                                      >
                                        Re-open Order
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl">
            <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">System Settings</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure coordinates shown to customers during checkout to receive direct bank transfers and WhatsApp proof notifications.
              </p>

              {/* Brand logo customization */}
              <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5 space-y-4">
                <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Brand & Logo Customization</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="settings-logo-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Brand Name (Logo Text)
                    </label>
                    <input
                      id="settings-logo-name"
                      type="text"
                      required
                      value={settingsLogoName}
                      onChange={(e) => setSettingsLogoName(e.target.value)}
                      placeholder="e.g. OlartKitchen"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="settings-logo-emoji" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Logo Emoji / Icon character
                    </label>
                    <input
                      id="settings-logo-emoji"
                      type="text"
                      required
                      value={settingsLogoEmoji}
                      onChange={(e) => setSettingsLogoEmoji(e.target.value)}
                      placeholder="e.g. 🍲, 🧑‍🍳, 🍗"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Local Logo Image Upload */}
                <div className="space-y-1.5 pt-2 border-t border-amber-500/10">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                    Brand Logo Image (Overrides Emoji)
                  </label>
                  
                  {settingsLogoImage ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 flex items-center justify-center">
                        <img src={settingsLogoImage} alt="Logo preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-neutral-950 dark:text-neutral-50 truncate">Custom Uploaded Logo</p>
                        <p className="text-[10px] text-neutral-400">This image will appear in the navigation bar.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsLogoImage('')}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-xs font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleLogoDragOver}
                      onDragLeave={handleLogoDragLeave}
                      onDrop={handleLogoDrop}
                      onClick={() => document.getElementById('logo-file-input')?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragOverLogo 
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-neutral-300 dark:border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-50 dark:hover:bg-neutral-950/50'
                      }`}
                    >
                      <input
                        id="logo-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Upload className="mx-auto h-6 w-6 text-neutral-400 mb-1" />
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Drag and drop logo here, or <span className="text-amber-500 hover:text-amber-600">browse</span>
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-sans">Supports PNG, JPG, WEBP. Max 1.5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer details customization */}
              <div className="p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-4">
                <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-neutral-500" />
                  <span>Footer Details Customization</span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="settings-footer-platform" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Footer Platform Name
                    </label>
                    <input
                      id="settings-footer-platform"
                      type="text"
                      required
                      value={settingsFooterPlatformName}
                      onChange={(e) => setSettingsFooterPlatformName(e.target.value)}
                      placeholder="e.g. Olart Kitchen Pre-Order Platform"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="settings-footer-copyright" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Footer Copyright Text
                    </label>
                    <textarea
                      id="settings-footer-copyright"
                      required
                      value={settingsFooterCopyright}
                      onChange={(e) => setSettingsFooterCopyright(e.target.value)}
                      placeholder="e.g. © 2026 Olart Culinary Enterprise. Lagos, Nigeria. All rights reserved."
                      rows={2}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact details customization */}
              <div className="p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-4">
                <h3 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Phone size={14} className="text-neutral-500" />
                  <span>Contact Details Customization</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="settings-contact-email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Contact Email
                    </label>
                    <input
                      id="settings-contact-email"
                      type="email"
                      required
                      value={settingsContactEmail}
                      onChange={(e) => setSettingsContactEmail(e.target.value)}
                      placeholder="e.g. info@olartkitchen.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="settings-contact-phone" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Contact Phone
                    </label>
                    <input
                      id="settings-contact-phone"
                      type="text"
                      required
                      value={settingsContactPhone}
                      onChange={(e) => setSettingsContactPhone(e.target.value)}
                      placeholder="e.g. +234 816 888 2014"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="settings-contact-address" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Physical Address
                  </label>
                  <input
                    id="settings-contact-address"
                    type="text"
                    required
                    value={settingsContactAddress}
                    onChange={(e) => setSettingsContactAddress(e.target.value)}
                    placeholder="e.g. Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="settings-contact-hours" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Working Hours
                  </label>
                  <input
                    id="settings-contact-hours"
                    type="text"
                    required
                    value={settingsContactHours}
                    onChange={(e) => setSettingsContactHours(e.target.value)}
                    placeholder="e.g. Monday - Saturday: 9:00 AM - 9:00 PM, Sunday: 12:00 PM - 8:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="settings-contact-desc" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Intro/Description Text
                  </label>
                  <textarea
                    id="settings-contact-desc"
                    required
                    value={settingsContactDescription}
                    onChange={(e) => setSettingsContactDescription(e.target.value)}
                    placeholder="Provide a welcoming message for the contact page."
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                  />
                </div>
              </div>

              {/* Bank credentials fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="settings-bank" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Bank Name
                  </label>
                  <input
                    id="settings-bank"
                    type="text"
                    required
                    value={settingsBank}
                    onChange={(e) => setSettingsBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="settings-account-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Account Name
                  </label>
                  <input
                    id="settings-account-name"
                    type="text"
                    required
                    value={settingsAccountName}
                    onChange={(e) => setSettingsAccountName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="settings-account-number" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Account Number (10 digits)
                  </label>
                  <input
                    id="settings-account-number"
                    type="text"
                    required
                    pattern="[0-9]{10}"
                    value={settingsAccountNumber}
                    onChange={(e) => setSettingsAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="settings-whatsapp" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    WhatsApp Business Number
                  </label>
                  <input
                    id="settings-whatsapp"
                    type="text"
                    required
                    placeholder="e.g. +2348031234567"
                    value={settingsWhatsapp}
                    onChange={(e) => setSettingsWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Background Music Configuration */}
              <div className="p-4 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">Atmospheric Background Music</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Control the ambient music loop that plays dynamically across the platform.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsMusicEnabled(!settingsMusicEnabled)}
                    className="text-amber-500 focus:outline-none cursor-pointer"
                  >
                    {settingsMusicEnabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} className="text-neutral-400" />}
                  </button>
                </div>

                {settingsMusicEnabled && (
                  <div className="space-y-2 animate-fade-in pt-1 border-t border-neutral-200/50 dark:border-neutral-800/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">Ambient Sound Volume</span>
                      <span className="font-mono text-amber-600 font-bold">{Math.round(settingsMusicVolume * 200)}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <SlidersHorizontal size={14} className="text-neutral-400" />
                      <input
                        type="range"
                        min="0"
                        max="0.5"
                        step="0.01"
                        value={settingsMusicVolume}
                        onChange={(e) => setSettingsMusicVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-normal">
                      Note: Music tracks adapt automatically to the time of day: Morning, Afternoon, and Night instrumentals.
                    </p>
                  </div>
                )}
              </div>



              {/* Live from Chef Olart's Kitchen Broadcast Panel */}
              <div className="p-4 rounded-xl border border-amber-500/15 bg-amber-500/5 space-y-4">
                <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Utensils size={14} className="text-amber-500" />
                  <span>Broadcast Live From Chef Olart's Kitchen</span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal">
                  Send real-time progress broadcasts directly to active pre-order customers. Mention the chef as <strong>Olart</strong> to preserve brand authority.
                </p>

                <div className="space-y-3">
                  {/* Preset Suggestions */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Quick Presets:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Olart is seasoning the fresh croaker fish for our Signature Seafood Okro!',
                        'Olart has just started roasting smoky firewood spices for our signature Jollof!',
                        'Chef Olart is wrap-steaming spicy Efo Riro with fresh locust beans!',
                        'Olart is golden-frying the crispy puff-puff platter for sweet cravings!'
                      ].map((presetText) => (
                        <button
                          key={presetText}
                          type="button"
                          onClick={() => {
                            setKitchenLivePreset(presetText);
                            setKitchenLiveMessage(presetText);
                          }}
                          className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-left leading-snug ${
                            kitchenLivePreset === presetText
                              ? 'bg-amber-500 border-amber-500 text-white font-bold font-sans'
                              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50'
                          }`}
                        >
                          {presetText}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="space-y-1">
                    <label htmlFor="kitchen-broadcast-msg" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Broadcast Message Customizer
                    </label>
                    <textarea
                      id="kitchen-broadcast-msg"
                      rows={2}
                      value={kitchenLiveMessage || kitchenLivePreset}
                      onChange={(e) => setKitchenLiveMessage(e.target.value)}
                      placeholder="Write what Chef Olart is doing in the kitchen right now..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const msgToSend = kitchenLiveMessage || kitchenLivePreset;
                      if (onBroadcastNotification) {
                        onBroadcastNotification('🍳 Live from Chef Olart\'s Kitchen!', msgToSend, 'system');
                        setKitchenLiveSentMessage(true);
                        setTimeout(() => setKitchenLiveSentMessage(false), 3000);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer transition-all shadow-sm"
                  >
                    <Send size={12} />
                    <span>Send Live Broadcast Notification</span>
                  </button>

                  {kitchenLiveSentMessage && (
                    <div className="flex items-center gap-2 p-2 text-[11px] rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold animate-fade-in">
                      <CheckCircle2 size={12} className="shrink-0" />
                      <span>Broadcast alert delivered to all active users!</span>
                    </div>
                  )}
                </div>
              </div>

              {settingsSavedMessage && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Settings saved successfully.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md shadow-amber-500/10 transition-colors"
                id="btn-save-settings"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}

        {/* TAB: PREMIUM SIDES & ADDONS */}
        {activeTab === 'addons' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-neutral-950 dark:text-white">Premium Sides & Addons</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Configure high-quality sides, drinks, and addons offered to customers during checkout to increase average order value.
                </p>
              </div>

              {/* Addon Form & List */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6 space-y-1">
                    <label htmlFor="new-tab-addon-name" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Addon Name
                    </label>
                    <input
                      id="new-tab-addon-name"
                      type="text"
                      placeholder="e.g. Extra Turkey, Cold Chapman"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1">
                    <label htmlFor="new-tab-addon-price" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Addon Price (₦)
                    </label>
                    <input
                      id="new-tab-addon-price"
                      type="number"
                      placeholder="e.g. 2000"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      value={newAddonPrice}
                      onChange={(e) => setNewAddonPrice(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddAddon}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Plus size={14} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Addons List */}
                <div className="space-y-2 mt-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Active Addons List
                  </label>
                  {settingsAddons.length === 0 ? (
                    <p className="text-[11px] text-neutral-400 italic text-center py-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
                      No active addons configured. Customers will see no addons available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                      {settingsAddons.map((addon) => (
                        <div 
                          key={addon.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/10 text-xs"
                        >
                          <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex flex-col">
                            <span>{addon.name}</span>
                            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">₦{addon.price.toLocaleString()}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(addon.id)}
                            className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer"
                            title="Delete Addon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {addonsSavedMessage && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold animate-fade-in">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>Premium sides & addons config saved successfully!</span>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-900/60">
                <button
                  type="button"
                  onClick={handleSaveAddons}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md shadow-amber-500/10 transition-colors"
                  id="btn-save-addons"
                >
                  Save Sides & Addons
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MILESTONE PROMO */}
        {activeTab === 'promo' && (
          <div className="max-w-5xl space-y-6 animate-fade-in">
            {/* Promo KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-extrabold block">Qualified Orders</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{qualifiedOrders.length}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Gift size={18} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-extrabold block">Qualified Volume</span>
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₦{qualifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-extrabold block">Conversion Rate</span>
                  <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                    {orders.length > 0 ? ((qualifiedOrders.length / orders.length) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Promo Configuration Form */}
              <div className="lg:col-span-5 space-y-6">
                <form onSubmit={handleSavePromo} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Promo Configurations</h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">Define promo constraints & rewards.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsPromoEnabled(!settingsPromoEnabled)}
                      className="text-amber-500 focus:outline-none cursor-pointer"
                      id="promo-tab-toggle"
                    >
                      {settingsPromoEnabled ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-neutral-400" />}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label htmlFor="promo-amount-input" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Minimum Order Amount (₦)
                      </label>
                      <input
                        id="promo-amount-input"
                        type="number"
                        required
                        disabled={!settingsPromoEnabled}
                        value={settingsPromoMinAmount}
                        onChange={(e) => setSettingsPromoMinAmount(Number(e.target.value) || 0)}
                        placeholder="e.g. 15000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="promo-reward-input" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Promo Reward / Free Gift Name
                      </label>
                      <input
                        id="promo-reward-input"
                        type="text"
                        required
                        disabled={!settingsPromoEnabled}
                        value={settingsPromoRewardName}
                        onChange={(e) => setSettingsPromoRewardName(e.target.value)}
                        placeholder="e.g. Free bottle of legendary Hibiscus Zobo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {promoSavedMessage && (
                    <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold animate-fade-in">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>Promo configurations updated!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md shadow-amber-500/10 transition-colors"
                  >
                    Save Promo Settings
                  </button>
                </form>

                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-200/50 dark:border-neutral-800/50 space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>How it works on checkout</span>
                  </h4>
                  <ul className="text-[11px] text-neutral-600 dark:text-neutral-400 space-y-2 list-disc list-inside leading-relaxed">
                    <li>Dynamic cart progress bar calculates live deficit (₦ left to free gift).</li>
                    <li>Congratulates customer inside cart with sound cue when milestone is reached.</li>
                    <li>Appends the gift description automatically into the final orders database ledger.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column - Qualified Orders List */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex flex-col min-h-[400px]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800/60">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-950 dark:text-white">Qualified Pre-Orders Tracker</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Real-time ledger of orders qualifying for ₦{settingsPromoMinAmount.toLocaleString()}+.</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-full font-extrabold shrink-0 self-start sm:self-auto">
                    {qualifiedOrders.length} Qualified
                  </span>
                </div>

                <div className="flex-1 mt-4 overflow-y-auto max-h-[480px] space-y-3 pr-1">
                  {qualifiedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full py-12 text-neutral-400">
                      <Gift size={32} className="text-neutral-300 dark:text-neutral-700 animate-bounce mb-3" />
                      <p className="text-xs italic font-medium">No orders qualify for the current ₦{settingsPromoMinAmount.toLocaleString()}+ promo.</p>
                    </div>
                  ) : (
                    qualifiedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/40 dark:bg-neutral-950/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-amber-500/30 transition-all"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-xs truncate">
                              {order.customerName}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400 font-normal shrink-0">
                              (#{order.id.slice(-6)})
                            </span>
                          </div>

                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 flex flex-wrap gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1">
                              <Phone size={11} className="text-neutral-400 shrink-0" />
                              {order.customerPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail size={11} className="text-neutral-400 shrink-0" />
                              {order.customerEmail}
                            </span>
                          </div>

                          <div className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                            Unlocks: {settingsPromoRewardName}
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-neutral-150 dark:border-neutral-800">
                          <div className="text-left sm:text-right shrink-0">
                            <div className="font-mono font-bold text-neutral-900 dark:text-neutral-50 text-xs">
                              ₦{order.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">
                              {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                const text = `Hello ${order.customerName}! 🎉 Olart Kitchen here! Your pre-order of ₦${order.totalAmount.toLocaleString()} has qualified for our Pre-Order Milestone Promo. You have unlocked a *${settingsPromoRewardName}* with your meal! Thank you for ordering! 🍳`;
                                navigator.clipboard.writeText(text);
                                setPromoCopiedId(order.id);
                                setTimeout(() => setPromoCopiedId(null), 2000);
                              }}
                              className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                                promoCopiedId === order.id
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-amber-500'
                              }`}
                            >
                              {promoCopiedId === order.id ? 'Copied' : 'Copy Text'}
                            </button>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shrink-0 ${
                              order.status === 'confirmed' || order.status === 'paid' || order.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : order.status === 'preparing'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="max-w-4xl space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-5 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-50">Manage Meal Categories</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Create, rename, or delete food categories. Renaming a category automatically updates all associated meal items. Deleting a category prompts moving its items to a remaining category.
                </p>
              </div>

              {/* Add New Category Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCategoryInput.trim()) {
                    onAddCategory(newCategoryInput.trim());
                    setNewCategoryInput('');
                  }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex-1 w-full space-y-1">
                  <label htmlFor="new-category-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    New Category Name
                  </label>
                  <input
                    id="new-category-name"
                    type="text"
                    required
                    placeholder="e.g. Traditional Swallows, Soft Breads..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 h-[40px] flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-md shadow-amber-500/10"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </form>

              {/* Categories Table/List */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-950">
                {/* Desktop and Tablet Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        <th className="p-4">Category Name</th>
                        <th className="p-4">Meals in Category</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 text-xs">
                      {categories.map((cat) => {
                        const itemCount = foodItems.filter((item) => item.category === cat).length;
                        const isEditing = editingCategoryName === cat;

                        return (
                          <tr key={cat} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                            <td className="p-4 font-semibold text-neutral-800 dark:text-neutral-200">
                              {isEditing ? (
                                <div className="flex items-center gap-2 max-w-xs">
                                  <input
                                    type="text"
                                    value={categoryEditValue}
                                    onChange={(e) => setCategoryEditValue(e.target.value)}
                                    className="px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 w-full"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (categoryEditValue.trim() && categoryEditValue.trim() !== cat) {
                                        onUpdateCategory(cat, categoryEditValue.trim());
                                      }
                                      setEditingCategoryName(null);
                                    }}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded cursor-pointer"
                                    title="Save Changes"
                                  >
                                    <CheckCircle2 size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCategoryName(null)}
                                    className="p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span>{cat}</span>
                              )}
                            </td>
                            <td className="p-4 text-neutral-500 font-mono">
                              {itemCount} {itemCount === 1 ? 'meal' : 'meals'}
                            </td>
                            <td className="p-4 text-right">
                              {!isEditing && (
                                deletingCategoryName === cat ? (
                                  <div className="flex items-center justify-end gap-1.5 animate-fade-in">
                                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Move food items?</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onDeleteCategory(cat);
                                        setDeletingCategoryName(null);
                                      }}
                                      className="px-2 py-1 text-[10px] font-bold rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
                                      title="Yes, Delete"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingCategoryName(null)}
                                      className="px-2 py-1 text-[10px] font-bold rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                                      title="Cancel"
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingCategoryName(cat);
                                        setCategoryEditValue(cat);
                                      }}
                                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                      title="Rename Category"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingCategoryName(cat);
                                      }}
                                      disabled={categories.length <= 1}
                                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors cursor-pointer"
                                      title={categories.length <= 1 ? "Cannot delete the last category" : "Delete Category"}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List View (Non-squished, large touch targets) */}
                <div className="block sm:hidden divide-y divide-neutral-200 dark:divide-neutral-800/60">
                  {categories.map((cat) => {
                    const itemCount = foodItems.filter((item) => item.category === cat).length;
                    const isEditing = editingCategoryName === cat;

                    return (
                      <div key={cat} className="p-4 space-y-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                        {isEditing ? (
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                              Editing Category Name
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={categoryEditValue}
                                onChange={(e) => setCategoryEditValue(e.target.value)}
                                className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 h-[44px]"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (categoryEditValue.trim() && categoryEditValue.trim() !== cat) {
                                    onUpdateCategory(cat, categoryEditValue.trim());
                                  }
                                  setEditingCategoryName(null);
                                }}
                                className="w-[44px] h-[44px] flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Save Changes"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategoryName(null)}
                                className="w-[44px] h-[44px] flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors cursor-pointer shrink-0"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">{cat}</h4>
                              <p className="text-xs text-neutral-500 font-mono">
                                {itemCount} {itemCount === 1 ? 'meal' : 'meals'}
                              </p>
                            </div>

                            {deletingCategoryName === cat ? (
                              <div className="flex items-center gap-1.5 animate-fade-in">
                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mr-1">Move meals?</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteCategory(cat);
                                    setDeletingCategoryName(null);
                                  }}
                                  className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer transition-colors"
                                  title="Yes, Delete"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingCategoryName(null)}
                                  className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                                  title="Cancel"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryName(cat);
                                    setCategoryEditValue(cat);
                                  }}
                                  className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                  title="Rename Category"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingCategoryName(cat);
                                  }}
                                  disabled={categories.length <= 1}
                                  className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                  title={categories.length <= 1 ? "Cannot delete the last category" : "Delete Category"}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>

      {/* CRUD Food Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[90vh] rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <h3 className="font-sans font-bold text-base text-neutral-900 dark:text-neutral-50">
                {editingItem ? 'Edit Pre-Order Food Details' : 'Add New Pre-Order Food Meal'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {itemFormError && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200/40 dark:border-red-900/40 flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {itemFormError}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-item-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Meal Title
                  </label>
                  <input
                    id="modal-item-name"
                    type="text"
                    required
                    placeholder="e.g. Seafood Pasta Platter"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="modal-item-category" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Food Category
                  </label>
                    <select
                      id="modal-item-category"
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full h-[38px] px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="modal-item-desc" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Meal Description
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDesc}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 dark:hover:bg-amber-500 dark:hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm border border-amber-500/10"
                    title="Generate culinary description using Gemini"
                  >
                    {isGeneratingDesc ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Sparkles size={11} />
                    )}
                    <span>{isGeneratingDesc ? "AI Writing..." : "AI Describe"}</span>
                  </button>
                </div>
                <textarea
                  id="modal-item-desc"
                  required
                  rows={2}
                  placeholder="Detail the ingredients, serving style, proteins..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-item-price" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Price in Naira (₦)
                  </label>
                  <input
                    id="modal-item-price"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 15000"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="modal-item-max" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Max Slots / Capacity
                  </label>
                  <input
                    id="modal-item-max"
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 30"
                    value={itemMaxPreOrders}
                    onChange={(e) => setItemMaxPreOrders(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="modal-item-closetime" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Pre-Order Closing Date & Time (Live Timer Target)
                  </label>
                  <input
                    id="modal-item-closetime"
                    type="datetime-local"
                    required
                    min={minDateTimeLocal}
                    value={itemCloseTime}
                    onChange={(e) => setItemCloseTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Availability & Visibility
                  </label>
                  <div className="flex items-center h-[38px]">
                    <button
                      type="button"
                      onClick={() => setItemAvailable(!itemAvailable)}
                      className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      {itemAvailable ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                          <ToggleRight size={28} />
                          <span>Visible in Catalog</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-neutral-400 font-semibold">
                          <ToggleLeft size={28} />
                          <span>Hidden / Paused</span>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Food Display Image
                </label>
                
                <div className="flex flex-col sm:flex-row items-start gap-4 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                  {/* Image Preview */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center shrink-0 shadow-inner group">
                    {isGeneratingImg && (
                      <div className="absolute inset-0 bg-neutral-950/70 z-10 flex flex-col items-center justify-center text-white text-center p-1">
                        <Loader2 size={16} className="animate-spin text-amber-400 mb-1" />
                        <span className="text-[8px] font-bold leading-none">AI Generating...</span>
                      </div>
                    )}
                    {itemImage ? (
                      <img 
                        src={itemImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Handle broken image URL gracefully
                          e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                        }}
                      />
                    ) : (
                      <div className="text-[10px] text-neutral-400 font-medium text-center px-1">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Actions / Inputs */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Option A: Upload Local Image File</span>
                      <div className="relative">
                        <input
                          id="modal-item-file-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  const img = new window.Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    let { width, height } = img;
                                    const maxSize = 800;
                                    if (width > height && width > maxSize) {
                                      height = Math.round((height * maxSize) / width);
                                      width = maxSize;
                                    } else if (height > maxSize) {
                                      width = Math.round((width * maxSize) / height);
                                      height = maxSize;
                                    }
                                    canvas.width = width;
                                    canvas.height = height;
                                    const ctx = canvas.getContext('2d');
                                    ctx?.drawImage(img, 0, 0, width, height);
                                    setItemImage(canvas.toDataURL('image/jpeg', 0.8));
                                  };
                                  img.src = reader.result;
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="modal-item-file-upload"
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-amber-500/50 hover:border-amber-500 rounded-xl bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-amber-500 dark:hover:text-amber-400 text-xs font-semibold cursor-pointer transition-all shadow-sm"
                        >
                          <Upload size={14} className="text-amber-500" />
                          <span>Choose local file...</span>
                        </label>
                      </div>
                    </div>

                    <div className="relative flex items-center justify-center py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                      </div>
                      <span className="relative px-2 bg-neutral-50 dark:bg-neutral-950/40 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Or</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Option B: Use Online Image URL</span>
                      <input
                        id="modal-item-image"
                        type="text"
                        required={!itemImage || !itemImage.startsWith('data:')}
                        placeholder="Paste direct Unsplash image link..."
                        value={itemImage.startsWith('data:') ? '' : itemImage}
                        onChange={(e) => setItemImage(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                      />
                      {itemImage.startsWith('data:') && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 size={10} /> Local file loaded & saved.
                        </p>
                      )}
                    </div>

                    <div className="relative flex items-center justify-center py-1">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                      </div>
                      <span className="relative px-2 bg-neutral-50 dark:bg-neutral-950/40 text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Or</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Option C: Generate with AI</span>
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImg}
                        className="flex items-center justify-center gap-2 px-3 py-2 border border-amber-500/30 hover:border-amber-500 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isGeneratingImg ? (
                          <Loader2 size={14} className="animate-spin text-amber-500" />
                        ) : (
                          <Sparkles size={14} className="text-amber-500" />
                        )}
                        <span>{isGeneratingImg ? "Generating Premium Image..." : "Generate AI Culinary Image"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-xs font-bold text-neutral-600 dark:text-neutral-400 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white cursor-pointer transition-colors shadow-md shadow-amber-500/10"
                  id="modal-item-submit"
                >
                  {editingItem ? 'Save Updates' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
