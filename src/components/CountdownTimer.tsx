/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Timer, AlertTriangle, CheckCircle } from 'lucide-react';

interface CountdownTimerProps {
  closeTime: string;
  maxPreOrders: number;
  currentPreOrders: number;
  onTimeUp?: () => void;
}

export default function CountdownTimer({
  closeTime,
  maxPreOrders,
  currentPreOrders,
  onTimeUp,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Percentage of pre-orders filled
  const preOrderPercent = Math.min((currentPreOrders / maxPreOrders) * 100, 100);
  const isSoldOut = currentPreOrders >= maxPreOrders;

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(closeTime) - +new Date();
      
      if (difference <= 0) {
        if (!timeLeft.isExpired && onTimeUp) {
          onTimeUp();
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    };

    // Set initial
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [closeTime, onTimeUp]);

  if (isSoldOut) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20 backdrop-blur-md animate-pulse">
        <CheckCircle size={13} className="shrink-0" />
        <span>Pre-order Sold Out</span>
      </div>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20 backdrop-blur-md">
        <Timer size={13} className="shrink-0" />
        <span>Pre-order Closed</span>
      </div>
    );
  }

  // Determine if time is low (e.g. less than 2 hours total remaining)
  const totalHoursLeft = timeLeft.days * 24 + timeLeft.hours;
  const isUrgent = totalHoursLeft < 2;

  return (
    <div className="w-full space-y-2">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-1.5">
          {isUrgent ? (
            <span className="flex items-center gap-1 text-amber-500 animate-pulse font-semibold">
              <AlertTriangle size={13} />
              <span>Closing Soon!</span>
            </span>
          ) : (
            <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
              <Timer size={13} />
              <span>Pre-order Open</span>
            </span>
          )}
        </div>
        <span className="text-neutral-500 dark:text-neutral-400">
          {currentPreOrders}/{maxPreOrders} Claimed
        </span>
      </div>

      {/* Countdown Digits */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {timeLeft.days > 0 && (
          <div className="flex flex-col rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 p-1.5 border border-neutral-200/50 dark:border-neutral-700/30 backdrop-blur-sm">
            <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Days</span>
          </div>
        )}
        <div className={`flex flex-col rounded-lg p-1.5 border backdrop-blur-sm ${
          isUrgent 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse' 
            : 'bg-neutral-100/80 dark:bg-neutral-800/60 border-neutral-200/50 dark:border-neutral-700/30'
        }`}>
          <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Hrs</span>
        </div>
        <div className={`flex flex-col rounded-lg p-1.5 border backdrop-blur-sm ${
          isUrgent 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse' 
            : 'bg-neutral-100/80 dark:bg-neutral-800/60 border-neutral-200/50 dark:border-neutral-700/30'
        }`}>
          <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Mins</span>
        </div>
        <div className={`flex flex-col rounded-lg p-1.5 border backdrop-blur-sm ${
          isUrgent 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 animate-pulse' 
            : 'bg-neutral-100/80 dark:bg-neutral-800/60 border-neutral-200/50 dark:border-neutral-700/30'
        }`}>
          <span className="text-sm sm:text-base font-bold font-mono tracking-tight text-neutral-800 dark:text-neutral-100">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Secs</span>
        </div>
      </div>

      {/* Progress Bar of Slots Taken */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isUrgent ? 'bg-amber-500' : 'bg-emerald-500 dark:bg-emerald-400'
          }`}
          style={{ width: `${preOrderPercent}%` }}
        />
      </div>
    </div>
  );
}
