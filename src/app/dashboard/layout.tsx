
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProSidebarProvider, Sidebar, Menu, useProSidebar, sidebarClasses } from 'react-pro-sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PanelLeft, Menu as MenuIconLucide } from 'lucide-react';
import { cn } from '@/lib/utils';

function DashboardLayoutContent({ 
  children, 
  user, 
  isLoading, 
  isAuthenticated 
}: { 
  children: React.ReactNode; 
  user: { email?: string; name?: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const { collapseSidebar, toggleSidebar, collapsed, broken, toggled } = useProSidebar();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isPrintOrExportPage = pathname.includes('/exportar') || pathname.includes('/imprimir');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isMounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
         <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  if (isPrintOrExportPage) {
    return (
      <div className="bg-muted flex justify-center min-h-screen p-4 sm:p-8 print:p-0">
        <div className="w-full max-w-6xl bg-card rounded-xl shadow-lg print:bg-transparent print:shadow-none print:max-w-none print:w-auto">
            {children}
        </div>
      </div>
    );
  }
  
  return (
     <div style={{ display: 'flex', minHeight: '100vh' }} className="bg-background">
      <Sidebar
        width="256px"
        collapsedWidth="80px"
        toggled={toggled} 
        onBackdropClick={() => toggleSidebar()} 
        breakPoint="md"
        className="shadow-md"
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            height: '100vh', 
            position: 'sticky', 
            top: 0,
          },
        }}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 flex items-center ${collapsed && !broken ? 'justify-center' : 'justify-between'} border-b border-border/50`}>
            {!collapsed && (
              <div className="flex items-center gap-2 overflow-hidden">
                <Image
                  src="https://placehold.co/40x40.png?text=FH"
                  alt="FacturacionHC Logo Small"
                  width={32}
                  height={32}
                  className="rounded-md"
                  data-ai-hint="modern business logo"
                />
                <h1 className="font-headline text-xl font-semibold truncate text-primary">FacturaHC</h1>
              </div>
            )}
            {!broken && !collapsed && (
              <Button variant="ghost" size="icon" onClick={() => collapseSidebar()} className="text-muted-foreground hover:bg-accent">
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
             {!broken && collapsed && (
              <Button variant="ghost" size="icon" onClick={() => collapseSidebar()} className="text-muted-foreground hover:bg-accent">
                <MenuIconLucide className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto">
            <Menu>
              <SidebarNav />
            </Menu>
          </div>
          <div className="p-4 border-t border-border/50 mt-auto">
            {!collapsed && (
                <p className="text-xs text-center text-muted-foreground">© FacturacionHC</p>
            )}
          </div>
        </div>
      </Sidebar>

      <main className="flex-1 flex flex-col overflow-x-hidden"> 
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm border-border/50">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => broken ? toggleSidebar() : collapseSidebar()} className="text-foreground hover:bg-accent">
              {broken || collapsed ? <MenuIconLucide className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
          </div>
          <UserNav user={user} />
        </header>
        <div className="flex-1 overflow-y-auto p-6 w-full max-w-screen-2xl mx-auto animate-content-show">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  return (
    <ProSidebarProvider>
      <DashboardLayoutContent user={user} isLoading={isLoading} isAuthenticated={isAuthenticated}>
        {children}
      </DashboardLayoutContent>
    </ProSidebarProvider>
  );
}
