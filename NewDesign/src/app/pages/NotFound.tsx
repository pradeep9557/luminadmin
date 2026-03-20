import { Home } from "lucide-react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f6fa] p-8">
      <div className="text-center">
        <h1 className="mb-4 font-['Homenaje:Regular',sans-serif] text-9xl text-[#090838]">404</h1>
        <p className="mb-2 text-2xl font-semibold text-[#090838]">Page Not Found</p>
        <p className="mb-8 text-[#6b6b88]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0048ff] to-[#0036cc] px-6 py-3 text-sm font-medium text-white hover:from-[#0036cc] hover:to-[#0024aa]"
        >
          <Home className="size-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
