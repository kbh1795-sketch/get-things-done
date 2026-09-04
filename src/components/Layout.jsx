import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { CheckSquare, FolderKanban, Inbox, LogOut, Target, Settings as SettingsIcon, Award, CalendarDays, ScrollText, BarChart3, MoreHorizontal } from 'lucide-react';
import { useI18n } from '@/lib/I18nContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import PullToRefresh from '@/components/PullToRefresh';

export default function Layout() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const desktopNav = [
    { to: '/', label: t('nav.tasks'), icon: CheckSquare, end: true },
    { to: '/schedule', label: t('nav.schedule'), icon: CalendarDays },
    { to: '/projects', label: t('nav.projects'), icon: FolderKanban },
    { to: '/charter', label: t('nav.charter'), icon: ScrollText },
    { to: '/backlog', label: t('nav.backlog'), icon: Inbox },
    { to: '/achievements', label: t('nav.achievements'), icon: Award },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  const mobileNav = [
    { to: '/', label: t('nav.tasks'), icon: CheckSquare, end: true },
    { to: '/schedule', label: t('nav.schedule'), icon: CalendarDays },
    { to: '/projects', label: t('nav.projects'), icon: FolderKanban },
    { to: '/stats', label: t('nav.stats'), icon: BarChart3 },
    { to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
  ];

  const moreNav = [
    { to: '/charter', label: t('nav.charter'), icon: ScrollText },
    { to: '/backlog', label: t('nav.backlog'), icon: Inbox },
    { to: '/achievements', label: t('nav.achievements'), icon: Award },
  ];

  const handleRefresh = () => qc.invalidateQueries();

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar p-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">{t('app.name')}</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {desktopNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t pt-3 mt-2">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium truncate">{user?.full_name || user?.email || t('common.user')}</p>
          </div>
          <button onClick={() => logout()} aria-label={t('common.logout')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full">
            <LogOut className="w-5 h-5" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <PullToRefresh className="h-full overflow-y-auto scroll-area" onRefresh={handleRefresh}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="pb-20 md:pb-4"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </PullToRefresh>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background flex justify-around px-1 pt-1 pb-safe z-50">
        {mobileNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-1 rounded-lg text-xs font-medium min-h-[44px] flex-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button aria-label={t('nav.more')} className="flex flex-col items-center justify-center gap-1 px-1 rounded-lg text-xs font-medium min-h-[44px] flex-1 text-muted-foreground">
              <MoreHorizontal className="w-5 h-5" />
              {t('nav.more')}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-safe">
            <SheetHeader>
              <SheetTitle>{t('nav.more')}</SheetTitle>
            </SheetHeader>
            <div className="grid grid-cols-3 gap-3 px-4 pb-6">
              {moreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.to} to={item.to} onClick={() => setMoreOpen(false)} aria-label={item.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:bg-muted min-h-[44px]">
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}