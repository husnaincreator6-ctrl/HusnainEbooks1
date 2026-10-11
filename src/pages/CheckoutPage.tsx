import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  Download 
} from 'lucide-react';
import { Product, PaymentMethod } from '../types';

interface CheckoutPageProps {
  cartItems: Product[];
  onRemoveItem: (productId: string) => void;
  onOrderCreated: (orderData: { orderId: string; accessToken: string; isFree: boolean; paymentMethod: PaymentMethod }) => void;
  onNavigate: (page: string) => void;
  onOpenPolicy: (type: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  onRemoveItem,
  onOrderCreated,
  onNavigate,
  onOpenPolicy
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('jazzcash');
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Calculate items subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    if (item.isFree) return sum;
    return sum + (item.salePrice ?? item.regularPrice);
  }, 0);

  const hasPaidItems = cartItems.some(i => !i.isFree);
  const isFreeClaimOnly = !hasPaidItems || subtotal === 0;

  const discountAmount = appliedPromo ? appliedPromo.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Validate Promo Code with Server
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');

    try {
      const res = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoInput.trim(),
          subtotal,
          customerEmail: customerEmail.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPromoError(data.error || 'Invalid or expired coupon.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data.promo);
        setPromoError('');
      }
    } catch (err: any) {
      setPromoError('Failed to validate coupon. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Please enter your full legal name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setFormError('Please provide a valid email address to receive your download link.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setFormError('Please enter a valid WhatsApp / Mobile number for order notifications.');
      return;
    }

    if (!termsAccepted) {
      setFormError('Please accept the Terms and Conditions to complete your order.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Your cart is empty. Please select an ebook first.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim(),
          productIds: cartItems.map(i => i.id),
          promoCode: appliedPromo?.code,
          paymentMethod: isFreeClaimOnly ? 'free' : paymentMethod,
          termsAccepted
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || 'Failed to submit order. Please try again.');
        setSubmitting(false);
        return;
      }

      onOrderCreated({
        orderId: data.orderId,
        accessToken: data.accessToken,
        isFree: Boolean(data.isFree),
        paymentMethod: isFreeClaimOnly ? 'free' : paymentMethod
      });
    } catch (err: any) {
      setFormError('Network error occurred. Please check your connection.');
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0C0E] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-[#11141B] border border-[#212733] p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-gray-400 mb-6">
            Please browse our catalog and select an ebook before proceeding to checkout.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#E5C158] transition-colors"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#D4AF37] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Form: Customer Details & Payment Selector */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                {isFreeClaimOnly ? 'Complimentary Access' : 'Secure Digital Order'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
                {isFreeClaimOnly ? 'Claim Your Free Ebook' : 'Checkout & Delivery Information'}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Your ebook files and private reader credentials will be sent to this email address.
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Section 1: Customer Info */}
              <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37] border-b border-[#1C222D] pb-3">
                  1. Customer Delivery Details
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Full Name <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Email Address (For File Delivery) <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. usman.work@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Double check your email: download link and order updates are sent here.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    WhatsApp / Mobile Number <span className="text-[#D4AF37]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03241234567 or +923241234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    Used for manual payment verification confirmation & rapid customer support.
                  </span>
                </div>
              </div>

              {/* Section 2: Payment Method */}
              <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37] border-b border-[#1C222D] pb-3">
                  2. Select Payment Method
                </h3>

                {isFreeClaimOnly ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <Download className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div className="text-xs text-emerald-200">
                      <strong>100% Free Claim:</strong> No payment details needed. Your download is unlocked immediately on the next screen.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400">
                      Choose your preferred mobile wallet. You will receive account instructions and submit your transaction screenshot on the next screen:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* JazzCash Option */}
                      <label 
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          paymentMethod === 'jazzcash'
                            ? 'bg-[#181D26] border-[#D4AF37] text-white shadow-md'
                            : 'bg-[#141820] border-[#222936] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="jazzcash"
                            checked={paymentMethod === 'jazzcash'}
                            onChange={() => setPaymentMethod('jazzcash')}
                            className="accent-[#D4AF37]"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">JazzCash</span>
                            <span className="text-[10px] text-gray-400">Recipient: 03247755484</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Manual
                        </span>
                      </label>

                      {/* Easypaisa Option */}
                      <label 
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          paymentMethod === 'easypaisa'
                            ? 'bg-[#181D26] border-[#D4AF37] text-white shadow-md'
                            : 'bg-[#141820] border-[#222936] text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="easypaisa"
                            checked={paymentMethod === 'easypaisa'}
                            onChange={() => setPaymentMethod('easypaisa')}
                            className="accent-[#D4AF37]"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">Easypaisa</span>
                            <span className="text-[10px] text-gray-400">Recipient: 03446730755</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          Manual
                        </span>
                      </label>
                    </div>

                    <div className="p-3 bg-[#0E1116] rounded-xl border border-[#1E2532] text-[11px] text-gray-400 flex items-start gap-2">
                      <Lock className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                      <span>Security Notice: We never ask for your account PIN, OTP, or mobile wallet password. All payments are sent through your official payment apps.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Terms Agreement */}
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-300 select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-[#D4AF37] rounded"
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onOpenPolicy('terms')}
                      className="text-[#D4AF37] underline hover:text-white"
                    >
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={() => onOpenPolicy('privacy')}
                      className="text-[#D4AF37] underline hover:text-white"
                    >
                      Privacy Policy
                    </button>
                    .
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black hover:brightness-110 shadow-xl shadow-[#D4AF37]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Processing Order...</span>
                ) : isFreeClaimOnly ? (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Confirm Free Claim & Unlock Ebook</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Payment Submission (Rs. {finalTotal.toLocaleString()})</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Summary: Order Items & Server Price Calculations */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] sticky top-28 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37] border-b border-[#1C222D] pb-3">
                Order Summary ({cartItems.length})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const payable = item.isFree ? 0 : (item.salePrice ?? item.regularPrice);
                  return (
                    <div 
                      key={item.id}
                      className="flex gap-3 p-2.5 rounded-xl bg-[#161B23] border border-[#232A36] items-center justify-between"
                    >
                      <img 
                        src={item.coverUrl} 
                        alt={item.title} 
                        className="w-12 h-16 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-semibold text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {item.format} Edition
                        </span>
                        <div className="mt-1 text-xs font-bold text-[#D4AF37]">
                          {item.isFree ? 'FREE' : `Rs. ${payable.toLocaleString()}`}
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Input (For Paid Orders) */}
              {!isFreeClaimOnly && (
                <div className="pt-3 border-t border-[#1C222D] space-y-2">
                  <span className="text-xs font-semibold text-gray-300 block">
                    Promotional Code
                  </span>
                  
                  {appliedPromo ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Code <strong>{appliedPromo.code}</strong> applied (-Rs. {appliedPromo.discountAmount})</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemovePromo}
                        className="text-gray-400 hover:text-white text-[11px] underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME10"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        className="flex-1 bg-[#161B23] border border-[#262E3B] text-xs text-white uppercase rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-4 py-2 bg-[#202733] hover:bg-[#2A3444] text-xs font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
                      >
                        {promoLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                  )}

                  {promoError && (
                    <span className="text-[11px] text-red-400 block">{promoError}</span>
                  )}
                </div>
              )}

              {/* Price Calculation Breakdown */}
              <div className="pt-4 border-t border-[#1C222D] space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{hasPaidItems ? `Rs. ${subtotal.toLocaleString()}` : 'Rs. 0'}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount:</span>
                    <span>-Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-[#202633] text-sm font-bold text-white">
                  <span>Total Payable:</span>
                  <span className="text-xl text-[#D4AF37]">
                    {hasPaidItems && finalTotal > 0 ? `Rs. ${finalTotal.toLocaleString()}` : 'FREE'}
                  </span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="pt-2 text-[11px] text-gray-500 space-y-1">
                <div>• Verified digital delivery with encrypted token link.</div>
                <div>• All files permanently accessible in your customer portal.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
