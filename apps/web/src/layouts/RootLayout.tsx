import { Outlet, useMatches } from "react-router";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface RouteHandle {
  title?: string;
  description?: string;
}

/**
 * Root layout — wraps every page.
 * Handles document title updates from route `handle` metadata.
 *
 * 🤖 @frontend-specialist — Loading: react-patterns skill...
 */
export function RootLayout() {
  const matches = useMatches();

  useEffect(() => {
    // Walk matches deepest-first to find the most specific title
    const handle = [...matches]
      .reverse()
      .find((m) => (m.handle as RouteHandle)?.title) as
      | { handle: RouteHandle }
      | undefined;

    if (handle?.handle.title) {
      document.title = handle.handle.title;
    }
  }, [matches]);

  return (
    <div className="flex min-h-screen flex-col bg-(--color-background) text-(--color-foreground)">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
