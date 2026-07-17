import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const tabInsertOld = `{/* TAB 3: ORDERS LEDGER */}
        {activeTab === 'orders' && (`;

const tabInsertNew = `{/* TAB: USERS TRACKER */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                Registered Users Tracker ({usersList?.length || 0})
              </h2>
            </div>
            
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950/50 text-[10px] uppercase tracking-wider text-neutral-500 font-bold border-b border-neutral-200 dark:border-neutral-800">
                      <th className="p-4 w-1/3">User Details</th>
                      <th className="p-4 w-1/4">Contact Info</th>
                      <th className="p-4 w-1/4 text-right">Orders Count</th>
                      <th className="p-4 w-1/4 text-right">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {(!usersList || usersList.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-neutral-400 dark:text-neutral-500 text-sm font-medium">
                          No users registered yet.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((user: any, idx: number) => {
                        const userOrders = orders.filter(o => o.customerEmail?.toLowerCase() === user.email.toLowerCase() || o.customerPhone === user.phone);
                        return (
                          <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-all">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                                    {user.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <a href={\`mailto:\${user.email}\`} className="text-xs font-mono text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                  <Mail size={12} /> {user.email}
                                </a>
                                <a href={\`tel:\${user.phone}\`} className="text-xs font-mono text-neutral-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                                  <Phone size={12} /> {user.phone}
                                </a>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center justify-center px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md text-xs font-bold font-mono">
                                {userOrders.length}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                })}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS LEDGER */}
        {activeTab === 'orders' && (`;

content = content.replace(tabInsertOld, tabInsertNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
