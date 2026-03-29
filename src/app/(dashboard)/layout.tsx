import { SparklesIcon } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import ProfileDropdown from '@/components/dropdown-profile';
import { Button } from '@/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
