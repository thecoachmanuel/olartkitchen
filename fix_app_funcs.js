import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const funcsNew = `  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    
    fetch(\`/api/orders/\${orderId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => {
      console.error(err);
      triggerToast('Status updated locally. Failed to update remote database.');
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
    
    fetch(\`/api/orders/\${orderId}\`, {
      method: 'DELETE',
    }).catch(err => {
      console.error(err);
      triggerToast('Deleted locally. Failed to delete from remote database.');
    });
  };

  const handleClearOrders = () => {
    setOrders([]);
    fetch('/api/orders', {
      method: 'DELETE',
    }).catch(err => {
      console.error(err);
      triggerToast('Cleared locally. Failed to clear remote database.');
    });
  };`;

// we need to find the exact definition of handleUpdateOrderStatus and replace it with funcsNew.
// Since handleUpdateOrderStatus ends at `}); \n  };`, let's just do a string replace on a specific substring.
const handleUpdateOrderStatusStart = `  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {`;
const handleUpdateOrderStatusFull = `  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    
    fetch(\`/api/orders/\${orderId}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).catch(err => {
      console.error(err);
      triggerToast('Status updated locally. Failed to update remote database.');
    });
  };`;

content = content.replace(handleUpdateOrderStatusFull, funcsNew);
fs.writeFileSync('src/App.tsx', content);
