'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, Dumbbell, Heart } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Habits', href: '/habits', icon: CheckSquare },
  { name: 'Fitness', href: '/fitness', icon: Dumbbell },
  { name: 'Wellness', href: '/wellness', icon: Heart },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 flex-col w-64 border-r border-card-border bg-card-dark text-[#f4f4f5] z-30">
        {/* Header/Logo */}
        <div className="flex items-center h-16 px-6 border-b border-card-border">
          <span className="text-xl font-bold tracking-tight text-brand-success flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-soft-pulse" />
            MOMENTUM
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-card-hover text-white border border-[#27272a]'
                    : 'text-[#a1a1aa] hover:bg-card-hover hover:text-[#f4f4f5]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-success' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer/User Profile */}
        <div className="p-4 border-t border-card-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton />
            <div className="text-xs">
              <p className="font-semibold text-white">Victor</p>
              <p className="text-[#a1a1aa]">Operating System</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-card-border bg-card-dark flex items-center justify-between px-6 z-30">
        <span className="text-lg font-bold tracking-tight text-brand-success flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-success animate-soft-pulse" />
          MOMENTUM
        </span>
        <UserButton />
      </header>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-card-border bg-card-dark flex items-center justify-around z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full transition-all ${
                isActive ? 'text-brand-success' : 'text-[#a1a1aa]'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
