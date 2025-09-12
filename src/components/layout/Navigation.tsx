import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
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
            <Button variant="outline" size="sm">
              Контакт
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
                <Button variant="outline" size="sm" className="w-full">
                  Контакт
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