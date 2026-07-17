import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Tag, Clock } from 'lucide-react';
import { FoodItem } from '../types';
import CountdownTimer from './CountdownTimer';

interface FoodDetailsModalProps {
  item: FoodItem;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (item: FoodItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function FoodDetailsModal({
  item,
  onClose,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}: FoodDetailsModalProps) {
  const isExpired = new Date(item.closeTime).getTime() <= Date.now();
  const isSoldOut = item.currentPreOrders >= item.maxPreOrders;
  const isAvailable = item.available && !isExpired && !isSoldOut;

  const formatNaira = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-neutral-900/40 hover:bg-neutral-900/60 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full h-64 sm:h-80 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-500 text-white shadow-lg">
              <Tag size={12} />
              <span>{item.category}</span>
            </div>
            {isSoldOut ? (
              <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-red-500 text-white shadow-lg">
                Sold Out
              </div>
            ) : isExpired ? (
              <div className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-neutral-600 text-white shadow-lg">
                Closed
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                {item.name}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-lg">
                {item.description}
              </p>
            </div>
            <div className="shrink-0 text-left md:text-right">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider mb-1">
                Price
              </p>
              <p className="text-3xl font-mono font-bold text-amber-600 dark:text-amber-400">
                {formatNaira(item.price)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-bold text-sm uppercase tracking-wider">
                <Clock size={16} />
                <span>Time Remaining</span>
              </div>
              <CountdownTimer
                closeTime={item.closeTime}
                maxPreOrders={item.maxPreOrders}
                currentPreOrders={item.currentPreOrders}
              />
            </div>
            
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Orders</span>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white">
                  {item.currentPreOrders} / {item.maxPreOrders}
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: \`\${Math.min(100, (item.currentPreOrders / item.maxPreOrders) * 100)}%\` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800">
            {!isAvailable ? (
              <button
                disabled
                className="w-full py-4 rounded-xl text-lg font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed text-center"
              >
                {isSoldOut ? 'Sold Out' : isExpired ? 'Pre-Order Closed' : 'Currently Unavailable'}
              </button>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center justify-between w-full h-14 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, cartQuantity - 1); }}
                  className="p-3 hover:bg-amber-500/20 active:scale-95 rounded-lg transition-all duration-150 cursor-pointer"
                  aria-label="Decrease Quantity"
                >
                  <Minus size={20} />
                </button>
                <span className="font-mono text-xl px-4">{cartQuantity}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, cartQuantity + 1); }}
                  disabled={item.currentPreOrders + cartQuantity >= item.maxPreOrders}
                  className="p-3 hover:bg-amber-500/20 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase Quantity"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                className="w-full flex items-center justify-center gap-3 h-14 rounded-xl text-lg font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-xl shadow-amber-500/20 transition-all duration-200 cursor-pointer"
              >
                <ShoppingBag size={20} />
                <span>Add to Pre-Order</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
