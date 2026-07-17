import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Sparkles, User, AlertCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface AiAssistantProps {
  foodItems: any[];
  orders: any[];
  settings: any;
  categories: any[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function AiAssistant({ foodItems, orders, settings, categories }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Olart Kitchen AI Assistant. I can help you analyze orders, suggest new meal ideas, check your inventory, or draft marketing copy. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasFetchedProactive = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (hasFetchedProactive.current) return;
    // We only want to trigger the proactive insight once we have some data loaded
    if (foodItems.length === 0 && orders.length === 0) return;
    
    hasFetchedProactive.current = true;
    
    const fetchProactiveUpdate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: "Please generate a brief proactive update and 1-2 key insights for the admin based on the current kitchen data (e.g., top selling items, revenue, low stock, etc.). Start the message with something like 'Here is your kitchen update for today...'. Keep it concise and conversational, like a real personal assistant briefing their boss proactively.",
            context: {
              foodItemsCount: foodItems.length,
              ordersCount: orders.length,
              pendingOrdersCount: orders.filter(o => o.status === 'pending').length,
              totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
              categoriesCount: categories.length,
              foodItems: foodItems.map(f => ({ name: f.name, price: f.price, inStock: f.available, category: f.category, currentPreOrders: f.currentPreOrders })),
              allOrders: orders.map(o => ({ id: o.id, total: o.totalAmount, status: o.status, date: o.createdAt, items: o.items.map((i: any) => ({ name: i.name, quantity: i.quantity })) })),
              categories: categories.map(c => c.name),
              settings: {
                promoEnabled: settings?.promoEnabled,
                promoMinAmount: settings?.promoMinAmount,
                addons: settings?.addons
              }
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
        }
      } catch (err) {
        console.error("Proactive fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProactiveUpdate();
  }, [foodItems, orders, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            foodItemsCount: foodItems.length,
            ordersCount: orders.length,
            pendingOrdersCount: orders.filter(o => o.status === 'pending').length,
            totalRevenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
            categoriesCount: categories.length,
            foodItems: foodItems.map(f => ({ name: f.name, price: f.price, inStock: f.available, category: f.category, currentPreOrders: f.currentPreOrders })),
            allOrders: orders.map(o => ({ id: o.id, total: o.totalAmount, status: o.status, date: o.createdAt, items: o.items.map((i: any) => ({ name: i.name, quantity: i.quantity })) })),
            categories: categories.map(c => c.name),
            settings: {
              promoEnabled: settings?.promoEnabled,
              promoMinAmount: settings?.promoMinAmount,
              addons: settings?.addons
            }
          }
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to get response';
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${err.message || 'An error occurred while connecting to the AI.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[700px]">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2 rounded-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-50">AI Assistant</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Powered by Gemini</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-full">
          <Database className="w-4 h-4" />
          Connected to {foodItems.length} items & {orders.length} orders
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : msg.role === 'system'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : msg.role === 'system' ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-tr-none'
                : msg.role === 'system'
                ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-tl-none text-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-tl-none'
            }`}>
              <div className="prose dark:prose-invert prose-sm max-w-none">
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              <span className="text-sm text-neutral-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your kitchen..."
            disabled={isLoading}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-full pl-5 pr-12 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none dark:text-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center mt-3 text-xs text-neutral-400">
          AI Assistant can make mistakes. Consider verifying important metrics.
        </p>
      </div>
    </div>
  );
}
