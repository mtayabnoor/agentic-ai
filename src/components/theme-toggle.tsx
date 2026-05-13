'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { RiSunLine, RiMoonLine } from '@remixicon/react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <RiSunLine className="size-4 dark:hidden" />
      <RiMoonLine className="size-4 hidden dark:block" />
    </Button>
  );
}
