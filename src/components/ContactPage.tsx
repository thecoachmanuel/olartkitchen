import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { AdminSettings } from '../types';

interface ContactPageProps {
  adminSettings: AdminSettings;
  setActiveView: (view: 'storefront' | 'admin' | 'contact') => void;
}

export default function ContactPage({ adminSettings, setActiveView }: ContactPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fallbacks
  const emailVal = adminSettings.contactEmail || 'info@olartkitchen.com';
  const phoneVal = adminSettings.contactPhone || '+2348168882014';
  const addressVal = adminSettings.contactAddress || 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria';
  const hoursVal = adminSettings.contactHours || 'Monday - Saturday: 9:00 AM - 9:00 PM, Sunday: 12:00 PM - 8:00 PM';
  const descVal = adminSettings.contactDescription || 'Have questions about our premium Nigerian dishes, custom event catering, or pre-order deliveries? Reach out to our culinary experts!';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create WhatsApp text
    const text = `Hi, my name is ${name}. 
Email: ${email}
Subject: ${subject}
Message: ${message}`;
    
    // Clean phone number (remove +, spaces, dashes)
    const cleanPhone = (adminSettings.whatsappNumber || phoneVal).replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    
    setIsSubmitted(true);
    
    // Open in new tab safely
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    
    // Reset form
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="space-y-10 py-6 max-w-5xl mx-auto" id="contact-page-container">
      
      {/* Dynamic Title / Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold tracking-widest text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
          Get In Touch
        </span>
        <h1 className="font-sans font-extrabold text-3xl sm:text-5xl text-neutral-950 dark:text-white tracking-tight leading-tight">
          We&apos;d Love to <span className="text-amber-500">Hear From You</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed">
          {descVal}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Contact Info Cards Grid (2/5 size) */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Phone Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-start gap-4 hover:border-amber-500/25 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Phone size={18} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Call or WhatsApp</p>
                <a 
                  href={`https://wa.me/${(adminSettings.whatsappNumber || phoneVal).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-neutral-950 dark:text-neutral-100 hover:text-amber-500 transition-colors block truncate"
                >
                  {phoneVal}
                </a>
                <p className="text-[10px] text-neutral-400">Tap to connect instantly via WhatsApp</p>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-start gap-4 hover:border-amber-500/25 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Mail size={18} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Email Address</p>
                <a 
                  href={`mailto:${emailVal}`}
                  className="text-sm font-bold text-neutral-950 dark:text-neutral-100 hover:text-amber-500 transition-colors block truncate"
                >
                  {emailVal}
                </a>
                <p className="text-[10px] text-neutral-400">Typically replies within 24 hours</p>
              </div>
            </div>

            {/* Address Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-start gap-4 hover:border-amber-500/25 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Our Headquarters</p>
                <p className="text-sm font-bold text-neutral-950 dark:text-neutral-100 leading-normal">
                  {addressVal}
                </p>
                <p className="text-[10px] text-neutral-400">Available for pre-order pickups</p>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex items-start gap-4 hover:border-amber-500/25 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Clock size={18} />
              </div>
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Kitchen Working Hours</p>
                <p className="text-sm font-bold text-neutral-950 dark:text-neutral-100 leading-relaxed whitespace-pre-line">
                  {hoursVal}
                </p>
              </div>
            </div>

          </div>

          {/* Quick link back to Menu */}
          <div className="pt-2 hidden md:block">
            <button
              onClick={() => setActiveView('storefront')}
              className="w-full py-3 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-amber-500 hover:bg-amber-500/5 text-xs font-extrabold text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all cursor-pointer"
            >
              &larr; Return to Feast Pre-Orders Menu
            </button>
          </div>
        </div>

        {/* Dynamic Contact Message Form (3/5 size) */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" />
              <span>Send Us a Message</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
              Fill out the details below and we&apos;ll automatically package your message to open directly on WhatsApp with our team!
            </p>

            <div className="space-y-1">
              <label htmlFor="contact-form-name" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Your Full Name
              </label>
              <input
                id="contact-form-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chinedu Okafor"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-form-email" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <input
                id="contact-form-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. chinedu@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-form-subject" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Subject
              </label>
              <input
                id="contact-form-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Event Catering Inquiry"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-form-message" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Message Description
              </label>
              <textarea
                id="contact-form-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your inquiry details in full..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans resize-none"
              />
            </div>

            {isSubmitted && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold animate-fade-in">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Opening message in WhatsApp... Done!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-5 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-md shadow-amber-500/10 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={14} />
              <span>Send Message to WhatsApp</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
