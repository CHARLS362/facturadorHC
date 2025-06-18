
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProSidebarProvider, Sidebar, Menu, MenuItem, SubMenu, useProSidebar, sidebarClasses, menuClasses } from 'react-pro-sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PanelLeft, Menu as MenuIconLucide } from 'lucide-react';
import { useTheme } from 'next-themes'; // For accessing theme variables

// It's important to import the styles for react-pro-sidebar.
// This path is typical for version 1.x.x.
import "react-pro-sidebar/dist/css/styles.css";


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
  const { theme } = useTheme(); // Get current theme

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
  
  // Define sidebar colors based on current theme and CSS variables
  // These need to be dynamically fetched if your CSS variables change with theme
  // For simplicity, we use fixed HSL strings but ideally, these would adapt to theme
  
  const sidebarBackgroundColor = theme === 'dark' ? 'hsl(240 10% 5.5%)' : 'hsl(0 0% 96%)';
  const sidebarTextColor = theme === 'dark' ? 'hsl(0 0% 98%)' : 'hsl(0 0% 25.9%)';
  const sidebarHoverBackgroundColor = theme === 'dark' ? 'hsl(240 3.7% 15.9%)' : 'hsl(0 0% 90%)';
  const sidebarHoverTextColor = theme === 'dark' ? 'hsl(0 0% 98%)' : 'hsl(0 0% 25.9%)';
  const sidebarActiveBackgroundColor = 'hsl(var(--primary))'; // Use existing primary
  const sidebarActiveTextColor = 'hsl(var(--primary-foreground))'; // Use existing primary-foreground
  const sidebarBorderColor = theme === 'dark' ? 'hsl(240 3.7% 20%)' : 'hsl(0 0% 85%)';
  const logoTextColor = 'hsl(var(--primary))'; // For the "FacturaHC" text


  return (
     <div style={{ display: 'flex', minHeight: '100vh' }} className="bg-background">
      <Sidebar
        width="256px"
        collapsedWidth="80px"
        toggled={toggled} // Manages the "broken" state for mobile
        onBackdropClick={() => toggleSidebar()} // Allows closing on mobile by clicking backdrop
        breakPoint="md" // Sidebar becomes "broken" (overlay) below this
        backgroundColor={sidebarBackgroundColor}
        className="shadow-md"
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            // borderRight: `1px solid ${sidebarBorderColor}`, // react-pro-sidebar adds its own border
            color: sidebarTextColor,
            height: '100vh', // Ensure full height
            position: 'sticky', // Keep sidebar sticky
            top: 0,
          },
        }}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 flex items-center ${collapsed && !broken ? 'justify-center' : 'justify-between'} border-b`} style={{borderColor: sidebarBorderColor}}>
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
                <h1 className="font-headline text-xl font-semibold truncate" style={{color: logoTextColor}}>FacturaHC</h1>
              </div>
            )}
            {/* Desktop toggle inside sidebar header when expanded and not broken (mobile) */}
            {!broken && !collapsed && (
              <Button variant="ghost" size="icon" onClick={() => collapseSidebar()} style={{color: sidebarTextColor}} className="hover:bg-accent">
                <PanelLeft className="h-5 w-5" />
              </Button>
            )}
            {/* Show toggle for collapsed state if not broken (mobile), to expand */}
             {!broken && collapsed && (
              <Button variant="ghost" size="icon" onClick={() => collapseSidebar()} style={{color: sidebarTextColor}} className="hover:bg-accent">
                <MenuIconLucide className="h-5 w-5" />
              </Button>
            )}
          </div>

          <div className="flex-grow overflow-y-auto">
            <Menu
              menuItemStyles={{
                button: ({ level, active, disabled }) => {
                  return {
                    color: disabled ? 'hsl(var(--muted-foreground))' : (active ? sidebarActiveTextColor : sidebarTextColor),
                    backgroundColor: active ? sidebarActiveBackgroundColor : 'transparent',
                    '&:hover': {
                      backgroundColor: sidebarHoverBackgroundColor,
                      color: sidebarHoverTextColor,
                    },
                  };
                },
                icon: ({ active }) => ({
                    color: active ? sidebarActiveTextColor : sidebarTextColor,
                }),
                label: ({ active }) => ({
                    fontWeight: active ? '600' : 'normal', // Bolder text for active items
                }),
              }}
            >
              <SidebarNav />
            </Menu>
          </div>
          <div className="p-4 border-t mt-auto" style={{borderColor: sidebarBorderColor}}>
            {/* Sidebar Footer Content can go here */}
            {!collapsed && (
                <p className="text-xs text-center" style={{color: sidebarTextColor}}>© FacturacionHC</p>
            )}
          </div>
        </div>
      </Sidebar>

      <main className="flex-1 flex flex-col overflow-x-hidden"> {/* Added overflow-x-hidden */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6 shadow-sm" style={{borderColor: sidebarBorderColor}}>
          <div className="flex items-center">
            {/* Unified toggle button: Shows MenuIcon on mobile (broken), PanelLeft on desktop */}
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
  // Note: isLoading and isAuthenticated from useAuth are used inside DashboardLayoutContent
  // to avoid hook order issues with ProSidebarProvider.
  
  return (
    <ProSidebarProvider>
      <DashboardLayoutContent user={user} isLoading={isLoading} isAuthenticated={isAuthenticated}>
        {children}
      </DashboardLayoutContent>
    </ProSidebarProvider>
  );
}
