import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const descOld = `{activeTab === 'assistant' && 'Your AI Assistant powered by Gemini to help manage the kitchen.'}
            {activeTab === 'food' && 'Manage food item inventory, upload photos, change prices, and set available stocks.'}`;

const descNew = `{activeTab === 'assistant' && 'Your AI Assistant powered by Gemini to help manage the kitchen.'}
            {activeTab === 'users' && 'Track registered users, view contact information, and monitor order frequency.'}
            {activeTab === 'food' && 'Manage food item inventory, upload photos, change prices, and set available stocks.'}`;

content = content.replace(descOld, descNew);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
