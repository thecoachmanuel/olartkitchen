/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ClipboardCheck, ArrowRight, ArrowLeft, Send, Check, CreditCard, User, ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { CartItem, AdminSettings, Order, User as UserType } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  adminSettings: AdminSettings;
  onSubmitOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress?: string;
    password?: string;
  }) => Order;
  currentUser?: UserType | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  adminSettings,
  onSubmitOrder,
  currentUser,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);

  // Format currency
  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(adminSettings.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!name || !email || !phone) {
        return;
      }
      if (deliveryMethod === 'delivery' && !address) {
        return;
      }
      setStep(2);
    }
  };

  const handleConfirmPayment = () => {
    setLoading(true);
    // Simulate payment submission processing
    setTimeout(() => {
      const order = onSubmitOrder({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? address : undefined,
        password: !currentUser && password ? password : undefined,
      });
      setCreatedOrder(order);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  const getWhatsAppLink = () => {
    if (!createdOrder) return '#';
    
    // Clean WhatsApp number
    let cleanNumber = adminSettings.whatsappNumber.replace(/[^0-9+]/g, '');
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '234' + cleanNumber.substring(1);
    } else if (cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.substring(1);
    }

    const itemsSummary = createdOrder.items
      .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
      .join('\n');

    const text = `*NEW PRE-ORDER - OLART KITCHEN*%0A%0A` +
      `*Order ID:* ${createdOrder.id}%0A` +
      `*Customer:* ${createdOrder.customerName}%0A` +
      `*Phone:* ${createdOrder.customerPhone}%0A` +
      `*Delivery Method:* ${createdOrder.deliveryMethod.toUpperCase()}%0A` +
      (createdOrder.deliveryAddress ? `*Address:* ${createdOrder.deliveryAddress}%0A` : '') +
      `%0A*ITEMS ORDERED:*%0A${itemsSummary}%0A%0A` +
      `*TOTAL AMOUNT:* ${formatNaira(createdOrder.totalAmount)}%0A%0A` +
      `*Payment Ref:* ${createdOrder.paymentReference}%0A%0A` +
      `_I have attached my payment receipt below. Please confirm receipt of my bank transfer so my pre-order countdown remains guaranteed!_`;

    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-950/60 backdrop-blur-md"
    >
      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        id="checkout-modal-container"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-amber-500" />
            <h2 className="font-sans font-bold text-lg text-neutral-900 dark:text-neutral-100">
              {step === 1 && 'Pre-Order Details'}
              {step === 2 && 'Secure Transfer Payment'}
              {step === 3 && 'Order Confirmed!'}
            </h2>
          </div>
          {step !== 3 && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              id="close-checkout-modal"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Stepper Indicators */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
            <span className={step >= 1 ? 'text-amber-500 font-bold' : ''}>1. Contact</span>
            <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1 mx-4" />
            <span className={step >= 2 ? 'text-amber-500 font-bold' : ''}>2. Payment</span>
            <span className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1 mx-4" />
            <span className={step >= 3 ? 'text-amber-500 font-bold' : ''}>3. Receipt</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Items Summary list */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800/60">
                <p className="text-sm font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
                  Order Summary
                </p>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-900 max-h-[120px] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.foodItem.id} className="py-2 flex justify-between items-center text-sm">
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                        {item.foodItem.name} <span className="text-xs text-neutral-400 font-semibold">x{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatNaira(item.foodItem.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-base text-neutral-950 dark:text-neutral-50">
                  <span>Grand Total</span>
                  <span>{formatNaira(totalAmount)}</span>
                </div>
              </div>

              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="checkout-name" className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Full Name <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      placeholder="e.g. Tunde Alao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="checkout-email" className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="e.g. tunde@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Phone & Delivery Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="checkout-phone" className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Phone Number (WhatsApp) <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    placeholder="e.g. 08031234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Pre-Order Fulfilment <span className="text-amber-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`rounded-xl text-sm font-bold border cursor-pointer flex items-center justify-center transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                    >
                      Self Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`rounded-xl text-sm font-bold border cursor-pointer flex items-center justify-center transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                      }`}
                    >
                      Home Delivery
                    </button>
                  </div>
                </div>
              </div>

              {/* Conditionally Show Delivery Address */}
              {deliveryMethod === 'delivery' && (
                <div className="space-y-1">
                  <label htmlFor="checkout-address" className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    Delivery Address <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    id="checkout-address"
                    required
                    rows={2}
                    placeholder="Provide full street address, estate, city..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>
              )}

              {/* Optional Password for account creation and pre-order tracking */}
              {!currentUser && (
                <div className="space-y-1.5 p-3.5 rounded-xl bg-amber-50/50 dark:bg-neutral-950/40 border border-amber-200/20 dark:border-neutral-800/60">
                  <label htmlFor="checkout-password" className="text-sm font-bold text-neutral-800 dark:text-neutral-200 flex justify-between items-center">
                    <span>Create Password <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md ml-1">Optional Account Creation</span></span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="checkout-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password to create an account for live pre-order tracking"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer flex items-center justify-center p-1"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-1">
                    Entering a password will automatically save your customer profile (Name, Email, Phone) so you can track your live Nigerian feast fulfillment in real-time.
                  </p>
                </div>
              )}

              {/* CTA Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white cursor-pointer shadow-lg shadow-amber-500/10 transition-all duration-200"
                  id="checkout-next-btn"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
               {/* Payment Instructions Header */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                <CreditCard size={18} className="shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-bold">Direct Bank Transfer Pre-order Guarantee</p>
                  <p className="opacity-90 leading-relaxed">
                    To finalize and reserve your food items before the live timers run out, please transfer the exact grand total to the designated account below. Please save your transfer receipt screenshot to send via WhatsApp.
                  </p>
                </div>
              </div>

              {/* Total Amount to Pay */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-center">
                <p className="text-sm text-neutral-400 dark:text-neutral-500 font-bold uppercase tracking-wider">
                  Amount Due
                </p>
                <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                  {formatNaira(totalAmount)}
                </p>
              </div>

              {/* Bank Details Display */}
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-sm pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Bank Name</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{adminSettings.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-500 dark:text-neutral-400">Account Name</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{adminSettings.accountName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
                      {adminSettings.accountNumber}
                    </span>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
                      title="Copy Account Number"
                      id="btn-copy-account"
                    >
                      {copied ? <Check size={14} className="text-green-500" /> : <ClipboardCheck size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/3 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer text-neutral-600 dark:text-neutral-400 transition-colors"
                  id="btn-back-step-1"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-neutral-300 disabled:dark:bg-neutral-800 disabled:text-neutral-500 disabled:scale-100 text-white cursor-pointer shadow-lg shadow-amber-500/10 transition-all duration-200"
                  id="btn-confirm-payment"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Verifying...</span>
                    </span>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>I Have Transferred</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && createdOrder && (
            <div className="text-center py-6 space-y-5">
              {/* Success animation icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 animate-bounce">
                <Check size={32} />
              </div>

              <div className="space-y-1">
                <p className="font-bold text-xl text-neutral-900 dark:text-neutral-50">
                  Pre-order Logged!
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Order Ref: <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{createdOrder.id}</span>
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                  Payment Reference: <span className="font-mono">{createdOrder.paymentReference}</span>
                </p>
              </div>

              {/* Warning instructions to submit via WhatsApp */}
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 text-sm text-left leading-relaxed space-y-1">
                <p className="font-bold text-base">One Last Step Required!</p>
                <p>
                  To secure your placement on the pre-order register, please tap the WhatsApp confirmation button below. <strong>Please send a screenshot of your payment receipt</strong> in the chat alongside the pre-filled order details to finalize confirmation.
                </p>
              </div>

              {/* Send receipt via WhatsApp */}
              <div className="space-y-3">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-green-600 hover:bg-green-700 active:scale-95 text-white cursor-pointer shadow-lg shadow-green-500/10 transition-all duration-200"
                  id="whatsapp-confirm-btn"
                >
                  <Send size={16} />
                  <span>Send Confirmation to WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer transition-all"
                  id="btn-close-checkout-success"
                >
                  Return to Kitchen Platform
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
