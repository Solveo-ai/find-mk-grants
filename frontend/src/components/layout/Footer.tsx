import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-caption text-center md:text-left">
            © 2025 Funding Opportunities North Macedonia. All rights reserved.
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-6">
            <Link 
              to="/" 
              className="text-caption hover:text-primary transition-colors"
            >
              Почетна
            </Link>
            <Link 
              to="/" 
              className="text-caption hover:text-primary transition-colors"
            >
              Можности
            </Link>
            <Link 
              to="/sources" 
              className="text-caption hover:text-primary transition-colors"
            >
              Извори
            </Link>
            <Link
              to="/contact"
              className="text-caption hover:text-primary transition-colors"
            >
              Контакт
            </Link>
          </nav>
          
          {/* Social Media Space (placeholder for future) */}
          <div className="flex gap-3">
            {/* Space reserved for social media icons */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;