import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { 
  Home, 
  FolderOpen, 
  FileText, 
  ClipboardList, 
  Play, 
  LogOut,
  User,
  Menu
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Дашборд', href: '/', icon: Home },
    { name: 'Проекты', href: '/projects', icon: FolderOpen },
    { name: 'Тест-кейсы', href: '/test-cases', icon: FileText },
    { name: 'Тест-планы', href: '/test-plans', icon: ClipboardList },
    { name: 'Тестовые прогоны', href: '/test-runs', icon: Play },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобильный hamburger */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Открыть меню"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Sidebar */}
      {/* Desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-50 md:w-64 md:block sidebar">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">ТМС для СПР</h1>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          {/* User info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти
            </button>
          </div>
        </div>
      </div>
      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg flex flex-col md:hidden animate-slide-in">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">ТМС для СПР</h1>
              <button onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню" className="p-2">
                ✕
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-gray-500 mr-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </button>
            </div>
          </div>
        </>
      )}
      {/* Main content */}
      <div className="md:pl-64 pl-0 transition-all">
        <main className="p-2 sm:p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 