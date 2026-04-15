import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Shield, UserCog, Bell, Globe, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SettingsView: React.FC = () => {
  const { role } = useAppState();
  const isAdmin = role === 'admin';
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Export', icon: Database },
  ];

  return (
    <div className="h-full overflow-auto p-4">
      <h2 className="text-sm font-semibold text-foreground mb-4">Settings</h2>

      <div className="flex gap-4">
        {/* Tabs sidebar */}
        <div className="w-44 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-2'
              }`}
              style={activeTab !== tab.id ? { } : {}}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 cockpit-section max-w-xl">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="cockpit-label">Company Name</label>
                <Input defaultValue="Call Cockpit GmbH" className="h-8 text-xs mt-1" disabled={!isAdmin} />
              </div>
              <div>
                <label className="cockpit-label">Default Language</label>
                <select className="h-8 text-xs rounded border border-border px-2 w-full mt-1 bg-transparent text-foreground" disabled={!isAdmin}>
                  <option>Deutsch</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="cockpit-label">Timezone</label>
                <select className="h-8 text-xs rounded border border-border px-2 w-full mt-1 bg-transparent text-foreground" disabled={!isAdmin}>
                  <option>Europe/Berlin (CET)</option>
                  <option>Europe/London (GMT)</option>
                  <option>Europe/Zurich (CET)</option>
                </select>
              </div>
              {isAdmin && <Button size="sm" className="text-xs h-8 mt-2">Save Changes</Button>}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-3">
              {['Email on new lead', 'Email on status change', 'Daily summary email', 'Browser notifications'].map(item => (
                <label key={item} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-border" disabled={!isAdmin} />
                  {item}
                </label>
              ))}
              {isAdmin && <Button size="sm" className="text-xs h-8 mt-2">Save Changes</Button>}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-3">
              <div>
                <label className="cockpit-label">Theme</label>
                <select className="h-8 text-xs rounded border border-border px-2 w-full mt-1 bg-transparent text-foreground">
                  <option>Dark (Default)</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="cockpit-label">Density</label>
                <select className="h-8 text-xs rounded border border-border px-2 w-full mt-1 bg-transparent text-foreground">
                  <option>Compact</option>
                  <option>Comfortable</option>
                </select>
              </div>
              <Button size="sm" className="text-xs h-8 mt-2">Save Changes</Button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Export and manage your data.</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs h-8" disabled={!isAdmin}>Export Companies (CSV)</Button>
                <Button variant="outline" size="sm" className="text-xs h-8" disabled={!isAdmin}>Export People (CSV)</Button>
                <Button variant="outline" size="sm" className="text-xs h-8" disabled={!isAdmin}>Export Opportunities (CSV)</Button>
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-destructive">Danger Zone</p>
                <Button variant="destructive" size="sm" className="text-xs h-8 mt-2" disabled={!isAdmin}>Reset All Data</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
