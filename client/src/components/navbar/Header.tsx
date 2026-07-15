import { Link } from "react-router";
import { Button } from "@/components/ui/button";

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 sm:px-6">
      <Link to="/" className="flex items-center gap-2">
        <div className="h-6 w-6 rounded bg-primary" />
        <span className="text-sm font-medium">Flowspace</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          render={<Link to="/login" />}
          nativeButton={false}
          className="w-auto px-4"
        >
          Log in
        </Button>
        <Button
          render={<Link to="/register" />}
          nativeButton={false}
          className="w-auto px-4"
        >
          Sign up
        </Button>
      </div>
    </header>
  );
}

export default Header;
