import React, { useState } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Shield,
  UserCheck,
  PhoneCall,
  ExternalLink
} from 'lucide-react';
import { HusnainLogo } from './HusnainLogo';
import { Category } from '../types';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onNavigate,
  currentPage,
  categories,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0C0E]/90 backdrop-blur-md border-b border-[#1A1F28] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Brand Logo */}
          <HusnainLogo 
            size="md"
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors py-1 ${
                currentPage === 'home' 
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className={`transition-colors py-1 ${
                currentPage === 'catalog' 
                  ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All Ebooks
            </button>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button 
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="text-gray-300 group-hover:text-white py-1 inline-flex items-center gap-1 transition-colors"
              >
                <span>Categories</span>
                <span className="text-xs text-[#D4AF37]">▾</span>
              </button>

              <div className="absolute top-full left-0 mt-2 w-64 bg-[#12161E] border border-[#232B38] rounded-xl shadow-2xl p-2 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                  Browse by Subject
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate('catalog', { categoryId: cat.id });
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#1C222D] rounded-lg transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('catalog', { freeOnly: true })}
              className="text-emerald-400 hover:text-emerald-300 transition-colors py-1 flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Ebooks</span>
            </button>

            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const el = document.getElementById('faq-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-gray-300 hover:text-white transition-colors py-1"
            >
              FAQ
            </button>

            <button
              onClick={() => {
                onNavigate('home');
                setTimeout(() => {
                  const el = document.getElementById('contact-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="text-gray-300 hover:text-white transition-colors py-1"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3">
            
            {/* Search Input (Desktop) */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search ebooks, skills..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'catalog') onNavigate('catalog');
                }}
                className="w-48 lg:w-60 bg-[#13171F] border border-[#232A36] text-xs text-white placeholder-gray-500 rounded-full pl-9 pr-4 py-2 focus:outline-none focus:border-[#D4AF37] focus:w-72 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 pointer-events-none" />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Mobile Search Button Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#161B23]"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Track Order / My Ebooks Button */}
            <button
              onClick={() => onNavigate('portal')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                currentPage === 'portal'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border-[#262E3B] text-gray-300 hover:border-[#D4AF37]/50 hover:text-white hover:bg-[#141820]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Track Order / Access</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={() => onNavigate('admin')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                currentPage === 'admin'
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-extrabold'
                  : 'border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black shadow-sm'
              }`}
              title="Open Store Administration Panel"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-[#141820] border border-[#222936] text-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center group"
              aria-label="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#D4AF37] text-black font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-150">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#161B23]"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Expansion */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t border-[#1C222C] animate-in slide-in-from-top-2 duration-150">
            <div className="relative">
              <input
                type="text"
                placeholder="Search practical ebooks..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'catalog') onNavigate('catalog');
                }}
                className="w-full bg-[#13171F] border border-[#262E3B] text-sm text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
                autoFocus
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D1015] border-b border-[#202733] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-3 text-sm">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 font-medium ${currentPage === 'home' ? 'text-[#D4AF37]' : 'text-gray-200'}`}
            >
              Home
            </button>
            
            <button
              onClick={() => {
                onNavigate('catalog');
                setMobileMenuOpen(false);
              }}
              className={`text-left py-2 font-medium ${currentPage === 'catalog' ? 'text-[#D4AF37]' : 'text-gray-200'}`}
            >
              All Ebooks Catalog
            </button>

            <button
              onClick={() => {
                onNavigate('catalog', { freeOnly: true });
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-semibold text-emerald-400 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Claim Free Ebooks</span>
            </button>

            <button
              onClick={() => {
                onNavigate('portal');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-medium text-gray-200 flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Track Order / Download Ebooks</span>
            </button>

            <div className="pt-2 border-t border-[#1C222C]">
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                Categories
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('catalog', { categoryId: cat.id });
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-1 text-gray-300 hover:text-white"
                  >
                    • {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1C222C] space-y-3">
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span>Open Admin Panel</span>
              </button>

              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>WhatsApp: +92 324 7755484</span>
                <span className="text-gray-500 text-[10px]">Staff Authorized</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
