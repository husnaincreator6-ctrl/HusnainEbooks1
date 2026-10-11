import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  BookOpen, 
  MessageCircle, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldCheck, 
  Mail,
  RefreshCw 
} from 'lucide-react';

interface ThankYouPageProps {
  orderId: string;
  accessToken: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ThankYouPage: React.FC<ThankYouPageProps> = ({
  orderId,
  accessToken,
  onNavigate
}) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/access/${accessToken}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [accessToken]);

  const copyOrderRef = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C0E] text-white flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading order status...</p>
        </div>
      </div>
    );
  }

  const isFree = order?.paymentMethod === 'free' || order?.finalTotal === 0;
  const isApproved = order?.paymentStatus === 'approved';
  const isSubmitted = order?.paymentStatus === 'submitted' || order?.paymentStatus === 'under_review';
  const isAwaitingPayment = order?.paymentStatus === 'awaiting_payment';

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status Card Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#11141B] border border-[#212733] shadow-2xl text-center space-y-6">
          
          {/* Status Badge Icon */}
          <div className="flex justify-center">
            {isApproved ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            ) : isFree ? (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Download className="w-9 h-9" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-9 h-9" />
              </div>
            )}
          </div>

          {/* Headline & Description depending on actual verified state */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
              {isApproved 
                ? (isFree ? 'Your Free Ebook Is Ready!' : 'Payment Approved — Ebooks Unlocked!')
                : 'Thank You for Your Order!'}
            </h1>

            <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto leading-relaxed">
              {isApproved ? (
                'Your digital entitlement is active. You can now download the complete PDF or read directly in our browser reader.'
              ) : isSubmitted ? (
                'Your payment details have been submitted successfully. Your order is awaiting verification. We will unlock your ebook after your payment has been approved.'
              ) : (
                'Your order has been registered. Please send the payment via JazzCash or Easypaisa to proceed with verification.'
              )}
            </p>
          </div>

          {/* Reference Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#161B23] border border-[#262E3B] text-xs">
            <span className="text-gray-400">Order Reference:</span>
            <span className="font-bold text-white font-mono">{orderId}</span>
            <button 
              onClick={copyOrderRef}
              className="p-1 text-gray-400 hover:text-[#D4AF37] transition-colors"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Order Details Grid */}
          <div className="p-5 rounded-2xl bg-[#0E1116] border border-[#1E2532] text-xs space-y-3 text-left">
            <div className="flex justify-between border-b border-[#181D26] pb-2">
              <span className="text-gray-400">Recipient Email:</span>
              <span className="font-semibold text-white">{order?.customerEmail}</span>
            </div>

            <div className="flex justify-between border-b border-[#181D26] pb-2">
              <span className="text-gray-400">Order Amount:</span>
              <span className="font-bold text-[#D4AF37]">
                {order?.finalTotal === 0 ? 'FREE' : `Rs. ${order?.finalTotal.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#181D26] pb-2">
              <span className="text-gray-400">Payment Method:</span>
              <span className="font-semibold text-white uppercase">{order?.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Order Status:</span>
              <div>
                {isApproved ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    APPROVED & UNLOCKED
                  </span>
                ) : isSubmitted ? (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    AWAITING VERIFICATION (UNDER REVIEW)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    AWAITING PAYMENT SUBMISSION
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ebooks List in this Order */}
          <div className="text-left space-y-3">
            <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Included Ebooks
            </div>
            <div className="space-y-2">
              {order?.items?.map((item: any, idx: number) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#161B23] border border-[#232A36] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[10px] text-gray-400">{item.format || 'PDF'} Digital License</span>
                    </div>
                  </div>

                  {isApproved && (
                    <a
                      href={`/api/download/${accessToken}/${item.productId}`}
                      className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#E5C158] transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions & Next Steps */}
          <div className="pt-4 border-t border-[#1C222D] flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onNavigate('portal', { token: accessToken })}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl font-bold text-xs bg-[#1C2330] hover:bg-[#252E3E] text-white border border-[#2B3545] transition-colors flex items-center justify-center gap-2"
            >
              <span>View Live Order Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="https://wa.me/923247755484"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto py-3.5 px-5 rounded-xl font-bold text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>

            <button
              onClick={() => onNavigate('catalog')}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition-colors"
            >
              Browse More Ebooks
            </button>
          </div>

          {/* Email Confirmation Notice */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2">
            <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>A confirmation notification has been dispatched to <strong>{order?.customerEmail}</strong></span>
          </div>

        </div>

      </div>
    </div>
  );
};
