import { Link } from "react-router";

/** 404 catch-all page */
export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-6xl font-bold text-(--color-border-subtle)">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-(--color-muted)">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="nexus-gradient rounded-lg px-6 py-2 font-medium text-(--color-midnight) transition-opacity hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  );
}
