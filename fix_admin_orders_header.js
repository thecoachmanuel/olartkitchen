import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const orderHeaderOld = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Customer Pre-Orders Ledger ({orders.length})
              </h2>
            </div>`;

const orderHeaderNew = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Customer Pre-Orders Ledger ({orders.length})
              </h2>
              {orders.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all order history? This cannot be undone.')) {
                      onClearOrders?.();
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 text-xs font-bold transition-colors cursor-pointer shadow-sm border border-red-200 dark:border-red-900/50"
                >
                  Clear History
                </button>
              )}
            </div>`;

content = content.replace(orderHeaderOld, orderHeaderNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
