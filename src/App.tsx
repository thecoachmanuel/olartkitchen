/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Search, Sparkles, Sun, Moon, SlidersHorizontal, 
  Trash2, X, AlertCircle, RefreshCw, KeyRound, ArrowRight, Utensils, Heart, Check, Info, User as UserIcon, Phone
} from 'lucide-react';
import { FoodItem, CartItem, Order, AdminSettings, User } from './types';
import { INITIAL_FOOD_ITEMS, DEFAULT_ADMIN_SETTINGS, FOOD_CATEGORIES, SEED_ORDERS } from './data';
import FoodCard from './components/FoodCard';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import UserPortal from './components/UserPortal';
import ContactPage from './components/ContactPage';
import { BackgroundMusic } from './components/BackgroundMusic';

// Helper to normalize food categories to match exact synced filters
const normalizeCategory = (cat: string): string => {
  const clean = cat.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('rice')) return 'Rice Platters';
  if (lower.includes('swallow') || lower.includes('soup')) return 'Swallow & Soups';
  if (lower.includes('ewa') || lower.includes('aganyin') || lower === 'beans') return 'Ewa Aganyin & Beans';
  if (lower.includes('grill') || lower.includes('suya')) return 'Grills & Suya';
  if (lower.includes('chop') || lower.includes('sweet') || lower.includes('puff')) return 'Chops & Sweet Things';
  return 'Rice Platters';
};

