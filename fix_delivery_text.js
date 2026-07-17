import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldBlock = `                  {/* Delivery Transparency Indicator */}
                  <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 text-[10px] text-neutral-500 leading-relaxed flex items-center gap-2">
                    <Truck size={14} className="text-amber-500 shrink-0 animate-bounce" />
                    <span>Active Delivery Partners active in Lekki, Victoria Island, Ikoyi, Ikeja & surroundings! Standard self-pickup at Admirality Way is completely free.</span>
                  </div>`;

content = content.replace(oldBlock, '');
fs.writeFileSync('src/App.tsx', content);
