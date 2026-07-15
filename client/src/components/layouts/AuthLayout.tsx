import { Link, Outlet } from "react-router";
import { ArrowLeft } from "lucide-react";
import Footer from "../navbar/Footer";

function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-3 border-b bg-background px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="text-sm font-medium">Flowspace</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AuthLayout;
