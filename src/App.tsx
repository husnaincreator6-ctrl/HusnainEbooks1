import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { PolicyModals, PolicyType } from './components/PolicyModals';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentSubmissionPage } from './pages/PaymentSubmissionPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { OrderAccessPortal } from './pages/OrderAccessPortal';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Product, Category } from './types';
import { Shield } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  
  // Catalog & Store State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shopping Cart
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Policy Modals
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  // Administrator Session
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem('heb_admin_token') || null;
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem('heb_admin_email') || 'husnaincreator6@gmail.com';
  });

  // Load public products, categories, and settings
  const loadStoreData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);

      const [prodData, catData] = await Promise.all([
        prodRes.json(),
        catRes.json()
      ]);

      if (prodData.success) setProducts(prodData.products);
      if (catData.success) setCategories(catData.categories);
    } catch (err) {
      console.error('Failed to load store data:', err);
    }
  };

  useEffect(() => {
    loadStoreData();
  }, []);

  // Sync with URL hash for navigation & bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (hash.startsWith('order/')) {
        const token = hash.replace('order/', '');
        setCurrentPage('portal');
        setPageParams({ token });
      } else if (hash.startsWith('ebook/')) {
        const slug = hash.replace('ebook/', '');
        const found = products.find(p => p.slug === slug);
        if (found) {
          setSelectedProduct(found);
          setCurrentPage('product-detail');
        }
      } else if (hash === 'catalog') {
        setCurrentPage('catalog');
      } else if (hash === 'free') {
        setCurrentPage('catalog');
        setPageParams({ freeOnly: true });
      } else if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === 'portal') {
        setCurrentPage('portal');
      } else if (hash === 'checkout') {
        setCurrentPage('checkout');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial check
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [products]);

  // Navigation Helper
  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL hash smoothly
    if (page === 'home') window.location.hash = '';
    else if (page === 'catalog') {
      window.location.hash = params.freeOnly ? '/free' : '/catalog';
    } else if (page === 'admin') window.location.hash = '/admin';
    else if (page === 'portal') {
      window.location.hash = params.token ? `/order/${params.token}` : '/portal';
    } else if (page === 'checkout') window.location.hash = '/checkout';
  };

  // Cart Management
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      if (prev.some(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.id !== productId));
  };

  // Admin Auth Handlers
  const handleAdminLoginSuccess = (token: string, email: string) => {
    setAdminToken(token);
    setAdminEmail(email);
    sessionStorage.setItem('heb_admin_token', token);
    sessionStorage.setItem('heb_admin_email', email);
    setCurrentPage('admin');
  };

  const handleAdminLogout = async () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      }).catch(console.error);
    }
    setAdminToken(null);
    sessionStorage.removeItem('heb_admin_token');
    sessionStorage.removeItem('heb_admin_email');
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#FFF8E7]">
      
      {/* Global Navigation (Shown on public pages) */}
      {currentPage !== 'admin' && currentPage !== 'admin-login' && (
        <Navbar
          cartCount={cartItems.length}
          onOpenCart={() => setIsCartOpen(true)}
          onNavigate={navigate}
          currentPage={currentPage}
          categories={categories}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {/* Main Page Routing */}
      <div className="flex-1">
        {/* 1. Home Page */}
        {currentPage === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              navigate('product-detail');
            }}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {/* 2. Catalog Page */}
        {currentPage === 'catalog' && (
          <CatalogPage
            products={products}
            categories={categories}
            initialCategory={pageParams.categoryId}
            initialFreeOnly={pageParams.freeOnly}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              navigate('product-detail');
            }}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
          />
        )}

        {/* 3. Product Detail Page */}
        {currentPage === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            categories={categories}
            relatedProducts={products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id && p.isPublished)}
            onBack={() => navigate('catalog')}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={navigate}
          />
        )}

        {/* 4. Checkout Page */}
        {currentPage === 'checkout' && (
          <CheckoutPage
            cartItems={cartItems}
            onRemoveItem={handleRemoveFromCart}
            onOrderCreated={({ orderId, accessToken, isFree, paymentMethod }) => {
              setCartItems([]);
              if (isFree) {
                navigate('thank-you', { orderId, accessToken, isFree: true });
              } else {
                navigate('payment', { orderId, accessToken, initialMethod: paymentMethod });
              }
            }}
            onNavigate={navigate}
            onOpenPolicy={(policy) => setActivePolicy(policy)}
          />
        )}

        {/* 5. Manual Payment Submission Screen (JazzCash / Easypaisa) */}
        {currentPage === 'payment' && (
          <PaymentSubmissionPage
            orderId={pageParams.orderId}
            accessToken={pageParams.accessToken}
            initialMethod={pageParams.initialMethod}
            onPaymentSubmitted={(orderId, accessToken) => {
              navigate('thank-you', { orderId, accessToken });
            }}
            onNavigate={navigate}
          />
        )}

        {/* 6. Thank You / Order Confirmation Page */}
        {currentPage === 'thank-you' && (
          <ThankYouPage
            orderId={pageParams.orderId}
            accessToken={pageParams.accessToken}
            onNavigate={navigate}
          />
        )}

        {/* 7. Customer Access & Delivery Portal */}
        {currentPage === 'portal' && (
          <OrderAccessPortal
            initialToken={pageParams.token}
            onNavigate={navigate}
          />
        )}

        {/* 8. Admin Login Page */}
        {currentPage === 'admin-login' && (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onNavigate={navigate}
          />
        )}

        {/* 9. Protected Admin Dashboard */}
        {currentPage === 'admin' && (
          adminToken ? (
            <AdminDashboard
              token={adminToken}
              adminEmail={adminEmail}
              onLogout={handleAdminLogout}
              onNavigateStorefront={() => navigate('home')}
            />
          ) : (
            <AdminLoginPage
              onLoginSuccess={handleAdminLoginSuccess}
              onNavigate={navigate}
            />
          )
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => navigate('checkout')}
      />

      {/* Policy Modals */}
      <PolicyModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      {/* Global Footer (Public pages) */}
      {currentPage !== 'admin' && currentPage !== 'admin-login' && (
        <Footer
          onOpenPolicy={(policy) => setActivePolicy(policy)}
          onNavigate={navigate}
        />
      )}

      {/* Floating Admin Panel Quick Access Button */}
      {currentPage !== 'admin' && currentPage !== 'admin-login' && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => navigate('admin')}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#121620]/95 hover:bg-[#1A202D] text-[#D4AF37] border border-[#D4AF37]/50 shadow-2xl backdrop-blur-md text-xs font-bold transition-all hover:scale-105 active:scale-95 group shadow-[#D4AF37]/15"
            title="Open Husnain Ebooks Admin Panel"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span className="tracking-wide">Admin Panel</span>
          </button>
        </div>
      )}

    </div>
  );
}
