/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, Phone, Lock, ClipboardCheck, CreditCard, Clock, 
  CheckCircle2, AlertCircle, ShoppingBag, LogOut, ArrowRight, MessageSquare,
  Utensils, Eye, EyeOff
} from 'lucide-react';
import { Order, User as UserType } from '../types';

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
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
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
                        const isCancelled = order.status === 'cancelled';

                        // Calculate current steps
                        let currentStepIndex = 1; // Logged
                        if (isPaid) currentStepIndex = 2; 
                        if (isPreparing) currentStepIndex = 3; 
                        if (isConfirmed) currentStepIndex = 4; // Complete/Out for Delivery
                        if (isCancelled) currentStepIndex = -1; // Cancelled

                        return (
                          <div 
                            key={order.id} 
                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-5 hover:border-amber-500/35 transition-colors"
                          >
                            {/* Order Header info */}
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/10 px-2.5 py-1 rounded-lg">
                                  {order.id}
                                </span>
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
                                  'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400'
                                }`}>
                                  {order.status === 'pending' ? 'Pending Verification' :
                                   order.status === 'paid' ? 'Payment Verified' :
                                   order.status === 'preparing' ? 'In Kitchen' :
                                   order.status === 'confirmed' ? 'Fulfillment confirmed' : 'Cancelled'}
                                </span>
                              </div>
                            </div>

                            {/* ROBUST LIVE FULFILLMENT TIMELINE */}
                            {!isCancelled ? (
                              <div className="pt-2">
                                <div className="relative">
                                  {/* Line backdrop */}
                                  <div className="absolute top-3.5 left-3.5 right-3.5 h-[2px] bg-neutral-100 dark:bg-neutral-800" />
                                  {/* Progress highlight line */}
                                  <div 
                                    className="absolute top-3.5 left-3.5 h-[2px] bg-amber-500 transition-all duration-700"
                                    style={{
                                      width: isConfirmed ? '100%' : isPreparing ? '66%' : isPaid ? '33%' : '0%'
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
                                        isPaid || isPreparing || isConfirmed
                                          ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                          : isPending
                                          ? 'bg-amber-500 text-white border-white dark:border-neutral-900 animate-pulse'
                                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                      }`}>
                                        <CreditCard size={13} />
                                      </div>
                                      <span className={`text-[9px] font-extrabold mt-2 ${
                                        isPaid || isPreparing || isConfirmed
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
                                        isConfirmed
                                          ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                          : isPreparing
                                          ? 'bg-amber-500 text-white border-white dark:border-neutral-900 animate-pulse'
                                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                      }`}>
                                        <Utensils size={13} />
                                      </div>
                                      <span className={`text-[9px] font-extrabold mt-2 ${
                                        isConfirmed
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
                                        isConfirmed
                                          ? 'bg-emerald-500 text-white border-white dark:border-neutral-900'
                                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border-neutral-200 dark:border-neutral-800'
                                      }`}>
                                        <CheckCircle2 size={13} />
                                      </div>
                                      <span className={`text-[9px] font-extrabold mt-2 ${
                                        isConfirmed
                                          ? 'text-emerald-600 dark:text-emerald-400 font-black'
                                          : 'text-neutral-400 dark:text-neutral-500'
                                      }`}>
                                        {order.deliveryMethod === 'delivery' ? 'Dispatched' : 'Ready for Pickup'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Tracking Description Box */}
                                <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl border border-neutral-200/50 dark:border-neutral-800/40 text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-center gap-2">
                                  {isPending && (
                                    <>
                                      <Clock size={13} className="text-amber-500 shrink-0 animate-spin" />
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
                                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                      <span>
                                        {order.deliveryMethod === 'delivery' 
                                          ? `Dispatched! Your hot Nigerian meal is on its way to your address: ${order.deliveryAddress || 'Delivery Address'}`
                                          : "Ready for Pickup! Come on down to Olart Kitchen for instant collection. Safe travels!"
                                        }
                                      </span>
                                    </>
                                  )}
                                </div>
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
                              <div className="space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="flex justify-between text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
                                    <span className="truncate">{it.name}</span>
                                    <span className="font-mono">{it.quantity}</span>
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
