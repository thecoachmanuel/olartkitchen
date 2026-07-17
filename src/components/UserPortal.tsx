/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, Phone, Lock, ClipboardCheck, CreditCard, Clock, 
  CheckCircle2, AlertCircle, ShoppingBag, LogOut, ArrowRight, MessageSquare,
  Utensils, Eye, EyeOff, MapPin, Truck, ShieldCheck, Check, Activity, Map, Copy, Compass, FileText, Loader2
} from 'lucide-react';
import { Order, User as UserType, AdminSettings } from '../types';

interface UserPortalProps {
  isOpen: boolean;
  onClose: () => void;
  usersList: UserType[];
  currentUser: UserType | null;
  orders: Order[];
  onLogin: (email: string, password?: string) => boolean | string | Promise<boolean | string>;
  onRegister: (name: string, email: string, phone: string, password?: string) => boolean | string | Promise<boolean | string>;
  onLogout: () => void;
  formatNaira: (val: number) => string;
  adminSettings?: AdminSettings;
}

export default function UserPortal({
  isOpen,
  onClose,
  usersList,
  currentUser,
  orders,
  onLogin,
  onRegister,
  onLogout,
  formatNaira,
  adminSettings,
}: UserPortalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [orderTabs, setOrderTabs] = useState<Record<string, 'timeline' | 'checklist' | 'map'>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSimulatedTimestamp = (createdAtStr: string, offsetMinutes: number, isActive: boolean) => {
    if (!isActive) return '';
    try {
      const createdDate = new Date(createdAtStr);
      const targetDate = new Date(createdDate.getTime() + offsetMinutes * 60 * 1000);
      const now = new Date();
      // Keep it within the bounds of "now" so it doesn't leak into future
      const displayDate = targetDate > now ? now : targetDate;
      return displayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Clear errors when switching tabs
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [activeTab]);

  if (!isOpen) return null;

  // Filter orders matching the logged in user
  const userOrders = currentUser
    ? orders.filter(
        (o) => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const res = onLogin(email, password);
    if (typeof res === 'string') {
      setErrorMsg(res);
    } else {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !phone) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    const res = onRegister(name, email, phone, password);
    if (typeof res === 'string') {
      setErrorMsg(res);
    } else {
      setSuccessMsg('Account created and logged in!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    }
  };

  // Pre-fill fields for ease of demonstration if they select pre-order user
  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setActiveTab('signin');
  };

  const getWhatsAppTrackingLink = (order: Order) => {
    const text = `*ORDER TRACKING INQUIRY - OLART KITCHEN*%0A%0A` +
      `*Order ID:* ${order.id}%0A` +
      `*Customer:* ${order.customerName}%0A` +
      `*Current Status:* ${order.status.toUpperCase()}%0A` +
      `*Items:* ${order.items.map(it => `${it.name} (x${it.quantity})`).join(', ')}%0A` +
      `Please confirm the next steps of my pre-order fulfillment!`;
    return `https://wa.me/2349000000000?text=${text}`; // Prefilled WhatsApp API link
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/50 backdrop-blur-sm"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-neutral-200 dark:border-neutral-800"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-sans font-extrabold text-base text-neutral-950 dark:text-white">
            <User size={18} className="text-amber-500 animate-pulse" />
            <span>{currentUser ? 'My Account & Order Tracker' : 'Sign In or Sign Up'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <AnimatePresence mode="wait">
            {!currentUser ? (
              /* AUTHENTICATION VIEWS */
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Tabs */}
                <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1">
                  <button
                    onClick={() => setActiveTab('signin')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'signin'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setActiveTab('signup')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'signup'
                        ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {errorMsg && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={14} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {activeTab === 'signin' ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center p-1"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-white text-xs font-bold shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Sign In to Track Pre-Orders</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                ) : (
                  /* SIGN UP FORM */
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type="text"
                          required
                          placeholder="Adebayo Tinubu"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type="email"
                          required
                          placeholder="adebayo@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type="tel"
                          required
                          placeholder="0803 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          placeholder="Create password for future tracking"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center p-1"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all text-white text-xs font-bold shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Create Account & Register</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                )}


              </motion.div>
            ) : (
              /* LOGGED IN TRACKER VIEW */
              <motion.div
                key="tracker"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* User Info Header card */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200/50 dark:border-neutral-800/40 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">
                        {currentUser.name}
                      </h4>
                      <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 font-mono mt-0.5">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Log Out Account"
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                      My Pre-Order History & live fulfillment progress
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      {userOrders.length} {userOrders.length === 1 ? 'order' : 'orders'}
                    </span>
                  </div>

                  {userOrders.length === 0 ? (
                    <div className="text-center py-16 text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-3">
                      <ShoppingBag size={40} className="mx-auto text-neutral-300 dark:text-neutral-700" />
                      <p className="text-sm font-bold">No pre-orders found for this email.</p>
                      <p className="text-xs opacity-80 max-w-xs mx-auto px-4 leading-relaxed">
                        Any pre-order placed with <strong className="text-neutral-600 dark:text-neutral-400">{currentUser.email}</strong> will instantly reflect here for real-time tracking!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {userOrders.map((order) => {
                        const isPending = order.status === 'pending';
                        const isPaid = order.status === 'paid';
                        const isPreparing = order.status === 'preparing';
                        const isConfirmed = order.status === 'confirmed';
                        const isDelivered = order.status === 'delivered';
                        const isCancelled = order.status === 'cancelled';

                        // Calculate current steps
                        let currentStepIndex = 1; // Logged
                        if (isPaid) currentStepIndex = 2; 
                        if (isPreparing) currentStepIndex = 3; 
                        if (isConfirmed) currentStepIndex = 4; // Complete/Out for Delivery
                        if (isDelivered) currentStepIndex = 5; // Delivered
                        if (isCancelled) currentStepIndex = -1; // Cancelled

                        return (
                          <div 
                            key={order.id} 
                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-5 hover:border-amber-500/35 transition-colors"
                          >
                            {/* Order Header info */}
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
                                    {order.id}
                                  </span>
                                  <button
                                    onClick={() => handleCopyId(order.id)}
                                    className="p-1 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
                                    title="Copy Order ID"
                                  >
                                    {copiedId === order.id ? (
                                      <Check size={11} className="text-emerald-500" />
                                    ) : (
                                      <Copy size={11} />
                                    )}
                                  </button>
                                </div>
                                <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mt-2.5 flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-base font-black text-neutral-950 dark:text-white font-mono">
                                  {formatNaira(order.totalAmount)}
                                </p>
                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mt-1.5 font-sans ${
                                  isPending ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' :
                                  isPaid ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                                  isPreparing ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400' :
                                  isConfirmed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                                  isDelivered ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400' :
                                  'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                }`}>
                                  {order.status === 'pending' ? 'Pending Verification' :
                                   order.status === 'paid' ? 'Payment Verified' :
                                   order.status === 'preparing' ? 'In Kitchen' :
                                   order.status === 'confirmed' ? 'Fulfillment confirmed' :
                                   order.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                                </span>
                              </div>
                            </div>

                            {/* ROBUST LIVE FULFILLMENT TIMELINE & DETAILED LOG TABS */}
                            {!isCancelled ? (
                              <div className="space-y-4 pt-1">
                                {/* Tab selector */}
                                <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setOrderTabs(prev => ({ ...prev, [order.id]: 'timeline' }))}
                                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      (orderTabs[order.id] || 'timeline') === 'timeline'
                                        ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-sm border border-neutral-200/20'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                  >
                                    <Activity size={12} />
                                    <span>Quick Tracker</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setOrderTabs(prev => ({ ...prev, [order.id]: 'checklist' }))}
                                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      orderTabs[order.id] === 'checklist'
                                        ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-sm border border-neutral-200/20'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                  >
                                    <FileText size={12} />
                                    <span>Detailed Log</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setOrderTabs(prev => ({ ...prev, [order.id]: 'map' }))}
                                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                      orderTabs[order.id] === 'map'
                                        ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-sm border border-neutral-200/20'
                                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                                    }`}
                                  >
                                    <Compass size={12} />
                                    <span>Fulfillment Details</span>
                                  </button>
                                </div>

                                {/* TAB 1: QUICK TRACKER */}
                                {(orderTabs[order.id] || 'timeline') === 'timeline' && (
                                  <div className="space-y-4 pt-2">
                                    <div className="relative">
                                      {/* Line backdrop */}
                                      <div className="absolute top-3.5 left-3.5 right-3.5 h-[2px] bg-neutral-100 dark:bg-neutral-800" />
                                      {/* Progress highlight line */}
                                      <div 
                                        className="absolute top-3.5 left-3.5 h-[2px] bg-amber-500 transition-all duration-700"
                                        style={{
                                          width: isDelivered ? '100%' : isConfirmed ? '75%' : isPreparing ? '50%' : isPaid ? '25%' : '0%'
                                        }}
                                      />

                                      {/* Milestone Nodes */}
                                      <div className="relative flex justify-between">
                                        {/* Step 1: Order Placed */}
                                        <div className="flex flex-col items-center">
                                          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow border-2 border-white dark:border-neutral-900">
                                            <ClipboardCheck size={13} />
                                          </div>
                                          <span className="text-[9px] font-extrabold text-neutral-800 dark:text-neutral-200 mt-2">
                                            Order Placed
                                          </span>
                                        </div>

                                        {/* Step 2: Payment Confirmed */}
                                        <div className="flex flex-col items-center">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow ${
                                            isPaid || isPreparing || isConfirmed || isDelivered
                                              ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                              : isPending
                                              ? 'bg-amber-500 text-white border-white dark:border-neutral-900 animate-pulse'
                                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                          }`}>
                                            <CreditCard size={13} />
                                          </div>
                                          <span className={`text-[9px] font-extrabold mt-2 ${
                                            isPaid || isPreparing || isConfirmed || isDelivered
                                              ? 'text-neutral-800 dark:text-neutral-200'
                                              : isPending
                                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                                              : 'text-neutral-400 dark:text-neutral-500'
                                          }`}>
                                            Payment Verified
                                          </span>
                                        </div>

                                        {/* Step 3: In Kitchen */}
                                        <div className="flex flex-col items-center">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow ${
                                            isConfirmed || isDelivered
                                              ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                              : isPreparing
                                              ? 'bg-amber-500 text-white border-white dark:border-neutral-900 animate-pulse'
                                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                          }`}>
                                            <Utensils size={13} />
                                          </div>
                                          <span className={`text-[9px] font-extrabold mt-2 ${
                                            isConfirmed || isDelivered
                                              ? 'text-neutral-800 dark:text-neutral-200'
                                              : isPreparing
                                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                                              : 'text-neutral-400 dark:text-neutral-500'
                                          }`}>
                                            In Kitchen
                                          </span>
                                        </div>

                                        {/* Step 4: Ready for Pickup / Dispatched */}
                                        <div className="flex flex-col items-center">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow ${
                                            isDelivered
                                              ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                              : isConfirmed
                                              ? 'bg-amber-500 text-white border-white dark:border-neutral-900 animate-pulse'
                                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                          }`}>
                                            <CheckCircle2 size={13} />
                                          </div>
                                          <span className={`text-[9px] font-extrabold mt-2 ${
                                            isDelivered
                                              ? 'text-neutral-800 dark:text-neutral-200'
                                              : isConfirmed
                                              ? 'text-amber-600 dark:text-amber-400 font-bold'
                                              : 'text-neutral-400 dark:text-neutral-500'
                                          }`}>
                                            {order.deliveryMethod === 'delivery' ? 'Dispatched' : 'Ready'}
                                          </span>
                                        </div>

                                        {/* Step 5: Delivered */}
                                        <div className="flex flex-col items-center">
                                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow ${
                                            isDelivered
                                              ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                          }`}>
                                            <Check size={13} />
                                          </div>
                                          <span className={`text-[9px] font-extrabold mt-2 ${
                                            isDelivered
                                              ? 'text-emerald-600 dark:text-emerald-400 font-black'
                                              : 'text-neutral-400 dark:text-neutral-500'
                                          }`}>
                                            Delivered
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tracking Description Box */}
                                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-center gap-2">
                                      {isPending && (
                                        <>
                                          <Loader2 size={13} className="text-amber-500 shrink-0 animate-spin" />
                                          <span>Order placed! We are currently awaiting your bank transfer confirmation. Once verified, we will move your order to "Payment Verified".</span>
                                        </>
                                      )}
                                      {isPaid && (
                                        <>
                                          <Clock size={13} className="text-amber-500 shrink-0 animate-pulse" />
                                          <span>Payment Verified! Your order will be sent to the kitchen shortly to start preparing.</span>
                                        </>
                                      )}
                                      {isPreparing && (
                                        <>
                                          <Clock size={13} className="text-amber-500 shrink-0 animate-pulse" />
                                          <span>In Kitchen! Your pre-order is currently being prepared fresh by our expert culinary team.</span>
                                        </>
                                      )}
                                      {isConfirmed && (
                                        <>
                                          <Clock size={13} className="text-amber-500 shrink-0 animate-pulse" />
                                          <span>
                                            {order.deliveryMethod === 'delivery' 
                                              ? `Dispatched! Your hot Nigerian meal is on its way to your address: ${order.deliveryAddress || 'Delivery Address'}`
                                              : `Ready for Pickup! Come on down to ${adminSettings?.logoName || 'Olart Kitchen'} for instant collection. Safe travels!`
                                            }
                                          </span>
                                        </>
                                      )}
                                      {isDelivered && (
                                        <>
                                          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                          <span>
                                            Delivered! Your delicious order has been successfully delivered and received. Enjoy your authentic Nigerian meal! 🍳
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* TAB 2: DETAILED HISTORY LOGS */}
                                {orderTabs[order.id] === 'checklist' && (
                                  <div className="pt-2 space-y-4">
                                    <div className="relative border-l-2 border-neutral-100 dark:border-neutral-800 ml-3.5 pl-5 space-y-5">
                                      
                                      {/* Log 1: Order Placed */}
                                      <div className="relative">
                                        <div className="absolute -left-[29px] top-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900 flex items-center justify-center">
                                          <Check size={9} className="text-white" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">Order Placed & Registered</h5>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">Pre-order registered and assigned unique database slot.</p>
                                          </div>
                                          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold">
                                            {getSimulatedTimestamp(order.createdAt, 0, true)}
                                          </span>
                                        </div>
                                        <ul className="mt-1.5 space-y-1 text-[10px] text-neutral-500 dark:text-neutral-400 pl-2">
                                          <li className="flex items-center gap-1.5">
                                            <Check className="text-emerald-500 shrink-0" size={10} />
                                            <span>System ID generated successfully: <code className="text-[9px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono font-bold text-neutral-600 dark:text-neutral-300">{order.id}</code></span>
                                          </li>
                                          <li className="flex items-center gap-1.5">
                                            <Check className="text-emerald-500 shrink-0" size={10} />
                                            <span>Cart items reserved & locked in database</span>
                                          </li>
                                        </ul>
                                      </div>

                                      {/* Log 2: Payment Verified */}
                                      <div className="relative">
                                        <div className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
                                          isPaid || isPreparing || isConfirmed 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-amber-500 text-white animate-pulse'
                                        }`}>
                                          {isPaid || isPreparing || isConfirmed ? <Check size={9} /> : <Clock size={9} />}
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">
                                              {isPaid || isPreparing || isConfirmed ? 'Payment Settled' : 'Awaiting Payment Verification'}
                                            </h5>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                              Checking the ledger against transaction reference.
                                            </p>
                                          </div>
                                          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold">
                                            {getSimulatedTimestamp(order.createdAt, 5, isPaid || isPreparing || isConfirmed)}
                                          </span>
                                        </div>
                                        <ul className="mt-1.5 space-y-1 text-[10px] text-neutral-500 dark:text-neutral-400 pl-2">
                                          <li className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid || isPreparing || isConfirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                                            <span>Reference: <code className="text-[9px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono font-bold text-neutral-600 dark:text-neutral-300">{order.paymentReference || 'N/A'}</code></span>
                                          </li>
                                          <li className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid || isPreparing || isConfirmed ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                            <span>Admin ledger sign-off logged</span>
                                          </li>
                                        </ul>
                                      </div>

                                      {/* Log 3: Kitchen preparation */}
                                      <div className="relative">
                                        <div className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
                                          isConfirmed 
                                            ? 'bg-emerald-500 text-white' 
                                            : isPreparing 
                                            ? 'bg-amber-500 text-white animate-pulse'
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                                        }`}>
                                          {isConfirmed ? <Check size={9} /> : isPreparing ? <Utensils size={9} /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />}
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">
                                              {isConfirmed ? 'Kitchen Complete' : isPreparing ? 'Culinary Prep In-Progress' : 'Queued for Chef Allocation'}
                                            </h5>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                              Meals are prepared fresh and insulated.
                                            </p>
                                          </div>
                                          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold">
                                            {getSimulatedTimestamp(order.createdAt, 14, isPreparing || isConfirmed)}
                                          </span>
                                        </div>
                                        <ul className="mt-1.5 space-y-1 text-[10px] text-neutral-500 dark:text-neutral-400 pl-2">
                                          <li className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isPreparing || isConfirmed ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
                                            <span>Chef team assigned & fresh ingredients sourced</span>
                                          </li>
                                          <li className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed ? 'bg-emerald-500' : isPreparing ? 'bg-amber-500 animate-pulse' : 'bg-neutral-300'}`} />
                                            <span>Foil sealing & temperature insulation check</span>
                                          </li>
                                        </ul>
                                      </div>

                                      {/* Log 4: Fulfillment confirmed */}
                                      <div className="relative">
                                        <div className={`absolute -left-[29px] top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 flex items-center justify-center ${
                                          isConfirmed 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                                        }`}>
                                          {isConfirmed ? <CheckCircle2 size={9} /> : <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />}
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h5 className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">
                                              {order.deliveryMethod === 'delivery' 
                                                ? isConfirmed ? 'Dispatched via Courier' : 'Awaiting Dispatch Handover'
                                                : isConfirmed ? 'Ready on Collection Desk' : 'Awaiting Collection Desk Handover'
                                              }
                                            </h5>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                                              {order.deliveryMethod === 'delivery' 
                                                ? 'Shipped for maximum freshness.'
                                                : 'Claim code required for collection.'
                                              }
                                            </p>
                                          </div>
                                          <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 font-bold">
                                            {getSimulatedTimestamp(order.createdAt, 28, isConfirmed)}
                                          </span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                )}

                                {/* TAB 3: FULFILLMENT DETAILS */}
                                {orderTabs[order.id] === 'map' && (
                                  <div className="pt-2 space-y-3">
                                    {order.deliveryMethod === 'delivery' ? (
                                      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-800/40 space-y-4">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <Truck size={18} />
                                          </div>
                                          <div>
                                            <h5 className="text-xs font-black text-neutral-900 dark:text-white">{(adminSettings?.logoName || 'Olart').split(' ')[0]} Dispatch Service</h5>
                                            <p className="text-[10px] text-neutral-500">Premium door-to-door delivery</p>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-[11px] border-t border-b border-neutral-200/30 dark:border-neutral-800/30 py-3 font-mono">
                                          <div>
                                            <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">RIDER PARTNER</span>
                                            <span className="font-extrabold text-neutral-700 dark:text-neutral-300">Chinedu Alao</span>
                                          </div>
                                          <div>
                                            <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">DISPATCH VEHICLE</span>
                                            <span className="font-extrabold text-neutral-700 dark:text-neutral-300">TVS King (LAG-482-IKY)</span>
                                          </div>
                                          <div>
                                            <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">HOTLINE</span>
                                            <span className="font-extrabold text-neutral-700 dark:text-neutral-300">{adminSettings?.whatsappNumber || '+234 816 888 2014'}</span>
                                          </div>
                                          <div>
                                            <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">EST. DELIVERY TIME</span>
                                            <span className="font-extrabold text-amber-600 dark:text-amber-400">30-45 mins</span>
                                          </div>
                                        </div>

                                        {/* Animated Radar/Map Mock */}
                                        <div className="relative h-24 rounded-xl bg-neutral-100 dark:bg-neutral-900 overflow-hidden flex items-center justify-center border border-neutral-200/30 dark:border-neutral-800/30">
                                          {/* Pulse rings */}
                                          <div className="absolute w-12 h-12 bg-amber-500/15 dark:bg-amber-400/15 rounded-full animate-ping" />
                                          <div className="absolute w-24 h-24 bg-amber-500/5 dark:bg-amber-400/5 rounded-full animate-pulse" />
                                          <div className="absolute inset-0 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:12px_12px]" />
                                          
                                          {/* Marker pins */}
                                          <div className="relative z-10 flex items-center gap-12">
                                            <div className="flex flex-col items-center">
                                              <span className="text-[8px] font-extrabold bg-neutral-900 text-white px-1 py-0.5 rounded shadow mb-1">Kitchen</span>
                                              <div className="p-1.5 rounded-full bg-amber-500 text-white shadow">
                                                <Utensils size={10} />
                                              </div>
                                            </div>
                                            
                                            {/* Dotted path line */}
                                            <div className="w-16 border-t-2 border-dashed border-amber-500/40 relative">
                                              <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                                            </div>

                                            <div className="flex flex-col items-center">
                                              <span className="text-[8px] font-extrabold bg-emerald-600 text-white px-1 py-0.5 rounded shadow mb-1">You</span>
                                              <div className="p-1.5 rounded-full bg-emerald-500 text-white shadow">
                                                <MapPin size={10} />
                                              </div>
                                            </div>
                                          </div>

                                          <div className="absolute bottom-1 right-2 text-[8px] text-neutral-400 font-mono flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                            <span>Tracking Live</span>
                                          </div>
                                        </div>

                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed italic text-center">
                                          "Your meal is sealed in thermodynamic foil and packed in insulated pouches to ensure it lands at your doorstep piping hot!"
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200/40 dark:border-neutral-800/40 space-y-4">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            <MapPin size={18} />
                                          </div>
                                          <div>
                                            <h5 className="text-xs font-black text-neutral-900 dark:text-white">{adminSettings?.logoName || 'Olart Kitchen'} Collection Point</h5>
                                            <p className="text-[10px] text-neutral-500">Pick up your order straight from the source</p>
                                          </div>
                                        </div>

                                        <div className="text-[11px] border-t border-b border-neutral-200/30 dark:border-neutral-800/30 py-3 space-y-2.5 font-sans">
                                          <div>
                                            <span className="text-neutral-400 dark:text-neutral-500 text-[10px] block font-mono">ADDRESS</span>
                                            <span className="font-extrabold text-neutral-700 dark:text-neutral-300">
                                              Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria
                                            </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 font-mono">
                                            <div>
                                              <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">PICKUP DESK</span>
                                              <span className="font-extrabold text-neutral-700 dark:text-neutral-300">Desk 3 (Pre-Orders)</span>
                                            </div>
                                            <div>
                                              <span className="text-neutral-400 dark:text-neutral-500 font-sans block text-[10px]">COLLECTION CODE</span>
                                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{order.paymentReference?.substring(0, 8) || 'N/A'}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <a
                                          href="https://maps.google.com/?q=Plot+14,+Admiralty+Way,+Lekki+Phase+1,+Lagos"
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center justify-center gap-2 w-full py-2 bg-white hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                                        >
                                          <Map size={13} />
                                          <span>Open on Google Maps</span>
                                        </a>

                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed text-center">
                                          Provide your <strong>Collection Code</strong> or <strong>Payment Reference</strong> to the desk attendant for instant collection. Safe travels!
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-900/30 rounded-xl text-red-700 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle size={14} />
                                <span>This order has been cancelled by the kitchen admins. Any deposits will be processed for refund.</span>
                              </div>
                            )}

                            {/* Order Details Accordion/Summary */}
                            <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3 text-xs space-y-2">
                              <div className="flex justify-between font-extrabold text-xs uppercase text-neutral-400 tracking-wider">
                                <span>Items Ordered</span>
                                <span>Qty</span>
                              </div>
                              <div className="space-y-2">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex flex-col gap-0.5">
                                    <div className="flex justify-between text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
                                      <span className="truncate">{it.name}</span>
                                      <span className="font-mono">{it.quantity}</span>
                                    </div>
                                    {it.addons && it.addons.length > 0 && (
                                      <div className="text-[11px] text-neutral-500 italic">
                                        + {it.addons.map(a => a.name).join(', ')}
                                      </div>
                                    )}
                                    {it.notes && (
                                      <div className="text-[11px] text-amber-600 dark:text-amber-500 font-medium line-clamp-2">
                                        Note: {it.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <div className="pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                                <div>
                                  <span className="font-bold">Fulfillment:</span> <span className="capitalize font-semibold">{order.deliveryMethod}</span>
                                  {order.deliveryAddress && (
                                    <p className="text-xs mt-1 text-neutral-400 truncate max-w-xs">{order.deliveryAddress}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <a
                                    href={getWhatsAppTrackingLink(order)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition-all active:scale-95"
                                  >
                                    <MessageSquare size={13} />
                                    <span>Verify on WhatsApp</span>
                                  </a>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
