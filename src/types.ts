/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  closeTime: string; // ISO String of the countdown close date/time
  maxPreOrders: number;
  currentPreOrders: number;
  category: string;
  available: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  notes?: string;
  addons?: { id: string; name: string; price: number }[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery';
  deliveryAddress?: string;
  items: {
    foodItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    addons?: { id: string; name: string; price: number }[];
  }[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'preparing' | 'confirmed' | 'cancelled';
  createdAt: string;
  paymentReference: string;
}

export interface AdminSettings {
  whatsappNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  musicEnabled?: boolean;
  musicVolume?: number;
  logoName?: string;
  logoEmoji?: string;
  logoImage?: string;
  footerPlatformName?: string;
  footerCopyright?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactHours?: string;
  contactDescription?: string;
  promoMinAmount?: number;
  promoRewardName?: string;
}

export interface User {
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  password?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'order_status' | 'system' | 'reminder' | 'deal';
  orderId?: string;
}


