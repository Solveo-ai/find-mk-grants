import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Star } from "lucide-react";
import { useState, useEffect } from "react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [starredCount, setStarredCount] = useState(0);

  useEffect(() => {
    // Get initial count
    const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
    setStarredCount(starredGrants.length);

    // Listen for changes to localStorage
    const handleStorageChange = () => {
      const starredGrants = JSON.parse(localStorage.getItem('starredGrants') || '[]');
      setStarredCount(starredGrants.length);
    };

    // Listen for custom event when grants are starred/unstarred
    window.addEventListener('starredGrantsChanged', handleStorageChange);

    return () => {
      window.removeEventListener('starredGrantsChanged', handleStorageChange);
    };
  }, []);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-foreground">
              Funding Macedonia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-body hover:text-primary transition-colors"
            >
              Почетна
            </Link>
            <Link
              to="/sources"
              className="text-body hover:text-primary transition-colors"
            >
              Извори
            </Link>
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link to="/starred">
                <Star className="w-4 h-4" />
                {starredCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {starredCount > 99 ? '99+' : starredCount}
                  </Badge>
                )}
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/contact">
                Контакт
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-body hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Почетна
              </Link>
              <Link
                to="/sources"
                className="block px-3 py-2 text-body hover:text-primary hover:bg-secondary/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Извори
              </Link>
              <div className="px-3 pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-start relative" asChild>
                  <Link to="/starred" onClick={() => setIsMobileMenuOpen(false)}>
                    <Star className="w-4 h-4 mr-2" />
                    Зачувани
                    {starredCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {starredCount > 99 ? '99+' : starredCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
              <div className="px-3 pt-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                    Контакт
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;