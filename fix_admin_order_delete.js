import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const orderActionsOld = `<button
                                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer underline"
                                      >
                                        Revert to Prep
                                      </button>
                                    </div>
                                  )}
                                  
                                  {order.status === 'delivered' && (`;

const orderActionsNew = `<button
                                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                                        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer underline"
                                      >
                                        Revert to Prep
                                      </button>
                                    </div>
                                  )}
                                  
                                  {order.status === 'delivered' && (
                                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Delete this order?')) onDeleteOrder?.(order.id);
                                        }}
                                        className="px-2.5 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                                      >
                                        Delete Order 🗑️
                                      </button>
                                    </div>
                                  )}
                                  {order.status !== 'delivered' && (
                                    <div className="mt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3">
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Delete this order?')) onDeleteOrder?.(order.id);
                                        }}
                                        className="text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer underline"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}`;

content = content.replace(orderActionsOld, orderActionsNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
