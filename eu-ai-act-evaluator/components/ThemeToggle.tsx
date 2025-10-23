'use client';

import { useThemeStore } from '@/stores/useThemeStore';
import { Button } from '@/components/ui/button';
import { Scale, ScrollText } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
      title={`Switch to ${theme === 'modern' ? 'medieval' : 'modern'} theme`}
    >
      {theme === 'modern' ? (
        <>
          <ScrollText className="h-4 w-4" />
          <span className="text-xs">Medieval Theme</span>
        </>
      ) : (
        <>
          <Scale className="h-4 w-4" />
          <span className="text-xs">Modern Theme</span>
        </>
      )}
    </Button>
  );
}
