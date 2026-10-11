import React from 'react';
import { X, Shield, FileText, RefreshCw, Download } from 'lucide-react';

export type PolicyType = 'privacy' | 'terms' | 'refund' | 'delivery' | null;

interface PolicyModalsProps {
  activePolicy: PolicyType;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({ activePolicy, onClose }) => {
  if (!activePolicy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#12151B] border border-[#262D38] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202733] bg-[#0E1116]">
          <div className="flex items-center gap-3">
            {activePolicy === 'privacy' && <Shield className="w-5 h-5 text-[#D4AF37]" />}
            {activePolicy === 'terms' && <FileText className="w-5 h-5 text-[#D4AF37]" />}
            {activePolicy === 'refund' && <RefreshCw className="w-5 h-5 text-[#D4AF37]" />}
            {activePolicy === 'delivery' && <Download className="w-5 h-5 text-[#D4AF37]" />}
            
            <h3 className="text-lg font-bold text-white tracking-wide">
              {activePolicy === 'privacy' && 'Privacy Policy'}
              {activePolicy === 'terms' && 'Terms and Conditions'}
              {activePolicy === 'refund' && 'Refund Policy'}
              {activePolicy === 'delivery' && 'Digital Delivery Policy'}
            </h3>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1A202C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-300 leading-relaxed">
          {activePolicy === 'privacy' && (
            <>
              <p className="font-semibold text-white">Last updated: October 2025</p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">1. Information We Collect</h4>
              <p>
                At <strong>Husnain Ebooks</strong>, we only collect customer details strictly required to process your order, deliver purchased digital products, and verify payments. This includes your full name, email address, WhatsApp/mobile number, and transaction references for manual payment methods (JazzCash / Easypaisa).
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">2. Payment Proof and Screenshots</h4>
              <p>
                Receipt screenshots uploaded during manual payment verification are stored in private server storage accessible solely by authorized administrators. We never ask for, collect, or store your mobile wallet PIN, OTP, or password.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">3. How Your Data Is Protected</h4>
              <p>
                All digital delivery links use secure tokens. Customer information is never sold, traded, or shared with third-party advertisers. Download events and IP addresses are recorded strictly to prevent fraudulent link abuse.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">4. Your Rights</h4>
              <p>
                You may request an update or removal of your historical contact record at any time by contacting our support team at <span className="text-[#D4AF37]">husnaincreator6@gmail.com</span>.
              </p>
            </>
          )}

          {activePolicy === 'terms' && (
            <>
              <p className="font-semibold text-white">Last updated: October 2025</p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">1. Personal License Agreement</h4>
              <p>
                All ebooks and digital resources purchased or claimed on <strong>Husnain Ebooks</strong> are granted for personal, non-commercial educational use by the purchasing individual. You may not resell, redistribute, sub-license, or upload these digital assets to public websites or torrent networks.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">2. Payment Verification Terms</h4>
              <p>
                Submitting a transaction reference ID or screenshot does not constitute instantaneous payment approval. Digital products are only unlocked after our administrative team matches the transaction against merchant records.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">3. Intellectual Property</h4>
              <p>
                All publications, logos, artwork, and descriptions are proprietary property of Muhammad Husnain and Husnain Ebooks.
              </p>
            </>
          )}

          {activePolicy === 'refund' && (
            <>
              <p className="font-semibold text-white">Last updated: October 2025</p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">1. Digital Products Nature</h4>
              <p>
                Due to the immediate intangible nature of digital ebooks (PDFs/EPUBs), sales are generally final once the digital file has been downloaded or read online.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">2. Eligible Refund Circumstances</h4>
              <p>
                We gladly issue full refunds under the following verified conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Accidental duplicate payments for the same order reference.</li>
                <li>Corrupted or missing digital file that our support team cannot resolve within 24 hours.</li>
                <li>Payment sent but the customer cancels before the administrator has approved or unlocked access.</li>
              </ul>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">3. How to Request a Refund</h4>
              <p>
                Contact us via WhatsApp at <strong>+92 324 7755484</strong> or email <strong>husnaincreator6@gmail.com</strong> with your Order ID and original payment receipt.
              </p>
            </>
          )}

          {activePolicy === 'delivery' && (
            <>
              <p className="font-semibold text-white">Last updated: October 2025</p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">1. Free Ebooks Delivery</h4>
              <p>
                Free resources are unlocked immediately upon submission of your customer name and email. You will receive an instant download link on screen and a copy via email.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">2. Paid Orders Manual Verification</h4>
              <p>
                Orders paid via JazzCash or Easypaisa undergo manual transaction verification. The typical verification window is <strong>1 to 3 hours during business hours (9:00 AM – 10:00 PM PKT)</strong>. Once verified, your status updates to Approved and files unlock automatically.
              </p>
              <h4 className="text-base font-bold text-[#D4AF37] pt-2">3. Lifetime Access</h4>
              <p>
                Once an order is approved, your access link remains active. You can re-download your files anytime using your order reference and email.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#202733] bg-[#0E1116] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#D4AF37] text-black hover:bg-[#E5C158] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
