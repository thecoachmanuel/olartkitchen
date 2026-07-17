import fs from 'fs';
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Desktop sidebar logo
const desktopSidebarOld = `<div className="mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
              🍳 {adminSettings.logoName || 'Olart Admin'}
            </span>
          </div>`;

const desktopSidebarNew = `<div className="mb-6 pb-4 border-b border-neutral-100 dark:border-neutral-900">
          <div className="flex items-center gap-2">
            {adminSettings.logoImage ? (
              <img src={adminSettings.logoImage} alt="Logo" className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-sm">{adminSettings.logoEmoji || '🍳'}</span>
            )}
            <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
              {adminSettings.logoName || 'Olart Admin'}
            </span>
          </div>`;

content = content.replace(desktopSidebarOld, desktopSidebarNew);

// 2. Mobile sidebar logo
const mobileSidebarOld = `<div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
                    🍳 {adminSettings.logoName || 'Olart Admin'}
                  </span>
                  <button`;

const mobileSidebarNew = `<div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center gap-2">
                    {adminSettings.logoImage ? (
                      <img src={adminSettings.logoImage} alt="Logo" className="w-6 h-6 rounded-md object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm">{adminSettings.logoEmoji || '🍳'}</span>
                    )}
                    <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider">
                      {adminSettings.logoName || 'Olart Admin'}
                    </span>
                  </div>
                  <button`;

content = content.replace(mobileSidebarOld, mobileSidebarNew);

// 3. Mobile Header Bar Layout
const mobileHeaderOld = `{/* MOBILE HEADER BAR */}
      <div className="lg:hidden w-full flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-neutral-900/30 border border-neutral-200/40 dark:border-neutral-800/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
          <div>
            <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider block">
              {navigationItems.find((n) => n.id === activeTab)?.label}
            </span>
            <span className="text-[9px] text-neutral-400 font-semibold block">Admin Workspace</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut size={15} />
        </button>
      </div>`;

const mobileHeaderNew = `{/* MOBILE HEADER BAR */}
      <div className="lg:hidden w-full flex items-center justify-between p-4 rounded-2xl bg-white/60 dark:bg-neutral-900/30 border border-neutral-200/40 dark:border-neutral-800/30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-50 uppercase tracking-wider block">
              {navigationItems.find((n) => n.id === activeTab)?.label}
            </span>
            <span className="text-[9px] text-neutral-400 font-semibold block">Admin Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </div>`;

content = content.replace(mobileHeaderOld, mobileHeaderNew);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
