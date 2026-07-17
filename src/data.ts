/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FoodItem, AdminSettings, Order } from './types';

// Helper to get dynamic ISO date relative to current time
const getFutureTime = (hours: number, minutes: number = 0): string => {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
};

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Signature Seafood Okro & Soft Poundo',
    description: 'Better-life fresh seafood okro slow-simmered in pure palm oil, loaded with direct-from-sea jumbo prawns, crab claws, clean snails, and fresh croaker fish. Served with fluffy soft poundo.',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(3, 45), // Closes in 3h 45m
    maxPreOrders: 30,
    currentPreOrders: 18,
    category: 'Swallow & Soups',
    available: true,
  },
  {
    id: 'food-2',
    name: 'Olart Firewood Smoky Jollof Platter',
    description: 'Genuine party firewood smoky Jollof rice cooked to perfection with local spices. Served with giant peppered turkey, sweet fried dodo, and luxury moin-moin.',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(8, 15), // Closes in 8h 15m
    maxPreOrders: 50,
    currentPreOrders: 32,
    category: 'Rice Platters',
    available: true,
  },
  {
    id: 'food-e1',
    name: 'Classic Ewa Aganyin & Soft Bread Platter',
    description: 'Authentic, slow-cooked honey beans mashed to perfection and topped with the legendary smoky, spicy Aganyin palm oil sauce. Served with sweet fried dodo and soft bread.',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(4, 30), // Closes in 4h 30m
    maxPreOrders: 25,
    currentPreOrders: 12,
    category: 'Ewa Aganyin & Beans',
    available: true,
  },
  {
    id: 'food-3',
    name: 'Suya-Glazed Giant Tiger Prawns',
    description: 'Giant tiger prawns marinated in authentic Kano-style suya spices and grilled over red-hot charcoal. Served with spicy dodo, fried yam chips, and hot house pepper sauce.',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1559715745-e1b34a256f3f?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(1, 15), // Closes in 1h 15m (Urgent!)
    maxPreOrders: 15,
    currentPreOrders: 11,
    category: 'Grills & Suya',
    available: true,
  },
  {
    id: 'food-4',
    name: 'Asun Spicy Peppered Goat Meat',
    description: 'Smoked goat meat cutlets sautéed with spicy habanero peppers, sweet bell peppers, onions, and local native spices. Served with crispy golden fried yam.',
    price: 15500,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(14, 30), // Closes in 14h 30m
    maxPreOrders: 20,
    currentPreOrders: 7,
    category: 'Grills & Suya',
    available: true,
  },
  {
    id: 'food-5',
    name: 'Special Efo Riro & Soft Amala',
    description: 'Rich leafy spinach soup prepared with locust beans (iru), smoked fish, stockfish, shaki, ponmo, and beef. Paired perfectly with hot fluffy amala.',
    price: 14500,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(26, 0), // Closes tomorrow
    maxPreOrders: 10,
    currentPreOrders: 4,
    category: 'Swallow & Soups',
    available: true,
  },
  {
    id: 'food-6',
    name: 'Correct Small Chops & Peppered Puff-Puff',
    description: 'Freshly fried golden puff-puff, crispy beef samosas, spicy spring rolls, and peppered gizzard. Perfect for flexing and sweet cravings.',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=800',
    closeTime: getFutureTime(5, 20), // Closes in 5h 20m
    maxPreOrders: 25,
    currentPreOrders: 19,
    category: 'Chops & Sweet Things',
    available: true,
  }
];

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  whatsappNumber: '+2348031234567',
  bankName: 'Access Bank',
  accountName: 'Olart Culinary Enterprise',
  accountNumber: '0123456789',
  musicEnabled: false,
  musicVolume: 0.15,
  logoName: 'OlartKitchen',
  logoEmoji: '🍲',
  logoImage: '',
  footerPlatformName: 'Olart Kitchen Pre-Order Platform',
  footerCopyright: '© 2026 Olart Culinary Enterprise. Lagos, Nigeria. All rights reserved.',
  contactEmail: 'info@olartkitchen.com',
  contactPhone: '+2348168882014',
  contactAddress: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  contactHours: 'Monday - Saturday: 9:00 AM - 9:00 PM, Sunday: 12:00 PM - 8:00 PM',
  contactDescription: 'Have questions about our premium Nigerian dishes, custom event catering, or pre-order deliveries? Reach out to our culinary experts!'
};

export const FOOD_CATEGORIES = ['All', 'Rice Platters', 'Swallow & Soups', 'Ewa Aganyin & Beans', 'Grills & Suya', 'Chops & Sweet Things'];

export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-101',
    customerName: 'Adewale Olaitan',
    customerEmail: 'manueloliver2908@gmail.com',
    customerPhone: '08031234567',
    deliveryMethod: 'delivery',
    deliveryAddress: '12, Joel Ogunnaike Street, Ikeja GRA, Lagos',
    items: [
      { foodItemId: 'food-2', name: 'Olart Firewood Smoky Jollof Platter', price: 12500, quantity: 2 },
      { foodItemId: 'food-6', name: 'Correct Small Chops & Peppered Puff-Puff', price: 8500, quantity: 1 }
    ],
    totalAmount: 33500,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: 'REF-39182390'
  },
  {
    id: 'ord-102',
    customerName: 'Chioma Nwachukwu',
    customerEmail: 'chioma@example.com',
    customerPhone: '08123456789',
    deliveryMethod: 'pickup',
    items: [
      { foodItemId: 'food-1', name: 'Signature Seafood Okro & Soft Poundo', price: 18500, quantity: 1 }
    ],
    totalAmount: 18500,
    status: 'paid',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: 'REF-82930411'
  },
  {
    id: 'ord-103',
    customerName: 'Babatunde Alao',
    customerEmail: 'alao.b@gmail.com',
    customerPhone: '09087654321',
    deliveryMethod: 'delivery',
    deliveryAddress: 'Penthouse B, Oceanview Towers, Victoria Island, Lagos',
    items: [
      { foodItemId: 'food-3', name: 'Suya-Glazed Giant Tiger Prawns', price: 22000, quantity: 2 },
      { foodItemId: 'food-4', name: 'Asun Spicy Peppered Goat Meat', price: 15500, quantity: 1 }
    ],
    totalAmount: 59500,
    status: 'confirmed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    paymentReference: 'REF-90231844'
  },
  {
    id: 'ord-104',
    customerName: 'Fatima Bello',
    customerEmail: 'fatima@yahoo.com',
    customerPhone: '07011223344',
    deliveryMethod: 'pickup',
    items: [
      { foodItemId: 'food-e1', name: 'Classic Ewa Aganyin & Soft Bread Platter', price: 9500, quantity: 1 }
    ],
    totalAmount: 9500,
    status: 'pending',
    createdAt: new Date().toISOString(),
    paymentReference: 'REF-28491032'
  }
];

