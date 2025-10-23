'use client';

/**
 * Shared Sidebar Layout
 *
 * Wraps the entire app with SidebarProvider and AppSidebar.
 * Provides consistent navigation across all pages.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase/client';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [useCaseCount, setUseCaseCount] = useState(0);

  // Load use case count
  useEffect(() => {
    loadUseCaseCount();
  }, []);

  const loadUseCaseCount = async () => {
    const { count } = await supabase
      .from('use_cases')
      .select('id', { count: 'exact', head: true });
    setUseCaseCount(count || 0);
  };

  // Determine current view based on pathname
  const getCurrentView = () => {
    if (pathname === '/') return 'welcome';
    if (pathname.startsWith('/compliance-center')) return 'compliance';
    return 'other';
  };

  const handleNavigateHome = () => {
    router.push('/');
  };

  const handleCreateNew = () => {
    router.push('/?create=true');
  };

  return (
    <SidebarProvider className="h-svh">
      <AppSidebar
        useCaseCount={useCaseCount}
        onNavigateHome={handleNavigateHome}
        onCreateNew={handleCreateNew}
        currentView={getCurrentView()}
      />
      {children}
    </SidebarProvider>
  );
}
