import { SparklesIcon } from 'lucide-react';

import { AppSidebar } from '@/components/dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { SiteHeader } from '@/components/dashboard-header';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader></SiteHeader>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
