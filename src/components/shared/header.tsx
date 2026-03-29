import { LanguagesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sidebar, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import ProfileDropdown from '@/components/shared/dropdown-profile'

const Header = () => {
  return (
    <div className='flex min-h-dvh w-full'>
      <SidebarProvider>
        <Sidebar>
          <div className='border-sidebar-foreground/10 m-6 h-full rounded-md border bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--sidebar-foreground)10%,transparent),color-mix(in_oklab,var(--sidebar-foreground)10%,transparent)_1px,var(--sidebar)_2px,var(--sidebar)_15px)]' />
        </Sidebar>
        <div className='flex flex-1 flex-col'>
          <header className='bg-card sticky top-0 z-50 border-b'>
            <div className='mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:!size-5' />
                <Separator orientation='vertical' className='hidden !h-4 sm:block' />
              </div>
              <div className='flex items-center gap-1.5'>
                <ProfileDropdown
                  trigger={
                    <Button variant='ghost' size='icon' className='size-9.5'>
                      <Avatar className='size-9.5 rounded-md'>
                        <AvatarImage src='https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png' />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
              </div>
            </div>
          </header>
        </div>
      </SidebarProvider>
    </div>
  )
}

export default Header