import { SparklesIcon } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh">
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-5 md:px-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
