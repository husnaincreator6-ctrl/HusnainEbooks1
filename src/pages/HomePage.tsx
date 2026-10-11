import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  HelpCircle, 
  ChevronDown, 
  MessageCircle, 
  Zap, 
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { Product, Category } from '../types';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const featuredProducts = products.filter(p => p.isFeatured && p.isPublished);
  const freeProducts = products.filter(p => p.isFree && p.isPublished);
  const heroShowcaseProducts = products.filter(p => p.isPublished).slice(0, 3);

  const faqs = [
    {
      q: 'How do I purchase an ebook?',
      a: 'Browse our catalog, select your desired ebook, and click "Buy Now" or add it to your cart. Complete the checkout with your name, email, and WhatsApp number, then select your preferred payment method (JazzCash or Easypaisa).'
    },
    {
      q: 'Which payment methods are supported?',
      a: 'We support official manual payments via JazzCash (03247755484) and Easypaisa (03446730755). You simply send the exact order amount directly through your mobile wallet app.'
    },
    {
      q: 'How do I submit payment proof?',
      a: 'After transferring the payment in your JazzCash or Easypaisa app, return to your checkout page or order portal, enter your 10 to 12 digit Transaction ID (TID), and upload a clear screenshot of the transaction receipt.'
    },
    {
      q: 'How long does manual payment verification take?',
      a: 'Our administrative team verifies payment submissions manually against our merchant statements. Typical verification takes between 1 to 3 hours during regular business hours (9:00 AM to 10:00 PM PKT).'
    },
    {
      q: 'When will my ebook become available?',
      a: 'Free ebooks are available immediately upon claiming. For paid ebooks, your files are unlocked as soon as an administrator verifies and approves your payment submission.'
    },
    {
      q: 'How can I access my purchased ebook?',
      a: 'Once approved, you receive an automated email containing your secure download link. You can also visit our "Track Order / Access" portal at any time using your Order ID and email to read online or download your PDF.'
    },
    {
      q: 'What should I do if my payment is not approved?',
      a: 'If a transaction reference does not match, your order status will be updated with a note. You can submit an updated transaction reference or reach out directly to our dedicated WhatsApp support (+92 324 7755484) for immediate assistance.'
    },
    {
      q: 'Can I request help with an order?',
      a: 'Yes! Our customer support is available via WhatsApp (+92 324 7755484) and email (husnaincreator6@gmail.com) 7 days a week to assist with order tracking, file downloads, or inquiries.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white selection:bg-[#D4AF37]/30">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-[#181D26]">
        {/* Ambient Gold Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#D4AF37]/10 blur-[140px] pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161B23] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold tracking-wide shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OFFICIAL DIGITAL BOOKSTORE • READ. LEARN. GROW.</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-serif-luxury leading-[1.15]">
                Knowledge That <br className="hidden sm:inline" />
                <span className="text-gold-gradient">Moves You Forward.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Discover practical ebooks designed to help you learn valuable skills, improve your knowledge, and take your next step with confidence.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onNavigate('catalog')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black hover:brightness-110 shadow-xl shadow-[#D4AF37]/15 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Ebooks</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('catalog', { freeOnly: true })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm bg-[#131720] border border-[#273142] text-white hover:border-[#D4AF37]/50 hover:bg-[#181E29] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Browse Free Ebooks</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="pt-6 border-t border-[#191F2B] grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#D4AF37] font-serif-luxury">100%</div>
                  <div className="text-[11px] text-gray-400">Practical Frameworks</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#D4AF37] font-serif-luxury">Instant</div>
                  <div className="text-[11px] text-gray-400">Free Ebook Claims</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold text-[#D4AF37] font-serif-luxury">Verified</div>
                  <div className="text-[11px] text-gray-400">JazzCash & Easypaisa</div>
                </div>
              </div>
            </div>

            {/* Right Book Artworks Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md">
                {/* Book Card Display Stack */}
                <div className="relative z-10 flex flex-col gap-4">
                  {heroShowcaseProducts.slice(0, 2).map((item, idx) => (
                    <div 
                      key={item.id}
                      onClick={() => onSelectProduct(item)}
                      className={`cursor-pointer p-4 rounded-2xl bg-[#12161E] border border-[#232B39] hover:border-[#D4AF37]/50 transition-all shadow-2xl flex items-center gap-4 group ${
                        idx === 0 ? 'transform lg:-rotate-1' : 'transform lg:rotate-1'
                      }`}
                    >
                      <img 
                        src={item.coverUrl} 
                        alt={item.title} 
                        className="w-20 h-28 object-cover rounded-lg shadow-md border border-[#2A3444] group-hover:scale-105 transition-transform flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2 py-0.5 rounded">
                            {item.isFree ? 'Free Edition' : 'Featured Publication'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">by {item.author}</p>
                        <div className="mt-2 text-xs font-bold text-[#D4AF37]">
                          {item.isFree ? 'Free Access' : `Rs. ${(item.salePrice ?? item.regularPrice).toLocaleString()}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURED EBOOKS SECTION */}
      <section className="py-20 border-b border-[#181D26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Curated Catalog</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
                Featured Ebooks
              </h2>
            </div>

            <button
              onClick={() => onNavigate('catalog')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4AF37] hover:text-[#E5C158] transition-colors group"
            >
              <span>View All Publications</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const payablePrice = product.isFree ? 0 : (product.salePrice ?? product.regularPrice);
              const discountPercent = product.salePrice && product.salePrice < product.regularPrice
                ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
                : 0;

              return (
                <div 
                  key={product.id}
                  className="bg-[#11141B] border border-[#212733] rounded-2xl p-4 flex flex-col justify-between hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all group"
                >
                  <div>
                    {/* Cover Image Container */}
                    <div 
                      className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-[#181D26] cursor-pointer"
                      onClick={() => onSelectProduct(product)}
                    >
                      <img 
                        src={product.coverUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        {product.isFree ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-emerald-500 text-black shadow-md tracking-wider">
                            FREE
                          </span>
                        ) : discountPercent > 0 ? (
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-[#D4AF37] text-black shadow-md tracking-wider">
                            {discountPercent}% OFF
                          </span>
                        ) : null}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-medium bg-black/70 backdrop-blur-sm text-gray-300">
                        {product.format} • {product.pageCount}p
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Ebook'}
                      </div>
                      
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 cursor-pointer leading-snug"
                      >
                        {product.title}
                      </h3>

                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed pt-1">
                        {product.shortDescription}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="mt-5 pt-4 border-t border-[#1C222D] space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-xs text-gray-400">Price</div>
                      <div>
                        {product.isFree ? (
                          <span className="text-base font-extrabold text-emerald-400">
                            FREE
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            {product.salePrice && product.salePrice < product.regularPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                Rs. {product.regularPrice.toLocaleString()}
                              </span>
                            )}
                            <span className="text-base font-extrabold text-[#D4AF37]">
                              Rs. {payablePrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#181D26] hover:bg-[#202733] text-gray-200 transition-colors"
                      >
                        View Details
                      </button>

                      {product.isFree ? (
                        <button
                          onClick={() => {
                            onAddToCart(product);
                            onNavigate('checkout');
                          }}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
                        >
                          Get Free Ebook
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            onAddToCart(product);
                            onNavigate('checkout');
                          }}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#E5C158] text-black transition-colors"
                        >
                          Buy Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. BROWSE BY CATEGORY SECTION */}
      <section className="py-20 border-b border-[#181D26] bg-[#0C0E12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Structured Learning Paths
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
              Browse by Category
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Focus on targeted skill domains that yield measurable real-world outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const count = products.filter(p => p.categoryId === cat.id && p.isPublished).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate('catalog', { categoryId: cat.id })}
                  className="p-5 rounded-xl bg-[#12161E] border border-[#212835] hover:border-[#D4AF37]/40 hover:bg-[#151A24] cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 rounded-lg bg-[#1A202C] border border-[#273142] flex items-center justify-center text-[#D4AF37] font-bold text-xs group-hover:border-[#D4AF37]/50 transition-colors">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">
                        {count} {count === 1 ? 'Ebook' : 'Ebooks'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-1.5">
                      {cat.name}
                    </h3>
                    
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#1C222E] flex items-center justify-between text-xs font-semibold text-[#D4AF37]">
                    <span>Explore Category</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE HUSNAIN EBOOKS? (REAL VALUES) */}
      <section className="py-20 border-b border-[#181D26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Our Core Commitments
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
              Why Choose Husnain Ebooks?
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Every publication and workflow is built around honesty, practical execution, and zero fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Practical Learning</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Actionable step-by-step frameworks created to solve real career, freelancing, and business challenges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Convenient Access</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Instant web reader access and clean downloadable PDF files formatted for phones, tablets, and desktop.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Transparent Details</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full chapter breakdowns, intended audience explanations, and verified learning outcomes before purchase.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Secure Checkout</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Protected order processing with trusted JazzCash and Easypaisa manual accounts and private receipt storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Guaranteed Unlocking</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Automated email delivery and live portal access as soon as your payment verification is completed.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 5. FREE EBOOKS SECTION */}
      {freeProducts.length > 0 && (
        <section className="py-20 border-b border-[#181D26] bg-[#0A0D11]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Complimentary Resources</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
                  Free Starter Ebooks
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Start learning immediately without entering any payment or financial information.
                </p>
              </div>

              <button
                onClick={() => onNavigate('catalog', { freeOnly: true })}
                className="px-5 py-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
              >
                <span>View All Free Ebooks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {freeProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-6 rounded-2xl bg-[#12161F] border border-[#212836] hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row gap-6 items-center"
                >
                  <img
                    src={prod.coverUrl}
                    alt={prod.title}
                    className="w-32 h-44 object-cover rounded-xl shadow-lg border border-[#2B3545] flex-shrink-0 cursor-pointer"
                    onClick={() => onSelectProduct(prod)}
                  />

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% FREE RESOURCE
                      </span>
                      <span className="text-xs text-gray-400">
                        {prod.pageCount} Pages • {prod.format}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectProduct(prod)}
                      className="text-lg font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
                    >
                      {prod.title}
                    </h3>

                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {prod.shortDescription}
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          onAddToCart(prod);
                          onNavigate('checkout');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Get Free Ebook</span>
                      </button>

                      <button
                        onClick={() => onSelectProduct(prod)}
                        className="px-4 py-2.5 rounded-xl bg-[#1A202B] hover:bg-[#232B3A] text-gray-300 text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 6. FAQ SECTION */}
      <section id="faq-section" className="py-20 border-b border-[#181D26]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              Everything you need to know about purchasing, manual payments, and digital file delivery.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="rounded-xl border border-[#212733] bg-[#11141B] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 text-sm sm:text-base font-bold text-white hover:text-[#D4AF37] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#D4AF37] transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-[#1C222D]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. CONTACT & DIRECT SUPPORT BANNER */}
      <section id="contact-section" className="py-16 bg-[#0E1116]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[#262E3B] bg-gradient-to-r from-[#121620] via-[#151A25] to-[#121620] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Direct Human Assistance
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
                Have a Question Before Purchasing?
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                Our support team is available on WhatsApp to answer inquiries regarding ebook topics, bulk orders, or payment instructions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="https://wa.me/923247755484" 
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black transition-colors shadow-lg shadow-emerald-500/10"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                onClick={() => onNavigate('portal')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs bg-[#1A202C] hover:bg-[#232B3B] text-gray-200 border border-[#2B3545] transition-colors"
              >
                <span>Track Existing Order</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
