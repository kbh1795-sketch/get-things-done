import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { CheckSquare, BarChart3, FolderKanban, Inbox, LogOut, CalendarCheck, Settings as SettingsIcon } from 'lucide-react';
import { SettingsProvider } from '@/lib/SettingsContext';

const navItems = [
  { to: '/', label: '할 일', icon: CheckSquare, end: true },
  { to: '/stats', label: '성과', icon: BarChart3 },
  { to: '/projects', label: '프로젝트', icon: FolderKanban },
  { to: '/backlog', label: '백로그', icon: Inbox },
  { to: '/settings', label: '설정', icon: SettingsIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <SettingsProvider>
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar p-4 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-4 mb-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-lg">마이태스크</span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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
            <p className="text-sm font-medium truncate">{user?.full_name || user?.email || '사용자'}</p>
          </div>
          <button onClick={() => logout()} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 w-full">
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background flex justify-around py-2 px-2 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
    </SettingsProvider>
  );
}