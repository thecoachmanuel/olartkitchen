import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const adminPanelCallOld = `<AdminPanel
              foodItems={foodItems}
              orders={orders}
              adminSettings={adminSettings}
              onUpdateSettings={handleUpdateSettings}
              onAddFoodItem={handleAddFoodItem}
              onUpdateFoodItem={handleUpdateFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              dbStatus={dbStatus}
              onBroadcastNotification={broadcastNotification}
            />`;

const adminPanelCallNew = `<AdminPanel
              foodItems={foodItems}
              orders={orders}
              adminSettings={adminSettings}
              onUpdateSettings={handleUpdateSettings}
              onAddFoodItem={handleAddFoodItem}
              onUpdateFoodItem={handleUpdateFoodItem}
              onDeleteFoodItem={handleDeleteFoodItem}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onClearOrders={handleClearOrders}
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              dbStatus={dbStatus}
              usersList={usersList}
              onBroadcastNotification={broadcastNotification}
            />`;

content = content.replace(adminPanelCallOld, adminPanelCallNew);
fs.writeFileSync('src/App.tsx', content);
