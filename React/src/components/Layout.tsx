import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, PenTool, User, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/write', icon: PenTool, label: '写作文' },
    { path: '/recharge', icon: CreditCard, label: '会员' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  // Hide nav on login page
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-xl overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-12 transition-colors",
                  isActive ? "text-green-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
