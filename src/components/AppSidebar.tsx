import React, { useState, useRef, useEffect } from 'react';
import { Phone, Building2, Megaphone, Target, Upload, Shield, UserCog } from 'lucide-react';
import { useAppState } from '@/context/AppContext';

const navItems = [
  { id: 'queue', label: 'Call Queue', icon: Phone },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'opportunities', label: 'Opportunities', icon: Target },
  { id: 'import', label: 'Import', icon: Upload },
];

const AppSidebar: React.FC<{ activeView: string; onViewChange: (id: string) => void }> = ({ activeView, onViewChange }) => {
  const { role, setRole } = useAppState();
  const [visible, setVisible] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  // Show sidebar when hovering the left edge
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX <= 6 && !visible) {
        setVisible(true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible]);

  // Hide sidebar when mouse leaves it
  const handleMouseLeave = (e: React.MouseEvent) => {
    setVisible(false);
  };

  return (
    <>
      {/* Hover trigger zone - always visible */}
      <div
        ref={hoverZoneRef}
        className="fixed left-0 top-0 w-1.5 h-screen z-50"
        style={{ background: visible ? 'transparent' : 'hsl(var(--primary) / 0.15)' }}
        onMouseEnter={() => setVisible(true)}
      />

      {/* Overlay */}
      {visible && (
        <div
          className="fixed inset-0 z-40 bg-background/40"
          onClick={() => setVisible(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseLeave={handleMouseLeave}
        className={`fixed left-0 top-0 w-48 flex flex-col border-r border-border bg-sidebar h-screen z-50 transition-transform duration-200 ${
          visible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-12 flex items-center px-3 border-b border-sidebar-border">
          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="ml-2 font-semibold text-sm text-sidebar-accent-foreground">Call Cockpit</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { onViewChange(item.id); setVisible(false); }}
              className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${
                activeView === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Role Toggle */}
        <div className="p-2 border-t border-sidebar-border">
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setRole('admin')}
              className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                role === 'admin' ? 'bg-primary/15 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="ml-2">Admin</span>
            </button>
            <button
              onClick={() => setRole('assistant')}
              className={`flex items-center px-2 py-1.5 rounded text-xs transition-colors ${
                role === 'assistant' ? 'bg-primary/15 text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <UserCog className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="ml-2">Assistant</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
