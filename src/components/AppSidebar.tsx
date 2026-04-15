import React, { useState } from 'react';
import { Phone, Building2, Megaphone, Target, Upload, Shield, UserCog, Users, Settings, Contact, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const navItems = [
  { id: 'queue', label: 'Call Queue', icon: Phone },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'opportunities', label: 'Opportunities', icon: Target },
  { id: 'people', label: 'People', icon: Contact },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'import', label: 'Import', icon: Upload },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AppSidebar: React.FC<{ activeView: string; onViewChange: (id: string) => void }> = ({ activeView, onViewChange }) => {
  const { role, setRole } = useAppState();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-sidebar h-screen flex-shrink-0 transition-all duration-200 ${
        collapsed ? 'w-12' : 'w-48'
      }`}
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-3 border-b border-sidebar-border justify-between">
        <div className="flex items-center overflow-hidden">
          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
          {!collapsed && <span className="ml-2 font-semibold text-sm text-sidebar-accent-foreground whitespace-nowrap">Call Cockpit</span>}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
              activeView === item.id
                ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="ml-3 whitespace-nowrap">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Role Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setRole('admin')}
            title={collapsed ? 'Admin' : undefined}
            className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
              role === 'admin' ? 'bg-primary/15 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span className="ml-2">Admin</span>}
          </button>
          <button
            onClick={() => setRole('assistant')}
            title={collapsed ? 'Assistant' : undefined}
            className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
              role === 'assistant' ? 'bg-primary/15 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <UserCog className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span className="ml-2">Assistant</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