export default function App() {
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('olart-theme');
    return (stored === 'dark' || stored === 'light') ? stored : 'light';
  });

  // Navigation View ('storefront' | 'admin' | 'contact')
  const [activeView, setActiveView] = useState<'storefront' | 'admin' | 'contact'>('storefront');

  // Core Persistent States
  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const stored = localStorage.getItem('olart-food-items');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((item: FoodItem) => ({
            ...item,
            category: normalizeCategory(item.category)
          }));
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_FOOD_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = localStorage.getItem('olart-orders');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return SEED_ORDERS;
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const stored = localStorage.getItem('olart-admin-settings');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return DEFAULT_ADMIN_SETTINGS;
  });

  // Dynamic categories state (excluding "All" virtual category)
  const [categories, setCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem('olart-categories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return FOOD_CATEGORIES.filter((c) => c !== 'All');
  });

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // User Authentication & Order Tracking states
  const [usersList, setUsersList] = useState<User[]>(() => {
    const stored = localStorage.getItem('olart-users-list');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const hasAdewale = parsed.some((u: any) => u.email.toLowerCase() === 'manueloliver2908@gmail.com');
        if (!hasAdewale) {
          parsed.push({
            name: 'Adewale Olaitan',
            email: 'manueloliver2908@gmail.com',
            phone: '08031234567',
            password: 'password123',
            createdAt: new Date().toISOString(),
          });
        }
        return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      {
        name: 'Adewale Olaitan',
        email: 'manueloliver2908@gmail.com',
        phone: '08031234567',
        password: 'password123',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('olart-current-user');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [isUserPortalOpen, setIsUserPortalOpen] = useState(false);

  // Database status tracking
  const [dbStatus, setDbStatus] = useState<{ isConnected: boolean; mode: string; databaseName: string | null; error: string | null } | null>(null);

  useEffect(() => {
    // Check MongoDB Connection Status
    fetch('/api/db-status')
      .then((res) => res.json())
      .then((data) => {
        setDbStatus(data);
      })
      .catch((err) => console.error('Failed to get database status:', err));

    // Pull database contents
    fetch('/api/food-items')
      .then((res) => res.json())
      .then((items) => {
        if (Array.isArray(items)) setFoodItems(items);
      })
      .catch((err) => console.error('Failed to fetch items:', err));

    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error('Failed to fetch orders:', err));

    fetch('/api/admin-settings')
      .then((res) => res.json())
      .then((settings) => {
        if (settings && settings.whatsappNumber) setAdminSettings(settings);
      })
      .catch((err) => console.error('Failed to fetch settings:', err));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((cats) => {
        if (Array.isArray(cats)) setCategories(cats);
      })
      .catch((err) => console.error('Failed to fetch categories:', err));

    fetch('/api/users')
      .then((res) => res.json())
      .then((users) => {
        if (Array.isArray(users)) setUsersList(users);
      })
      .catch((err) => console.error('Failed to fetch users:', err));
  }, []);

  // Preload food images and logo image for instant, delay-free rendering
  useEffect(() => {
    if (foodItems && foodItems.length > 0) {
      foodItems.forEach((item) => {
        if (item.image) {
          const img = new window.Image();
          img.src = item.image;
        }
      });
    }
  }, [foodItems]);

  useEffect(() => {
    if (adminSettings?.logoImage) {
      const img = new window.Image();
      img.src = adminSettings.logoImage;
    }
  }, [adminSettings?.logoImage]);

  // Apply Theme to document root
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('olart-theme', theme);
  }, [theme]);

  // Persist State Changes
  useEffect(() => {
    localStorage.setItem('olart-food-items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem('olart-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('olart-admin-settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem('olart-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('olart-users-list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('olart-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('olart-current-user');
    }
  }, [currentUser]);

  // Utility to show temporary toast
  const triggerToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  // Cart Operations
  const handleAddToCart = (item: FoodItem) => {
    const isAvailable = item.available && (item.currentPreOrders < item.maxPreOrders);
    if (!isAvailable) {
      triggerToast('Pre-order slots are full or expired!');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((it) => it.foodItem.id === item.id);
      if (existing) {
        const nextQty = existing.quantity + 1;
        if (item.currentPreOrders + nextQty > item.maxPreOrders) {
          triggerToast('Exceeds available pre-order slots.');
          return prevCart;
        }
        return prevCart.map((it) => 
          it.foodItem.id === item.id ? { ...it, quantity: nextQty } : it
        );
      }
      triggerToast(`Added ${item.name} to pre-orders.`);
      return [...prevCart, { foodItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const foodItem = foodItems.find((it) => it.id === itemId);
    if (!foodItem) return;

    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((it) => it.foodItem.id !== itemId));
      triggerToast('Removed from pre-order list.');
      return;
    }

    // Check capacity boundaries
    if (foodItem.currentPreOrders + newQuantity > foodItem.maxPreOrders) {
      triggerToast('Cannot exceed maximum pre-order capacity!');
      return;
    }

    setCart((prev) =>
      prev.map((it) => (it.foodItem.id === itemId ? { ...it, quantity: newQuantity } : it))
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((it) => it.foodItem.id !== itemId));
    triggerToast('Removed from pre-orders.');
  };

  const handleClearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // Submission of checkout
  const handleSubmitOrder = (customerData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress?: string;
    password?: string;
  }): Order => {
    const totalAmount = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
    const orderId = `OLART-${Math.floor(1000 + Math.random() * 9000)}-NG`;
    const paymentRef = `TXREF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      customerName: customerData.customerName,
      customerEmail: customerData.customerEmail,
      customerPhone: customerData.customerPhone,
      deliveryMethod: customerData.deliveryMethod,
      deliveryAddress: customerData.deliveryAddress,
      items: cart.map((it) => ({
        foodItemId: it.foodItem.id,
        name: it.foodItem.name,
        price: it.foodItem.price,
        quantity: it.quantity,
      })),
      totalAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentReference: paymentRef,
    };

    // 1. Increment current pre-order registers of food items
    setFoodItems((prevItems) => {
      const next = prevItems.map((item) => {
        const cartMatch = cart.find((it) => it.foodItem.id === item.id);
        if (cartMatch) {
          const updated = {
            ...item,
            currentPreOrders: Math.min(item.currentPreOrders + cartMatch.quantity, item.maxPreOrders),
          };
          fetch(`/api/food-items/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch((err) => console.error('Failed to update food stock on server:', err));
          return updated;
        }
        return item;
      });
      return next;
    });

    // 2. Add to orders log
    setOrders((prev) => [newOrder, ...prev]);
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch((err) => console.error('Failed to post order to server:', err));

    // 3. Clean cart
    setCart([]);

    // 4. Auto register & login only if password provided
    const targetEmail = customerData.customerEmail.trim().toLowerCase();
    const existingUser = usersList.find((u) => u.email.toLowerCase() === targetEmail);

    if (customerData.password && customerData.password.trim() !== '') {
      const resolvedUser: User = {
        name: customerData.customerName,
        email: targetEmail,
        phone: customerData.customerPhone,
        createdAt: new Date().toISOString(),
        password: customerData.password.trim(),
      };

      if (!existingUser) {
        setUsersList((prev) => [...prev, resolvedUser]);
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resolvedUser)
        }).catch((err) => console.error('Failed to sync new user to server:', err));
      } else {
        // Update password if they entered one on an existing account
        const updatedUsers = usersList.map((u) => (u.email.toLowerCase() === targetEmail ? { ...u, password: customerData.password!.trim() } : u));
        setUsersList(updatedUsers);
        const targetUser = updatedUsers.find((u) => u.email.toLowerCase() === targetEmail);
        if (targetUser) {
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(targetUser)
          }).catch((err) => console.error('Failed to sync updated user to server:', err));
        }
      }
      setCurrentUser(resolvedUser);
      triggerToast(`Order registered! Account created and logged in as ${resolvedUser.name}.`);
    } else {
      if (currentUser) {
        // They were already logged in, associate with existing session
        triggerToast(`Order registered! Thank you, your pre-order has been logged successfully.`);
      } else {
        triggerToast(`Order registered! Provide a password during checkout next time to save an account for order tracking.`);
      }
    }
    return newOrder;
  };

  const handleUserLogin = async (email: string, password?: string): Promise<boolean | string> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!password || password.trim() === '') {
      return "Password is required for user login.";
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: password.trim() }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        return data.error || "Failed to log in. Please check credentials.";
      }
      
      setCurrentUser(data.user);
      triggerToast(`Welcome back, ${data.user.name}!`);
      
      setUsersList((prev) => {
        const filtered = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
        return [...filtered, data.user];
      });

      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      // Fallback local matching if server is unreachable
      const found = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!found) {
        return "No account found with this email. Create an account during checkout or register below!";
      }
      if (found.password && found.password.toLowerCase() !== password.trim().toLowerCase()) {
        return "Incorrect password. Please try again.";
      }
      setCurrentUser(found);
      triggerToast(`Welcome back, ${found.name}! (Offline Fallback)`);
      return true;
    }
  };

  const handleUserRegister = async (name: string, email: string, phone: string, password?: string): Promise<boolean | string> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!password || password.trim() === '') {
      return "Password is required to create an account.";
    }

    const existing = usersList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return "An account with this email already exists. Please log in.";
    }

    const newUser: User = {
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      createdAt: new Date().toISOString(),
      password: password.trim(),
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        return data.error || "Failed to register user.";
      }
      
      setUsersList((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      triggerToast(`Welcome, ${newUser.name}! Your account is ready.`);
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      setUsersList((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      triggerToast(`Welcome, ${newUser.name}! Your account is ready. (Offline Fallback)`);
      return true;
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    triggerToast('Logged out of tracking session.');
  };

  // Admin CRUD actions
  const handleAddFoodItem = (newItemData: Omit<FoodItem, 'id' | 'currentPreOrders'>) => {
    const newId = `food-${Date.now()}`;
    const newMeal: FoodItem = {
      id: newId,
      ...newItemData,
      currentPreOrders: 0,
    };
    setFoodItems((prev) => [newMeal, ...prev]);
    
    fetch('/api/food-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMeal)
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Created pre-order meal: ${newItemData.name}`))
    .catch((err) => {
      console.error(err);
      triggerToast('Synced locally. Failed to save to remote database.');
    });
  };

  const handleUpdateFoodItem = (updatedItem: FoodItem) => {
    setFoodItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
    
    fetch(`/api/food-items/${updatedItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItem)
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Updated pre-order meal: ${updatedItem.name}`))
    .catch((err) => {
      console.error(err);
      triggerToast('Synced locally. Failed to update remote database.');
    });
  };

  const handleDeleteFoodItem = (itemId: string) => {
    setFoodItems((prev) => prev.filter((it) => it.id !== itemId));
    setCart((prev) => prev.filter((it) => it.foodItem.id !== itemId));
    
    fetch(`/api/food-items/${itemId}`, {
      method: 'DELETE'
    })
    .then((res) => res.json())
    .then(() => triggerToast('Pre-order meal removed from system.'))
    .catch((err) => {
      console.error(err);
      triggerToast('Removed locally. Failed to delete from remote database.');
    });
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    
    fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Order ${orderId} updated to ${status.toUpperCase()}`))
    .catch((err) => {
      console.error(err);
      triggerToast('Status updated locally. Remote database update failed.');
    });
  };

  const handleUpdateSettings = (updatedSettings: AdminSettings) => {
    setAdminSettings(updatedSettings);
    
    fetch('/api/admin-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    })
    .then((res) => res.json())
    .then(() => triggerToast('Fulfillment coordinates saved.'))
    .catch((err) => {
      console.error(err);
      triggerToast('Saved locally. Failed to update remote database.');
    });
  };

  const handleAddCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed || trimmed === 'All') return;
    if (categories.includes(trimmed)) {
      triggerToast('Category already exists.');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed })
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Category "${trimmed}" added.`))
    .catch((err) => {
      console.error(err);
      triggerToast('Added locally. Remote database sync failed.');
    });
  };

  const handleUpdateCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === 'All') return;
    if (categories.includes(trimmed)) {
      triggerToast('Category name already exists.');
      return;
    }
    setCategories((prev) => prev.map((cat) => (cat === oldName ? trimmed : cat)));
    setFoodItems((prev) =>
      prev.map((item) => (item.category === oldName ? { ...item, category: trimmed } : item))
    );
    
    fetch(`/api/categories/${oldName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed })
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Category renamed to "${trimmed}"`))
    .catch((err) => {
      console.error(err);
      triggerToast('Renamed locally. Remote database sync failed.');
    });
  };

  const handleDeleteCategory = (catName: string) => {
    if (categories.length <= 1) {
      triggerToast('Cannot delete the last remaining category.');
      return;
    }
    const remaining = categories.filter((cat) => cat !== catName);
    const fallback = remaining[0];
    
    setCategories(remaining);
    setFoodItems((prev) =>
      prev.map((item) => (item.category === catName ? { ...item, category: fallback } : item))
    );
    if (selectedCategory === catName) {
      setSelectedCategory('All');
    }
    
    fetch(`/api/categories/${catName}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fallback })
    })
    .then((res) => res.json())
    .then(() => triggerToast(`Category deleted. Associated meals moved to "${fallback}".`))
    .catch((err) => {
      console.error(err);
      triggerToast('Deleted locally. Remote database sync failed.');
    });
  };

  const handleResetAppDefaults = () => {
    if (confirm('Reset to standard platform demo meals?')) {
      setFoodItems(INITIAL_FOOD_ITEMS);
      setOrders([]);
      setAdminSettings(DEFAULT_ADMIN_SETTINGS);
      setCart([]);
      setCategories(FOOD_CATEGORIES.filter((c) => c !== 'All'));
      triggerToast('Platform reset to standard demonstration setup.');
    }
  };

  // Filtering Logic for Customer Catalog
  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);

  // Format currency
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300 antialiased font-sans relative overflow-x-hidden w-full">
      
      {/* Background Orbs */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-20 blur-[120px] ambient-glow-amber" />
        <div className="absolute top-[-50px] right-1/4 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-[100px] ambient-glow-emerald" />
      </div>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -30, x: "-50%" }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-5 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-neutral-900/90 text-white dark:bg-white dark:text-neutral-950 shadow-2xl border border-white/10 dark:border-neutral-200 text-xs font-semibold backdrop-blur-md"
          >
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Premium Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/80 dark:bg-neutral-950/80 border-b border-neutral-200/50 dark:border-neutral-900/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div 
            onClick={() => setActiveView('storefront')} 
            className="flex items-center gap-2 cursor-pointer group"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 group-hover:rotate-6 transition-all duration-300 overflow-hidden">
              {adminSettings.logoImage ? (
                <img src={adminSettings.logoImage} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : adminSettings.logoEmoji ? (
                <span className="text-xl leading-none">{adminSettings.logoEmoji}</span>
              ) : (
                <Utensils size={18} />
              )}
            </div>
            <div>
              <span className="font-sans font-extrabold text-lg sm:text-xl tracking-tight text-neutral-950 dark:text-white">
                {adminSettings.logoName || 'OlartKitchen'}
              </span>
            </div>
          </div>

          {/* Navigation Switches */}
          <div className="flex items-center gap-1 sm:gap-3">

            {/* Theme Switcher Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
              aria-label="Toggle Theme"
              id="theme-switcher-btn"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Contact Us Button */}
            <button
              onClick={() => setActiveView(activeView === 'contact' ? 'storefront' : 'contact')}
              className={`relative flex items-center justify-center p-2.5 sm:px-4.5 sm:py-3 rounded-xl text-sm font-bold border transition-all duration-200 gap-2 cursor-pointer ${
                activeView === 'contact'
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
              id="contact-portal-toggle"
            >
              <Phone size={15} />
              <span className="hidden sm:inline">Contact Us</span>
            </button>

            {/* User Account / Tracker Button */}
            {(activeView === 'storefront' || activeView === 'contact') && (
              <button
                onClick={() => setIsUserPortalOpen(true)}
                className={`relative flex items-center justify-center p-2.5 sm:px-4.5 sm:py-3 rounded-xl text-sm font-bold border transition-all duration-200 gap-2 cursor-pointer ${
                  currentUser
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 hover:bg-emerald-500/10'
                    : 'border-neutral-200/50 dark:border-neutral-800/50 bg-white/50 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
                id="user-portal-toggle"
              >
                <UserIcon size={15} className={currentUser ? "animate-pulse text-emerald-500" : ""} />
                <span className="hidden sm:inline">
                  {currentUser ? `Track (${currentUser.name})` : 'Track Pre-Orders'}
                </span>
                {currentUser && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* Storefront Pre-order Cart Button */}
            {(activeView === 'storefront' || activeView === 'contact') && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center p-2.5 sm:px-4.5 sm:py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 cursor-pointer transition-all duration-200 gap-2"
                id="shopping-cart-toggle"
              >
                <ShoppingBag size={15} />
                <span className="hidden sm:inline">My pre-orders</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:relative sm:top-0 sm:right-0 flex items-center justify-center w-5.5 h-5.5 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-mono text-xs font-extrabold border border-amber-500">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          {activeView === 'storefront' ? (
            <motion.div
              key="storefront"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-8"
            >
              
              {/* ATMOSPHERIC HERO CONTAINER */}
              <div className="text-center max-w-3xl mx-auto space-y-4 py-6 sm:py-10 mt-3 sm:mt-5">
                <h1 className="font-sans font-extrabold text-3xl sm:text-5xl lg:text-6xl text-neutral-950 dark:text-white tracking-tight leading-tight">
                  Authentic Naija Feast, <span className="text-amber-500">Prepared Fresh</span>
                </h1>
                <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
                  {(adminSettings.logoName || 'Olart Kitchen').replace(/([A-Z])/g, ' $1').trim()} cooks premium, authentic Nigerian soups, platters, and swallow. Secure your portion now before the live countdown timers run out and our prep registers close!
                </p>
              </div>

            {/* SEARCH AND CATEGORY CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/40 shadow-sm backdrop-blur-md gap-4">
              
              {/* Category selector pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 pr-2 scrollbar-none">
                {['All', ...categories].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-white shadow shadow-amber-500/10'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/50'
                    }`}
                    id={`filter-cat-${cat.toLowerCase().replace(' ', '-')}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Dynamic search box */}
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search menu for chop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  id="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

            </div>

            {/* EMPTY STATE */}
            {filteredFoodItems.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                  <SlidersHorizontal size={22} />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-lg text-neutral-900 dark:text-neutral-100">No matching culinary plates</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Try clearing your search keyword or switching categories to find other premium dishes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* FOOD ITEMS CATALOG GRID */
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="food-catalog-grid">
                <AnimatePresence mode="popLayout">
                  {filteredFoodItems.map((item) => {
                    const cartMatch = cart.find((it) => it.foodItem.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <FoodCard
                          item={item}
                          cartQuantity={cartMatch ? cartMatch.quantity : 0}
                          onAddToCart={handleAddToCart}
                          onUpdateQuantity={handleUpdateQuantity}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Information Banner about payment confirmation */}
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-200">How Olart Pre-orders Work</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    Select your meals, verify delivery parameters, pay to our specified bank account, and tap the secure WhatsApp button to confirm your order and send your payment receipt. We prepare exactly what is confirmed!
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        ) : activeView === 'contact' ? (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ContactPage
              adminSettings={adminSettings}
              setActiveView={setActiveView}
            />
          </motion.div>
        ) : (
          /* ADMIN DASHBOARD VIEW */
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <AdminPanel
              foodItems={foodItems}
              orders={orders}
              adminSettings={adminSettings}
              onUpdateSettings={handleUpdateSettings}
              onAddFoodItem={handleAddFoodItem}
              onUpdateFoodItem={handleUpdateFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              dbStatus={dbStatus}
            />
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white dark:bg-neutral-950 border-t border-neutral-200/40 dark:border-neutral-900/40 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-sm font-bold text-neutral-950 dark:text-white flex items-center gap-1 justify-center md:justify-start">
              <span>{adminSettings.footerPlatformName || 'Olart Kitchen Pre-Order Platform'}</span>
              <Heart size={12} className="text-red-500 fill-red-500" />
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {adminSettings.footerCopyright || `© ${new Date().getFullYear()} Olart Culinary Enterprise. Lagos, Nigeria. All rights reserved.`}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Website built by <a href="https://wa.me/2348168882014" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600 transition-colors font-bold decoration-amber-500/30 hover:underline">Manuel</a>
            </p>
          </div>
          
          <div className="flex items-center gap-5 text-sm text-neutral-500 font-bold">
            <button
              onClick={() => {
                setActiveView('storefront');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-500 transition-colors cursor-pointer"
            >
              Order Platform
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setActiveView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-500 transition-colors cursor-pointer"
            >
              Contact Us
            </button>
            <span>&bull;</span>
            <button
              onClick={() => {
                setActiveView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-amber-500 transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>

      {/* PRE-ORDER CART SLIDE-OVER SIDEBAR */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
            />

            {/* Slide drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-neutral-200 dark:border-neutral-800"
            >
              
              {/* Cart Header */}
              <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <div className="flex items-center gap-2 font-sans font-extrabold text-base text-neutral-950 dark:text-white">
                  <ShoppingBag size={18} className="text-amber-500" />
                  <span>My Pre-Orders list ({cartCount})</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  id="close-cart-btn"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Cart Body list */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-neutral-400 space-y-3">
                    <ShoppingBag size={48} className="mx-auto text-neutral-200 dark:text-neutral-800" />
                    <p className="text-xs font-semibold">You have no active pre-orders logged.</p>
                    <p className="text-[10px] opacity-80 max-w-[200px] mx-auto">
                      Browse our premium menu and tap pre-order to reserve your portion!
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                    {cart.map((item) => (
                      <div key={item.foodItem.id} className="py-4 flex gap-3.5">
                        <img
                          src={item.foodItem.image}
                          alt={item.foodItem.name}
                          className="w-14 h-14 rounded-xl object-cover bg-neutral-100 dark:bg-neutral-800"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {item.foodItem.name}
                          </h4>
                          <p className="text-xs font-semibold text-amber-500 font-mono">
                            {formatNaira(item.foodItem.price)} each
                          </p>
                          
                          {/* Quantity Counter for slide-over */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200/50 dark:border-neutral-700/20 text-xs font-semibold">
                              <button
                                onClick={() => handleUpdateQuantity(item.foodItem.id, item.quantity - 1)}
                                className="px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3.5 font-mono text-xs">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.foodItem.id, item.quantity + 1)}
                                className="px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveFromCart(item.foodItem.id)}
                              className="p-1 rounded text-neutral-400 hover:text-red-500 cursor-pointer"
                              title="Remove item"
                              id={`remove-item-${item.foodItem.id}`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 space-y-4 bg-neutral-50 dark:bg-neutral-950/40">
                  <div className="flex justify-between items-center font-bold text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Total Pre-order cost</span>
                    <span className="text-lg font-mono text-amber-600 dark:text-amber-400">
                      {formatNaira(cartTotal)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setIsCheckoutOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-lg shadow-amber-500/10 cursor-pointer transition-colors"
                      id="cart-checkout-btn"
                    >
                      <span>Verify Details & Checkout</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      onClick={handleClearCart}
                      className="w-full py-2.5 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800/60 rounded-xl text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                      id="cart-clear-btn"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STEPPED CHECKOUT MODAL WINDOW */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            adminSettings={adminSettings}
            onSubmitOrder={handleSubmitOrder}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      {/* USER PORTAL & ORDER TRACKER SIDEBAR */}
      <AnimatePresence>
        {isUserPortalOpen && (
          <UserPortal
            isOpen={isUserPortalOpen}
            onClose={() => setIsUserPortalOpen(false)}
            usersList={usersList}
            currentUser={currentUser}
            orders={orders}
            onLogin={handleUserLogin}
            onRegister={handleUserRegister}
            onLogout={handleUserLogout}
            formatNaira={formatNaira}
          />
        )}
      </AnimatePresence>

      {/* BACKGROUND MUSIC PLAYER */}
      <BackgroundMusic
        enabled={!!adminSettings.musicEnabled}
        volume={adminSettings.musicVolume ?? 0.15}
      />

    </div>
  );
}
