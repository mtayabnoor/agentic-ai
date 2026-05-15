import { SparklesIcon } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/app-header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh flex overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader />
        <main className="flex min-h-0 flex-1 overflow-hidden px-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
