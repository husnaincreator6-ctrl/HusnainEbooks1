import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  MessageCircle, 
  ArrowLeft,
  Eye,
  X,
  ExternalLink 
} from 'lucide-react';

interface OrderAccessPortalProps {
  initialToken?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderAccessPortal: React.FC<OrderAccessPortalProps> = ({
  initialToken,
  onNavigate
}) => {
  const [token, setToken] = useState<string>(initialToken || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lookup state by email & order ID
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupOrderId, setLookupOrderId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState('');

  // Online reader state
  const [activeReadingProduct, setActiveReadingProduct] = useState<any>(null);
  const [readerData, setReaderData] = useState<any>(null);
  const [readerLoading, setReaderLoading] = useState(false);

  // Load order by token
  const loadOrderByToken = async (accessToken: string) => {
    if (!accessToken) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/access/${accessToken}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid or expired order access link.');
        setOrder(null);
      } else {
        setOrder(data.order);
        setToken(accessToken);
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      loadOrderByToken(initialToken);
    }
  }, [initialToken]);

  // Lookup by Email + Order ID
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim() || !lookupOrderId.trim()) return;

    setLookupLoading(true);
    setLookupMessage('');
    setError('');

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: lookupEmail.trim(),
          orderId: lookupOrderId.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'No matching order found for this email and Order Reference.');
      } else {
        setLookupMessage(data.message);
        loadOrderByToken(data.accessToken);
      }
    } catch (err) {
      setError('Failed to perform lookup. Please check your connection.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Open web reader
  const handleOpenReader = async (productId: string) => {
    setReaderLoading(true);
    try {
      const res = await fetch(`/api/read/${token}/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReaderData(data.readerData);
        setActiveReadingProduct(productId);
      } else {
        alert(data.error || 'Cannot open reader for this item.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReaderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Bookstore</span>
          </button>

          {order && (
            <button
              onClick={() => {
                setOrder(null);
                setToken('');
              }}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Lookup another order
            </button>
          )}
        </div>

        {/* If no order loaded, display lookup form */}
        {!order ? (
          <div className="max-w-lg mx-auto">
            <div className="p-8 rounded-3xl bg-[#11141B] border border-[#212733] shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-extrabold text-white font-serif-luxury">
                  Customer Access Portal
                </h1>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enter your order reference and email address to view payment status, read purchased ebooks, or download PDF files.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {lookupMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{lookupMessage}</span>
                </div>
              )}

              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Order Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HEB-49129"
                    value={lookupOrderId}
                    onChange={(e) => setLookupOrderId(e.target.value.toUpperCase())}
                    className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Customer Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. your.email@gmail.com"
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {lookupLoading ? 'Finding Order...' : 'Access My Ebooks'}
                </button>
              </form>

              <div className="pt-4 border-t border-[#1C222D] text-center text-[11px] text-gray-500">
                Need help finding your order reference? Message support on WhatsApp at{' '}
                <a href="https://wa.me/923247755484" target="_blank" rel="noreferrer" className="text-[#D4AF37] underline">
                  +92 324 7755484
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Active Order Portal View */
          <div className="space-y-8">
            
            {/* Order Status Header Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#11141B] border border-[#212733] shadow-2xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2532] pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#D4AF37] font-mono">ORDER #{order.id}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-white font-serif-luxury">
                    Order Access Portal
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Licensed to <strong>{order.customerName}</strong> ({order.customerEmail})
                  </p>
                </div>

                {/* Status Pill */}
                <div>
                  {order.paymentStatus === 'approved' ? (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVED & UNLOCKED</span>
                    </div>
                  ) : order.paymentStatus === 'submitted' || order.paymentStatus === 'under_review' ? (
                    <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>UNDER REVIEW (1-3 HOURS)</span>
                    </div>
                  ) : order.paymentStatus === 'rejected' ? (
                    <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>PAYMENT NOT VERIFIED</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>AWAITING PAYMENT PROOF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Explanation / Actions */}
              {order.paymentStatus === 'awaiting_payment' && (
                <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-700/40 flex items-center justify-between gap-4">
                  <div className="text-xs text-blue-200">
                    Your order is registered. Please submit your JazzCash or Easypaisa payment details to begin verification.
                  </div>
                  <button
                    onClick={() => onNavigate('payment', { orderId: order.id, accessToken: token })}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#E5C158] whitespace-nowrap"
                  >
                    Submit Payment Proof
                  </button>
                </div>
              )}

              {order.paymentStatus === 'rejected' && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/40 space-y-3">
                  <div className="text-xs text-red-200">
                    <strong>Review Notice:</strong> {order.publicNotes || 'Transaction reference could not be verified in our records.'}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onNavigate('payment', { orderId: order.id, accessToken: token })}
                      className="px-4 py-2 rounded-lg bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#E5C158]"
                    >
                      Update Reference & Re-Submit
                    </button>
                    <a
                      href="https://wa.me/923247755484"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold"
                    >
                      Contact WhatsApp Support
                    </a>
                  </div>
                </div>
              )}

              {order.paymentStatus === 'approved' && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-xs text-emerald-200 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Your payment was verified. You have lifetime access to read online or download your PDF editions below.
                  </span>
                </div>
              )}

              {/* Ebooks Included with Download & Read Buttons */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37]">
                  Purchased Digital Files ({order.items.length})
                </h3>

                <div className="space-y-3">
                  {order.items.map((item: any, idx: number) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-[#161B23] border border-[#232A36] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 rounded-lg bg-[#1E2532] border border-[#2A3446] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-snug">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>Format: {item.format}</span>
                            <span>•</span>
                            <span>Pages: {item.pageCount}</span>
                            <span>•</span>
                            <span>Size: {item.fileSize}</span>
                          </div>
                        </div>
                      </div>

                      {/* Download / Read Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {order.isEntitled ? (
                          <>
                            <button
                              onClick={() => handleOpenReader(item.productId)}
                              className="px-3.5 py-2 rounded-xl bg-[#202734] hover:bg-[#2A3444] text-gray-200 text-xs font-semibold border border-[#2E394C] transition-colors flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Read Online</span>
                            </button>

                            <a
                              href={item.downloadUrl}
                              className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/10"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </a>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 font-semibold italic flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Unlocks upon approval</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Support and Assistance Card */}
            <div className="p-6 rounded-2xl bg-[#0E1116] border border-[#1E2532] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <span>Need priority assistance with your download? Connect directly with our team on WhatsApp.</span>
              </div>
              <a
                href="https://wa.me/923247755484"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold whitespace-nowrap transition-colors"
              >
                +92 324 7755484
              </a>
            </div>

          </div>
        )}

        {/* In-Browser Reader Modal */}
        {activeReadingProduct && readerData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#11141B] border border-[#262E3B] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
              {/* Reader Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2532] bg-[#0C0E12]">
                <div>
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {readerData.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    by {readerData.author} • Licensed to {readerData.licensedTo}
                  </p>
                </div>
                <button
                  onClick={() => setActiveReadingProduct(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1A202A]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Reader Content Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 text-sm text-gray-200 leading-relaxed font-sans max-w-3xl mx-auto">
                <div className="border-b border-[#1E2532] pb-6 space-y-3">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
                    Husnain Ebooks Reader Edition
                  </span>
                  <h2 className="text-2xl font-serif-luxury font-bold text-white">
                    {readerData.title}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Format: {readerData.format} • Pages: {readerData.pageCount} • Language: {readerData.language}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-bold text-[#D4AF37]">Publication Overview</h4>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {readerData.fullDescription}
                  </p>
                </div>

                {readerData.whatYouWillLearn?.length > 0 && (
                  <div className="p-5 rounded-xl bg-[#161B23] border border-[#222A36] space-y-3">
                    <h4 className="text-sm font-bold text-white">Core Learning Objectives</h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {readerData.whatYouWillLearn.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#D4AF37] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {readerData.contents?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-[#D4AF37]">Table of Contents</h4>
                    <div className="space-y-1.5">
                      {readerData.contents.map((ch: string, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-[#141820] border border-[#1E2530] text-xs text-gray-300">
                          {ch}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {readerData.sampleExcerpt && (
                  <div className="p-5 rounded-xl bg-[#181F2C] border border-[#29364A] space-y-2">
                    <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                      Excerpt Reading Sample
                    </h4>
                    <blockquote className="text-sm text-gray-200 italic border-l-2 border-[#D4AF37] pl-4 py-1 leading-relaxed">
                      "{readerData.sampleExcerpt}"
                    </blockquote>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#0D1016] border border-[#1C222D] text-center text-xs text-gray-400">
                  <span>To save a permanent offline copy on your device, download the complete PDF file from the order screen.</span>
                </div>
              </div>

              {/* Reader Footer */}
              <div className="px-6 py-3 border-t border-[#1E2532] bg-[#0C0E12] flex items-center justify-between text-xs text-gray-400">
                <span>© Husnain Ebooks • Protected Edition</span>
                <button
                  onClick={() => setActiveReadingProduct(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#202734] hover:bg-[#2A3444] text-white"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
