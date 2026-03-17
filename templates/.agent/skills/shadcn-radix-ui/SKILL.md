# SKILL: shadcn/ui + Radix UI

## Overview
Best practices for using **shadcn/ui** (component registry) with **Radix UI** primitives for building accessible, themeable component systems in TypeScript.

## Setup
```bash
# Initialize shadcn in a Next.js project
npx shadcn@latest init

# Add components (they are copied into your codebase, not imported from npm)
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add data-table
```

## Key Concepts

### shadcn/ui is NOT a Library
Components are **copied into your project** (`components/ui/`). This means:
- ✅ Full control — modify them freely
- ✅ No version lock — update manually when needed
- ✅ No bundle from external package (only what you use)
- ⚠️ Don't edit `components/ui/` directly if you want to re-sync later

### Component Extension Pattern
```tsx
// ✅ Create wrapper components in components/[feature]/ — not in components/ui/
// components/ui/button.tsx — leave as-is (shadcn copy)
// components/shared/confirm-button.tsx — your composition

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export function ConfirmButton({
  isLoading,
  loadingText = 'Processing...',
  children,
  disabled,
  ...props
}: ConfirmButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
      {isLoading ? loadingText : children}
    </Button>
  );
}
```

## Radix UI Primitives (Power Patterns)

### Accessible Dialog (Modal)
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

function DeleteConfirmDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete your account and all data. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Combobox (Accessible Select)
```tsx
// shadcn Combobox = Command + Popover
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function FrameworkCombobox({ options, value, onChange }: ComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-48 justify-between">
          {value ? options.find(o => o.value === value)?.label : 'Select framework...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No framework found.</CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => { onChange(option.value); setOpen(false); }}
              >
                <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Form Integration (shadcn Form + RHF + Zod)
```tsx
// shadcn/ui Form component wraps React Hook Form
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="username"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Username</FormLabel>
          <FormControl>
            <Input placeholder="johndoe" {...field} />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage /> {/* Auto-shows Zod validation errors */}
        </FormItem>
      )}
    />
  </form>
</Form>
```
