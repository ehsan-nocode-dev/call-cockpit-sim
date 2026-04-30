import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import AppSidebar from '@/components/AppSidebar';
import CallQueue from '@/components/CallQueue';
import CallCockpit from '@/components/CallCockpit';
import PlaceholderView from '@/components/PlaceholderView';
import CompaniesView from '@/components/views/CompaniesView';
import CampaignsView from '@/components/views/CampaignsView';
import CampaignAssignmentsView from '@/components/views/CampaignAssignmentsView';
import OpportunitiesView from '@/components/views/OpportunitiesView';
import PeopleView from '@/components/views/PeopleView';
import UsersView from '@/components/views/UsersView';
import SettingsView from '@/components/views/SettingsView';
import ImportView from '@/components/views/ImportView';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [activeView, setActiveView] = useState('queue');

  return (
    <AppProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 flex overflow-hidden min-w-0">
          {activeView === 'queue' ? (
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
                <CallQueue />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={60} minSize={30}>
                <CallCockpit />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : activeView === 'companies' ? (
            <CompaniesView />
          ) : activeView === 'campaigns' ? (
            <CampaignsView />
          ) : activeView === 'assignments' ? (
            <CampaignAssignmentsView />
          ) : activeView === 'opportunities' ? (
            <OpportunitiesView />
          ) : activeView === 'people' ? (
            <PeopleView />
          ) : activeView === 'users' ? (
            <UsersView />
          ) : activeView === 'settings' ? (
            <SettingsView />
          ) : activeView === 'import' ? (
            <ImportView onNavigate={setActiveView} />
          ) : (
            <PlaceholderView viewId={activeView} />
          )}
        </main>
      </div>
    </AppProvider>
  );
};

export default Index;
