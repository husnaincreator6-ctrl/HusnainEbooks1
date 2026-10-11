import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  BookOpen, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Globe, 
  Layers, 
  Clock, 
  Share2,
  Lock,
  MessageCircle 
} from 'lucide-react';
import { Product, Category } from '../types';

interface ProductDetailPageProps {
  product: Product;
  categories: Category[];
  relatedProducts: Product[];
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  categories,
  relatedProducts,
  onBack,
  onAddToCart,
  onSelectProduct,
  onNavigate
}) => {
  const category = categories.find(c => c.id === product.categoryId);
  const payablePrice = product.isFree ? 0 : (product.salePrice ?? product.regularPrice);
  const discountPercent = product.salePrice && product.salePrice < product.regularPrice
    ? Math.round(((product.regularPrice - product.salePrice) / product.regularPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#D4AF37] mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalog</span>
        </button>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Left: Book Cover Presentation & Quick Stats */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start">
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-[#121620] border border-[#273244] shadow-2xl group">
              <img
                src={product.coverUrl}
                alt={product.title}
                className="w-full h-auto object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.isFree ? (
                  <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-500 text-black shadow-lg tracking-wider">
                    FREE EBOOK
                  </span>
                ) : discountPercent > 0 ? (
                  <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-[#D4AF37] text-black shadow-lg tracking-wider">
                    SAVE {discountPercent}%
                  </span>
                ) : null}
              </div>
            </div>

            {/* Quick Metadata Box */}
            <div className="w-full max-w-sm mt-6 p-4 rounded-xl bg-[#11141B] border border-[#212733] grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Format: <strong>{product.format}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                <span>Pages: <strong>{product.pageCount}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>Language: <strong>{product.language}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Size: <strong>{product.fileSize}</strong></span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="w-full max-w-sm mt-4 p-3.5 rounded-xl bg-[#0E1116] border border-[#1E2532] flex items-center gap-2.5 text-[11px] text-gray-400">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span>Direct personal digital license. Files unlocked immediately upon payment verification.</span>
            </div>
          </div>

          {/* Right: Product Details, Pricing, & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category & Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-2.5 py-1 rounded border border-[#D4AF37]/20">
                {category?.name || 'Practical Skills'}
              </span>
              {product.tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] text-gray-400 bg-[#161B23] px-2 py-0.5 rounded border border-[#222936]">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif-luxury leading-tight">
                {product.title}
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Written and curated by <strong className="text-gray-200">{product.author}</strong>
              </p>
            </div>

            {/* Price Box & Action Buttons */}
            <div className="p-6 rounded-2xl bg-[#121620] border border-[#262F3E] space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                    {product.isFree ? 'License Fee' : 'Current Payable Price'}
                  </span>
                  {product.isFree ? (
                    <span className="text-3xl font-extrabold text-emerald-400">
                      FREE OF CHARGE
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#D4AF37]">
                        Rs. {payablePrice.toLocaleString()}
                      </span>
                      {product.salePrice && product.salePrice < product.regularPrice && (
                        <span className="text-base text-gray-500 line-through">
                          Rs. {product.regularPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!product.isFree && (
                  <div className="text-right text-[11px] text-gray-400">
                    <span className="text-emerald-400 font-semibold block">JazzCash & Easypaisa</span>
                    <span>Manual payment supported</span>
                  </div>
                )}
              </div>

              {/* Promotional Code Hint */}
              {!product.isFree && (
                <div className="p-3 rounded-lg bg-[#181F2B] border border-[#2C3748] flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Have a coupon? Use <strong>WELCOME10</strong> at checkout for 10% off.</span>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                {product.isFree ? (
                  <button
                    onClick={() => {
                      onAddToCart(product);
                      onNavigate('checkout');
                    }}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/15 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Get Free Ebook Immediately</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onNavigate('checkout');
                      }}
                      className="flex-1 py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Buy Now (Instant Checkout)</span>
                    </button>

                    <button
                      onClick={() => onAddToCart(product)}
                      className="py-4 px-6 rounded-xl font-semibold text-sm bg-[#1A202C] hover:bg-[#232B3A] text-white border border-[#2B3545] transition-all flex items-center justify-center gap-2"
                    >
                      <span>Add to Cart</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Short Description */}
            <p className="text-sm text-gray-300 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* What You Will Learn */}
            {product.whatYouWillLearn.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
                  <span>What You Will Learn</span>
                </h3>
                <ul className="space-y-2.5">
                  {product.whatYouWillLearn.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                      <span className="text-[#D4AF37] font-bold mt-0.5">•</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Table of Contents / Chapters */}
            {product.contents.length > 0 && (
              <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D4AF37]" />
                  <span>Table of Contents</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                  {product.contents.map((ch, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#161B23] border border-[#242C39] flex items-center gap-2">
                      <span className="text-[#D4AF37] font-mono text-[11px]">{idx + 1}.</span>
                      <span className="truncate">{ch}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Excerpt Preview */}
            {product.sampleExcerpt && (
              <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-2">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Excerpt from the Book
                </h3>
                <blockquote className="text-sm text-gray-300 italic border-l-2 border-[#D4AF37] pl-4 py-1 leading-relaxed">
                  "{product.sampleExcerpt}"
                </blockquote>
              </div>
            )}

            {/* Full Description */}
            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
              <h3 className="text-base font-bold text-white">About this Publication</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {product.fullDescription}
              </p>
            </div>

          </div>

        </div>

        {/* Related Ebooks */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-[#181D26]">
            <h3 className="text-xl sm:text-2xl font-bold text-white font-serif-luxury mb-6">
              Related Ebooks in this Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    onSelectProduct(rel);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-xl bg-[#11141B] border border-[#212733] hover:border-[#D4AF37]/50 cursor-pointer transition-all flex gap-4 items-center group"
                >
                  <img
                    src={rel.coverUrl}
                    alt={rel.title}
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#D4AF37] line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-[#D4AF37] font-bold mt-2">
                      {rel.isFree ? 'FREE' : `Rs. ${(rel.salePrice ?? rel.regularPrice).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
