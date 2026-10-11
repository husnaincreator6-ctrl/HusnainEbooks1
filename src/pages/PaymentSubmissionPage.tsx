import React, { useState, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Upload, 
  ShieldAlert, 
  AlertCircle, 
  Lock, 
  ArrowRight, 
  Image as ImageIcon,
  CheckCircle2,
  Clock 
} from 'lucide-react';
import { PaymentMethod } from '../types';

interface PaymentSubmissionPageProps {
  orderId: string;
  accessToken: string;
  initialMethod?: PaymentMethod;
  onPaymentSubmitted: (orderId: string, accessToken: string) => void;
  onNavigate: (page: string) => void;
}

export const PaymentSubmissionPage: React.FC<PaymentSubmissionPageProps> = ({
  orderId,
  accessToken,
  initialMethod = 'jazzcash',
  onPaymentSubmitted,
  onNavigate
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'jazzcash' | 'easypaisa'>(
    initialMethod === 'easypaisa' ? 'easypaisa' : 'jazzcash'
  );
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch live order summary to show exact amount
  const [orderData, setOrderData] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/access/${accessToken}`);
        const data = await res.json();
        if (data.success) {
          setOrderData(data.order);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoadingOrder(false);
      }
    }
    loadOrder();
  }, [accessToken]);

  // Recipient numbers as required in the brief
  const paymentDetails = {
    jazzcash: {
      number: '03247755484',
      name: 'Husnain Ebooks Official',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300'
    },
    easypaisa: {
      number: '03446730755',
      name: 'Husnain Ebooks Official',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
    }
  };

  const currentDetails = paymentDetails[selectedMethod];

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(currentDetails.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file is too large. Please upload a screenshot under 8MB.');
      return;
    }

    setReceiptFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!transactionRef.trim() || transactionRef.trim().length < 3) {
      setError('Please enter your Transaction Reference ID from your payment app.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          transactionReference: transactionRef.trim(),
          receiptImageBase64: receiptImage
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to submit payment proof. Please try again.');
        setSubmitting(false);
        return;
      }

      onPaymentSubmitted(orderId, accessToken);
    } catch (err: any) {
      setError('Failed to connect to verification server. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Step 2: Manual Payment Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif-luxury">
            Submit Payment Proof for Order #{orderId}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Send the exact order amount to the selected payment account. Complete the transaction in your payment app, then enter the transaction reference and upload a screenshot of your payment receipt.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Account Card */}
        <div className="p-6 rounded-2xl bg-[#121620] border border-[#273244] shadow-2xl mb-8 space-y-6">
          
          {/* Method Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-[#202734] pb-4">
            <span className="text-xs font-semibold text-gray-400">Select Provider:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('jazzcash')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethod === 'jazzcash'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-[#181E29] text-gray-400 hover:text-white'
                }`}
              >
                JazzCash
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('easypaisa')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedMethod === 'easypaisa'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'bg-[#181E29] text-gray-400 hover:text-white'
                }`}
              >
                Easypaisa
              </button>
            </div>
          </div>

          {/* Amount Due Banner */}
          <div className="p-4 rounded-xl bg-[#181F2B] border border-[#2C384C] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-gray-400 block uppercase tracking-wider">
                Exact Amount Due
              </span>
              <span className="text-2xl font-extrabold text-[#D4AF37]">
                Rs. {orderData ? orderData.finalTotal.toLocaleString() : '...'}
              </span>
            </div>
            <div className="text-right text-[11px] text-gray-400">
              <span>Order Reference:</span>
              <strong className="block text-white font-mono">{orderId}</strong>
            </div>
          </div>

          {/* Recipient Account Details with One-Click Copy */}
          <div className="p-5 rounded-xl bg-[#0D1016] border border-[#222A38] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block mb-1">Recipient Account Number:</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37] font-mono tracking-wider">
                  {currentDetails.number}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyNumber}
                className="px-4 py-2.5 rounded-xl bg-[#1C2330] hover:bg-[#252E3E] text-white border border-[#2F3A4E] text-xs font-semibold flex items-center gap-2 transition-colors active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#D4AF37]" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 border-t border-[#1C222E] flex justify-between items-center text-xs text-gray-400">
              <span>Account Title / Merchant:</span>
              <span className="font-semibold text-gray-200">{currentDetails.name}</span>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C2330] text-[#D4AF37] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
              <span>Open your <strong>{selectedMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'}</strong> app on your mobile device.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C2330] text-[#D4AF37] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
              <span>Send <strong>Rs. {orderData ? orderData.finalTotal.toLocaleString() : 'exact total'}</strong> to <strong>{currentDetails.number}</strong> ({currentDetails.name}).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1C2330] text-[#D4AF37] flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
              <span>Copy your Transaction ID (TID) and take a screenshot of the completed payment receipt.</span>
            </div>
          </div>

          {/* Strict Security Reminder */}
          <div className="p-3 bg-[#0B0D12] rounded-xl border border-red-900/30 text-[11px] text-gray-400 flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Never share your secret PIN, OTP, or passwords. Husnain Ebooks will never ask for them.</span>
          </div>

        </div>

        {/* Proof Submission Form */}
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider text-[#D4AF37] border-b border-[#1C222D] pb-3">
            Enter Verification Evidence
          </h3>

          {/* Transaction Reference Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Transaction ID / Reference Number (TID) <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 293847591024 or 09283746"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] font-mono text-sm"
            />
            <span className="text-[10px] text-gray-500 mt-1 block">
              Found on the SMS from JazzCash (8558) or Easypaisa (3737) and in your app transaction receipt.
            </span>
          </div>

          {/* Receipt Screenshot Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Payment Receipt Screenshot (Recommended for instant approval)
            </label>
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {receiptImage ? (
              <div className="relative p-4 rounded-xl bg-[#161B23] border border-[#2E3747] flex items-center gap-4">
                <img 
                  src={receiptImage} 
                  alt="Receipt Preview" 
                  className="w-20 h-24 object-cover rounded-lg border border-[#3A4559]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Attached</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{receiptFileName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptImage(null);
                      setReceiptFileName('');
                    }}
                    className="mt-2 text-xs text-red-400 hover:underline"
                  >
                    Remove & Replace
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-xl bg-[#161B23] border-2 border-dashed border-[#262E3B] hover:border-[#D4AF37]/50 cursor-pointer text-center space-y-2 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#202734] mx-auto flex items-center justify-center text-[#D4AF37]">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-gray-200">
                  Click to Upload Receipt Screenshot
                </div>
                <div className="text-[10px] text-gray-500">
                  PNG, JPG, or JPEG up to 8MB
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-[#DFBA4E] to-[#D4AF37] text-black hover:brightness-110 shadow-xl shadow-[#D4AF37]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <span>Submitting for Verification...</span>
            ) : (
              <>
                <span>Submit Payment for Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            Note: Submitting a transaction reference registers your payment for review. Once verified against our merchant records, your ebook will be unlocked immediately.
          </p>
        </form>

      </div>
    </div>
  );
};
