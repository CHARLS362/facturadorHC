
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
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

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground shadow-md">
          <SidebarHeader className="p-4 flex items-center gap-2 justify-between">
             <div className="flex items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden">
                <Image 
                  src="https://placehold.co/40x40.png?text=FH" 
                  alt="FacturacionHC Logo Small" 
                  width={32} 
                  height={32}
                  className="rounded-md"
                  data-ai-hint="modern business logo"
                />
                <h1 className="font-headline text-xl font-semibold text-sidebar-primary truncate">FacturaHC</h1>
              </div>
              <SidebarTrigger className="group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:bg-sidebar-accent" />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            {/* Can add footer content like app version or quick links here */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col bg-background">
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm">
            <div className="flex items-center">
              <SidebarTrigger className="md:hidden text-foreground hover:bg-accent" />
              {/* Breadcrumbs or page title can go here */}
            </div>
            <UserNav user={user} />
          </header>
          <main className="flex-1 overflow-y-auto p-6 w-full max-w-screen-2xl mx-auto animate-content-show">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
