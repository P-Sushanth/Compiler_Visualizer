import { Panel, Group, Separator } from 'react-resizable-panels';
import { TopBar } from '@/components/TopBar';
import { Sidebar } from '@/components/Sidebar';
import { StatusBar } from '@/components/StatusBar';
import React from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const childrenArray = React.Children.toArray(children);
  const editorChild = childrenArray[0];
  const visualizationChild = childrenArray[1];

  return (
    <div className="flex flex-col h-screen w-screen bg-bg-primary font-sans overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex flex-1 overflow-hidden min-w-0">
          <Group orientation="horizontal">
            <Panel defaultSize={50} minSize={20}>
              {editorChild}
            </Panel>
            
            <Separator className="w-1 bg-border-primary hover:bg-info hover:w-1 transition-all cursor-col-resize active:bg-info z-10" />
            
            <Panel defaultSize={50} minSize={20}>
              {visualizationChild}
            </Panel>
          </Group>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
