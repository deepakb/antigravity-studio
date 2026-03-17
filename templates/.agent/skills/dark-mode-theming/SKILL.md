# SKILL: Dark Mode Theming

## Overview
Production-grade dark mode implementation for Next.js/React using **next-themes**, CSS custom properties, and Tailwind CSS. Load when implementing or debugging theme switching.

## Setup (next-themes)
```bash
npm install next-themes
```

```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"           // Add "dark" class to <html>
      defaultTheme="system"       // Respect OS preference by default
      enableSystem                // Enable system theme detection
      disableTransitionOnChange   // Prevents flash during theme switch
      storageKey="app-theme"      // localStorage key
    >
      {children}
    </ThemeProvider>
  );
}
```

## CSS Token Architecture
```css
/* globals.css — All theme tokens must be in BOTH :root and .dark */
:root {
  /* Surface colors */
  --background: 0 0% 100%;           /* white */
  --foreground: 222.2 84% 4.9%;      /* near-black */
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;

  /* Brand colors */
  --primary: 221.2 83.2% 53.3%;      /* brand blue */
  --primary-foreground: 210 40% 98%; /* near-white */

  /* Semantic colors */
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --destructive: 0 84.2% 60.2%;      /* error red */
  --destructive-foreground: 210 40% 98%;

  /* Borders & Rings */
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;

  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;      /* slightly lighter blue for dark bg */
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --destructive: 0 62.8% 30.6%;      /* darker red — still readable */
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
}
```

## Theme Toggle Component
```tsx
'use client';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Avoiding Flash of Unstyled Content (FOUC)
```tsx
// ✅ next-themes + `disableTransitionOnChange` prevents flash
// ✅ Always set a data-theme or class on <html> immediately (next-themes does this)

// ✅ For server-rendered theme-aware components:
function ThemedCard({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — don't render theme-specific content until mounted
  if (!mounted) return <div className="bg-card" />;  // Placeholder

  return (
    <div className={resolvedTheme === 'dark' ? 'shadow-white/5' : 'shadow-black/5'}>
      {children}
    </div>
  );
}
```

## Tailwind Dark Mode in Components
```tsx
// ✅ Always pair light + dark variants on ALL surfaces
<div className="bg-white dark:bg-neutral-900">

// ✅ Text
<p className="text-neutral-900 dark:text-neutral-100">

// ✅ Borders
<div className="border border-neutral-200 dark:border-neutral-800">

// ✅ Shadows (more subtle in dark mode)
<div className="shadow-sm dark:shadow-black/20">
```
