import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Header = () => {
  const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src="/cacheout-logo.png" 
              alt="Cache Out Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? null : isAuthenticated ? (
              <>
                <span className="text-white font-medium cursor-pointer hover:text-gray-300 transition-colors">
                  {user?.name || user?.email}
                </span>
                <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => logout()}>
                  Log Out
                </Button>
              </>
            ) : null}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden text-white">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
