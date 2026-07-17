import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const funcs = `  const handleDeleteUser = (email: string) => {
    setUsersList(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    fetch(\`/api/users/\${encodeURIComponent(email)}\`, {
      method: 'DELETE'
    }).catch(console.error);
  };

  const handleUpdateUser = (email: string, data: any) => {
    setUsersList(prev => prev.map(u => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...data } : u)));
    const targetUser = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (targetUser) {
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...targetUser, ...data })
      }).catch(console.error);
    }
  };

  const handleUpdateSettings = (updatedSettings: AdminSettings) => {`;

content = content.replace("  const handleUpdateSettings = (updatedSettings: AdminSettings) => {", funcs);
fs.writeFileSync('src/App.tsx', content);
