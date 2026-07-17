/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Plus, Minus, Tag } from 'lucide-react';
import { FoodItem } from '../types';
import CountdownTimer from './CountdownTimer';

interface FoodCardProps {
  key?: string;
  item: FoodItem;
  cartQuantity: number;
  onAddToCart: (item: FoodItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function FoodCard({
  item,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}: FoodCardProps) {
  // Check if item timer is expired
  const isExpired = new Date(item.closeTime).getTime() <= Date.now();
  const isSoldOut = item.currentPreOrders >= item.maxPreOrders;
  const isAvailable = item.available && !isExpired && !isSoldOut;

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
    <div className="group relative flex flex-col h-full rounded-2xl bg-white/70 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/40 shadow-sm hover:shadow-xl dark:hover:shadow-neutral-950/50 backdrop-blur-md transition-all duration-300 overflow-hidden">
      
      {/* Category Tag */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-neutral-900/80 text-white backdrop-blur-md border border-white/10 shadow">
        <Tag size={12} />
        <span>{item.category}</span>
      </div>

      {/* Image Container with Hover Scale */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="eager"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent opacity-60" />
      </div>

      {/* Main Content Body */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* Name and Price */}
        <div className="space-y-1">
          <h3 className="font-sans font-bold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed line-clamp-2 min-h-[40px]">
            {item.description}
          </p>
        </div>

        {/* Live Timer */}
        <div className="p-3.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/50">
          <CountdownTimer
            closeTime={item.closeTime}
            maxPreOrders={item.maxPreOrders}
            currentPreOrders={item.currentPreOrders}
          />
        </div>

        {/* Footer & Actions */}
        <div className="flex items-center justify-between pt-2 mt-auto border-t border-neutral-100 dark:border-neutral-800/40">
          <div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 block font-bold uppercase tracking-wider">Price</span>
            <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {formatNaira(item.price)}
            </span>
          </div>

          <div className="min-w-[120px] flex justify-end">
            {!isAvailable ? (
              <button
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-neutral-200 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-600 border border-neutral-300/30 dark:border-neutral-700/20 cursor-not-allowed text-center"
              >
                {isSoldOut ? 'Sold Out' : isExpired ? 'Closed' : 'Unavailable'}
              </button>
            ) : cartQuantity > 0 ? (
              <div className="flex items-center justify-between w-full h-[40px] px-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <button
                  onClick={() => onUpdateQuantity(item.id, cartQuantity - 1)}
                  className="p-1.5 hover:bg-amber-500/20 active:scale-95 rounded-lg transition-all duration-150 cursor-pointer"
                  aria-label="Decrease Quantity"
                  id={`btn-dec-${item.id}`}
                >
                  <Minus size={14} />
                </button>
                <span className="font-mono text-sm px-1 font-bold" id={`qty-${item.id}`}>{cartQuantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.id, cartQuantity + 1)}
                  disabled={item.currentPreOrders + cartQuantity >= item.maxPreOrders}
                  className="p-1.5 hover:bg-amber-500/20 active:scale-95 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Increase Quantity"
                  id={`btn-inc-${item.id}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                className="w-full flex items-center justify-center gap-2 h-[40px] px-4 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer"
                id={`btn-add-${item.id}`}
              >
                <ShoppingBag size={14} />
                <span>Pre-Order</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
