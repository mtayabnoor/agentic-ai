import { SparklesIcon } from 'lucide-react';

import { AppSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/dashboard-header';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-full overflow-hidden">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-5 md:px-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
