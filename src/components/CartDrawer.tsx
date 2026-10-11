import React from 'react';
import { X, Trash2, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Product } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    if (item.isFree) return sum;
    return sum + (item.salePrice ?? item.regularPrice);
  }, 0);

  const hasPaidItems = items.some(i => !i.isFree);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#11141A] border-l border-[#222834] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2530] bg-[#0C0E12]">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Your Ebook Cart ({items.length})
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A202A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#181D26] border border-[#27303E] flex items-center justify-center mb-4 text-[#D4AF37]">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1">Your cart is empty</h3>
                <p className="text-sm text-gray-400 max-w-xs mb-6">
                  Explore practical ebooks in AI, Freelancing, Digital Marketing, and Personal Finance.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#E5C158] transition-colors"
                >
                  Browse Ebooks
                </button>
              </div>
            ) : (
              items.map((item) => {
                const payablePrice = item.isFree ? 0 : (item.salePrice ?? item.regularPrice);
                return (
                  <div 
                    key={item.id}
                    className="flex gap-4 p-3.5 bg-[#161A22] border border-[#232A36] rounded-xl hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <img 
                      src={item.coverUrl} 
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-lg flex-shrink-0 border border-[#2B3444]"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                            {item.title}
                          </h4>
                          <button 
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-500 hover:text-red-400 p-1 transition-colors flex-shrink-0"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{item.author}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1F2531]">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          {item.format} • {item.pageCount} Pages
                        </span>
                        <div>
                          {item.isFree ? (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              FREE
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              {item.salePrice && item.salePrice < item.regularPrice && (
                                <span className="text-xs text-gray-500 line-through">
                                  Rs. {item.regularPrice.toLocaleString()}
                                </span>
                              )}
                              <span className="text-sm font-bold text-[#D4AF37]">
                                Rs. {payablePrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#1E2530] bg-[#0C0E12] space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Selected Ebooks</span>
                  <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#1C212B]">
                  <span className="text-base font-semibold text-white">Estimated Subtotal</span>
                  <span className="text-xl font-bold text-[#D4AF37]">
                    {hasPaidItems ? `Rs. ${subtotal.toLocaleString()}` : 'FREE'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#141820] p-2.5 rounded-lg border border-[#202733]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Instant delivery for free items • JazzCash & Easypaisa for paid orders</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
