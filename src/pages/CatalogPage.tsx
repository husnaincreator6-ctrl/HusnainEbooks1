import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  BookOpen, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { Product, Category } from '../types';

interface CatalogPageProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialFreeOnly?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (page: string, params?: any) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  categories,
  initialCategory,
  initialFreeOnly = false,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onAddToCart,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [filterType, setFilterType] = useState<'all' | 'paid' | 'free'>(initialFreeOnly ? 'free' : 'all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'pages'>('featured');

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.isPublished);

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => p.categoryId === selectedCategory);
    }

    // Type filter
    if (filterType === 'free') {
      list = list.filter(p => p.isFree);
    } else if (filterType === 'paid') {
      list = list.filter(p => !p.isFree);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc') {
        const priceA = a.isFree ? 0 : (a.salePrice ?? a.regularPrice);
        const priceB = b.isFree ? 0 : (b.salePrice ?? b.regularPrice);
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = a.isFree ? 0 : (a.salePrice ?? a.regularPrice);
        const priceB = b.isFree ? 0 : (b.salePrice ?? b.regularPrice);
        return priceB - priceA;
      }
      if (sortBy === 'pages') {
        return b.pageCount - a.pageCount;
      }
      // default: featured first, then newest
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, filterType, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
            Explore Publications
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif-luxury">
            Digital Ebooks Catalog
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Browse our full library of practical ebooks. Learn high-income skills with instant delivery and secure manual checkout.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#11141B] border border-[#212733] rounded-2xl p-4 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by title, topic, or tag..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-[#161B23] p-1 rounded-xl border border-[#262E3B] self-start lg:self-auto">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'all' 
                    ? 'bg-[#D4AF37] text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All ({products.filter(p => p.isPublished).length})
              </button>
              <button
                onClick={() => setFilterType('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterType === 'paid' 
                    ? 'bg-[#D4AF37] text-black shadow-sm' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Paid ({products.filter(p => !p.isFree && p.isPublished).length})
              </button>
              <button
                onClick={() => setFilterType('free')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                  filterType === 'free' 
                    ? 'bg-emerald-500 text-black shadow-sm font-bold' 
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Free ({products.filter(p => p.isFree && p.isPublished).length})</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#161B23] border border-[#262E3B] text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="pages">Length: Most Pages</option>
              </select>
            </div>

          </div>

          {/* Categories Pill Bar */}
          <div className="pt-2 border-t border-[#1C222D] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#202733] text-white border border-[#D4AF37]/40'
                  : 'bg-[#151921] text-gray-400 hover:text-white hover:bg-[#1A202A]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#202733] text-white border border-[#D4AF37]/40'
                    : 'bg-[#151921] text-gray-400 hover:text-white hover:bg-[#1A202A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
          <span>Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'publication' : 'publications'}</span>
          {(selectedCategory !== 'all' || filterType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterType('all');
                onSearchChange('');
              }}
              className="text-[#D4AF37] hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#11141B] border border-[#212733] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No ebooks match your selection</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-5">
              Try adjusting your search query, switching categories, or clearing active filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setFilterType('all');
                onSearchChange('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold hover:bg-[#E5C158] transition-colors"
            >
              Show All Ebooks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
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
                    {/* Cover */}
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

                    {/* Metadata */}
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

                  {/* Pricing and Action */}
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
                        Details
                      </button>

                      {product.isFree ? (
                        <button
                          onClick={() => {
                            onAddToCart(product);
                            onNavigate('checkout');
                          }}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-colors"
                        >
                          Claim Free
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
        )}

      </div>
    </div>
  );
};
