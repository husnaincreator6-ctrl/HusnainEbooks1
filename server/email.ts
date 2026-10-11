import { Order } from '../src/types.js';
import { db } from './db.js';

export interface SmtpConfigStatus {
  isConfigured: boolean;
  missingFields: string[];
  host?: string;
  from?: string;
}

export function getSmtpStatus(): SmtpConfigStatus {
  const host = process.env.SMTP_HOST || '';
  const port = process.env.SMTP_PORT || '';
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || '';

  const missing: string[] = [];
  if (!host) missing.push('SMTP_HOST');
  if (!port) missing.push('SMTP_PORT');
  if (!user) missing.push('SMTP_USER');
  if (!pass) missing.push('SMTP_PASS');

  return {
    isConfigured: missing.length === 0,
    missingFields: missing,
    host: host || undefined,
    from: from || 'Husnain Ebooks <husnaincreator6@gmail.com>'
  };
}

function getBaseUrl(): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

function getEmailWrapper(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0A0C0E; color: #E5E7EB; margin: 0; padding: 24px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #12151A; border: 1px solid #2A303C; border-radius: 12px; overflow: hidden; }
    .header { background-color: #0A0C0E; padding: 32px 24px; text-align: center; border-bottom: 2px solid #D4AF37; }
    .brand-title { font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #FFFFFF; margin: 0; }
    .brand-tagline { font-size: 12px; letter-spacing: 3px; color: #D4AF37; margin-top: 6px; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .cta-btn { display: inline-block; background: #D4AF37; color: #000000; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .order-box { background-color: #181D24; border: 1px solid #252D3A; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .order-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #202633; font-size: 14px; }
    .footer { text-align: center; font-size: 12px; color: #6B7280; padding: 20px; border-top: 1px solid #1E242E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">HUSNAIN EBOOKS</div>
      <div class="brand-tagline">READ • LEARN • GROW</div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>Official Digital Bookstore • WhatsApp Support: +92 324 7755484</p>
      <p>© ${new Date().getFullYear()} Husnain Ebooks. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendOrderSubmittedEmail(order: Order): Promise<void> {
  const baseUrl = getBaseUrl();
  const settings = db.getSettings();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;
  const paymentNumber = order.paymentMethod === 'jazzcash' ? settings.jazzcashNumber : settings.easypaisaNumber;
  const paymentName = order.paymentMethod === 'jazzcash' ? settings.jazzcashAccountName : settings.easypaisaAccountName;
  const methodLabel = order.paymentMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa';

  const body = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Order Awaiting Payment Reference</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>Thank you for placing your order at <strong>Husnain Ebooks</strong>. Your order is registered under reference <strong>${order.id}</strong>.</p>
    
    <div class="order-box">
      <div style="font-size: 13px; color: #9CA3AF; margin-bottom: 8px;">ORDER SUMMARY</div>
      ${order.items.map(item => `
        <div class="order-row">
          <span>${item.title}</span>
          <span>Rs. ${item.price.toLocaleString()}</span>
        </div>
      `).join('')}
      ${order.discount > 0 ? `
        <div class="order-row" style="color: #34D399;">
          <span>Promo Discount</span>
          <span>-Rs. ${order.discount.toLocaleString()}</span>
        </div>
      ` : ''}
      <div class="order-row" style="font-weight: 700; color: #F3F4F6; border-bottom: none; font-size: 16px; margin-top: 6px;">
        <span>Total Payable:</span>
        <span style="color: #D4AF37;">Rs. ${order.finalTotal.toLocaleString()}</span>
      </div>
    </div>

    <h3 style="color: #FBBF24; margin-bottom: 8px;">Next Step: Send Payment</h3>
    <p>Please send the exact amount of <strong>Rs. ${order.finalTotal.toLocaleString()}</strong> to:</p>
    <div style="background-color: #212732; border: 1px dashed #D4AF37; padding: 14px; border-radius: 6px; margin: 12px 0;">
      <div><strong>Payment Method:</strong> ${methodLabel}</div>
      <div><strong>Account Number:</strong> <span style="color: #D4AF37; font-size: 18px; font-weight: 700;">${paymentNumber}</span></div>
      <div><strong>Account Name:</strong> ${paymentName}</div>
    </div>
    
    <p>Once sent, please submit your transaction reference ID and screenshot on your order page:</p>
    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn">Submit Payment Proof & View Order</a>
    </div>
    <p style="font-size: 13px; color: #9CA3AF;">Link: <a href="${accessUrl}" style="color: #D4AF37;">${accessUrl}</a></p>
  `;

  const html = getEmailWrapper(`Husnain Ebooks - Order ${order.id} Confirmation`, body);
  
  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Husnain Ebooks: Order ${order.id} Payment Instructions`,
    type: 'order_submitted',
    contentPreview: `Order ${order.id} submitted for Rs. ${order.finalTotal}. Please send payment to ${methodLabel} ${paymentNumber}.`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}

export async function sendPaymentReceivedEmail(order: Order): Promise<void> {
  const baseUrl = getBaseUrl();
  const settings = db.getSettings();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;

  const body = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Payment Submitted for Verification</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>We have successfully received your payment proof for Order <strong>${order.id}</strong>.</p>
    
    <div class="order-box">
      <div><strong>Transaction Reference:</strong> ${order.transactionReference || 'Uploaded'}</div>
      <div><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</div>
      <div><strong>Amount:</strong> Rs. ${order.finalTotal.toLocaleString()}</div>
      <div><strong>Status:</strong> <span style="color: #FBBF24;">Under Review</span></div>
    </div>

    <p>Our team verifies submissions promptly (typically within ${settings.verificationPolicyHours}). As soon as your payment is verified, you will receive an instant email notification and your digital ebook will be unlocked.</p>
    
    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn">Check Live Order Status</a>
    </div>
  `;

  const html = getEmailWrapper(`Husnain Ebooks - Payment Received for ${order.id}`, body);

  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Payment Proof Received for Order ${order.id} — Under Review`,
    type: 'payment_received',
    contentPreview: `Payment proof received for Order ${order.id} (Ref: ${order.transactionReference}). Verification in progress.`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}

export async function sendOrderApprovedEmail(order: Order): Promise<void> {
  const baseUrl = getBaseUrl();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;

  const body = `
    <h2 style="color: #34D399; margin-top: 0;">Payment Approved — Your Ebooks Are Unlocked!</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>Great news! Your payment for Order <strong>${order.id}</strong> has been officially approved. Your digital ebook files and online reader are now ready.</p>
    
    <div class="order-box">
      <div style="font-size: 13px; color: #9CA3AF; margin-bottom: 8px;">UNLOCKED PRODUCTS:</div>
      ${order.items.map(item => `
        <div style="padding: 8px 0; border-bottom: 1px solid #202633;">
          <strong style="color: #FFFFFF;">${item.title}</strong>
        </div>
      `).join('')}
    </div>

    <p>You can read your ebooks directly inside your secure reader or download the complete PDF versions anytime.</p>
    
    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn" style="background-color: #34D399; color: #0A0C0E;">Access & Download Ebooks Now</a>
    </div>
    
    <p style="font-size: 13px; color: #9CA3AF;">Your private access portal link: <br/><a href="${accessUrl}" style="color: #D4AF37;">${accessUrl}</a></p>
  `;

  const html = getEmailWrapper(`Payment Approved - Access Your Ebook (${order.id})`, body);

  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Order ${order.id} Approved — Your Ebook is Ready!`,
    type: 'order_approved',
    contentPreview: `Payment verified. Access granted to: ${order.items.map(i => i.title).join(', ')}.`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}

export async function sendOrderRejectedEmail(order: Order, reason?: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;

  const body = `
    <h2 style="color: #F87171; margin-top: 0;">Payment Verification Notice</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>We reviewed the payment submission for Order <strong>${order.id}</strong>, but our team could not verify the transaction with the provided details.</p>
    
    <div class="order-box" style="border-color: #7F1D1D;">
      <strong style="color: #F87171;">Reason for Review Status:</strong>
      <p style="margin: 8px 0 0 0; color: #FCA5A5;">${reason || 'The transaction reference or screenshot could not be matched with our merchant account records. Please review the details and resubmit.'}</p>
    </div>

    <p>If you believe this was an error or sent the payment to another account, you can update your transaction reference and upload an updated screenshot directly through your order portal:</p>
    
    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn">Update Payment Details</a>
    </div>

    <p>Need immediate assistance? Contact our team directly on WhatsApp: <strong>+92 324 7755484</strong></p>
  `;

  const html = getEmailWrapper(`Order ${order.id} Payment Update`, body);

  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Order ${order.id}: Payment Verification Update`,
    type: 'order_rejected',
    contentPreview: `Payment verification issue: ${reason || 'Details could not be matched'}.`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}

export async function sendFreeClaimEmail(order: Order): Promise<void> {
  const baseUrl = getBaseUrl();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;

  const body = `
    <h2 style="color: #34D399; margin-top: 0;">Your Free Ebook Is Ready!</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>Thank you for claiming your free digital resource from <strong>Husnain Ebooks</strong>!</p>
    
    <div class="order-box">
      <div style="font-size: 13px; color: #9CA3AF; margin-bottom: 8px;">CLAIMED RESOURCE:</div>
      ${order.items.map(item => `
        <div style="padding: 6px 0;">
          <strong style="color: #FFFFFF;">${item.title}</strong>
        </div>
      `).join('')}
    </div>

    <p>Click below to open the online reader or download your complimentary PDF immediately:</p>
    
    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn" style="background-color: #34D399; color: #0A0C0E;">Download Free Ebook</a>
    </div>
    
    <p style="font-size: 13px; color: #9CA3AF;">Access link: <a href="${accessUrl}" style="color: #D4AF37;">${accessUrl}</a></p>
  `;

  const html = getEmailWrapper(`Your Free Ebook is Ready (${order.id})`, body);

  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Your Free Ebook from Husnain Ebooks is Ready!`,
    type: 'free_claimed',
    contentPreview: `Instant free claim verified for ${order.customerName} (${order.items.map(i => i.title).join(', ')}).`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}

export async function sendAccessResentEmail(order: Order): Promise<void> {
  const baseUrl = getBaseUrl();
  const accessUrl = `${baseUrl}/order/${order.accessToken}`;

  const body = `
    <h2 style="color: #FFFFFF; margin-top: 0;">Your Ebook Access Link (Resent)</h2>
    <p>Dear <strong>${order.customerName}</strong>,</p>
    <p>Here is the requested access link for Order <strong>${order.id}</strong>.</p>
    
    <div class="order-box">
      <div><strong>Status:</strong> ${order.paymentStatus.toUpperCase()}</div>
      <div><strong>Items:</strong> ${order.items.map(i => i.title).join(', ')}</div>
    </div>

    <div style="text-align: center;">
      <a href="${accessUrl}" class="cta-btn">Access Your Digital Ebooks</a>
    </div>
  `;

  const html = getEmailWrapper(`Ebook Access Link Resent (${order.id})`, body);

  db.logEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    subject: `Husnain Ebooks: Access Link for Order ${order.id}`,
    type: 'access_resent',
    contentPreview: `Resent access portal link for Order ${order.id}.`,
    status: getSmtpStatus().isConfigured ? 'sent' : 'simulated_fallback',
    sentAt: new Date().toISOString()
  });
}
