import React from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MessageCircle, 
  Lock, 
  BookOpen, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { HusnainLogo } from './HusnainLogo';
import { PolicyType } from './PolicyModals';

interface FooterProps {
  onOpenPolicy: (type: PolicyType) => void;
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPolicy, onNavigate }) => {
  return (
    <footer className="bg-[#08090C] border-t border-[#191D26] text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <HusnainLogo 
              size="lg"
              onClick={() => onNavigate('home')}
            />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mt-3">
              Husnain Ebooks is a premium digital publication platform providing practical, battle-tested knowledge in freelancing, artificial intelligence, digital marketing, and financial mastery.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37] font-medium pt-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Official Manual JazzCash & Easypaisa Verification</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate('catalog')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  All Ebooks
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('catalog', { freeOnly: true })}
                  className="hover:text-emerald-400 text-emerald-400/90 font-medium transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Free Ebooks</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('portal')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Track Order / Access
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onNavigate('home');
                    setTimeout(() => {
                      document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal & Delivery
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Refund Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicy('delivery')}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  Digital Delivery Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>WhatsApp: +92 324 7755484</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>husnaincreator6@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span>Call: 0324-7755484</span>
              </li>
              <li className="pt-1">
                <span className="text-[11px] text-gray-500 block">
                  Support Hours: 9:00 AM – 10:00 PM PKT
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#161A22] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Husnain Ebooks. All rights reserved. Read. Learn. Grow.</p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#161B24] border border-[#232A36] text-[10px] text-amber-400 font-bold">
                JazzCash (03247755484)
              </span>
              <span className="px-2 py-0.5 rounded bg-[#161B24] border border-[#232A36] text-[10px] text-emerald-400 font-bold">
                Easypaisa (03446730755)
              </span>
            </div>

            <button
              onClick={() => onNavigate('admin')}
              className="text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors text-[11px]"
            >
              <Lock className="w-3 h-3" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
