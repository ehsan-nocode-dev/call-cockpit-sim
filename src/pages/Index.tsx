import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import AppSidebar from '@/components/AppSidebar';
import CallQueue from '@/components/CallQueue';
import CallCockpit from '@/components/CallCockpit';
import PlaceholderView from '@/components/PlaceholderView';

const Index = () => {
  const [activeView, setActiveView] = useState('queue');

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'queue' ? (
            <>
              {/* Call Queue - left panel */}
              <div className="w-[520px] xl:w-[600px] 2xl:w-[700px] flex-shrink-0 border-r border-border overflow-hidden">
                <CallQueue />
              </div>
              {/* Call Cockpit - right panel */}
              <div className="flex-1 overflow-hidden">
                <CallCockpit />
              </div>
            </>
          ) : (
            <PlaceholderView viewId={activeView} />
          )}
        </div>
      </div>
    </AppProvider>
  );
};

export default Index;
