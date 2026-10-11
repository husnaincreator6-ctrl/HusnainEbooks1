import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { 
  verifyAdminPassword, 
  createAdminSession, 
  destroyAdminSession, 
  validateAdminSession, 
  requireAdmin, 
  getAdminEmail,
  updateAdminPassword 
} from './server/auth.js';
import { 
  getSmtpStatus,
  sendOrderSubmittedEmail, 
  sendPaymentReceivedEmail, 
  sendOrderApprovedEmail, 
  sendOrderRejectedEmail, 
  sendFreeClaimEmail,
  sendAccessResentEmail 
} from './server/email.js';
import { Order, OrderItem, Product } from './src/types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support large JSON payloads for base64 receipt screenshots & book assets
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Helper to generate readable Order ID: HEB-XXXXX
function generateOrderId(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `HEB-${randomDigits}`;
}

// -------------------------------------------------------------
// PUBLIC API ROUTES
// -------------------------------------------------------------

// 1. Get published products
app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { category, search, featured, free } = req.query;
    let products = db.getProducts(false); // Only published

    if (category && typeof category === 'string') {
      products = products.filter(p => p.categoryId === category);
    }
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured);
    }
    if (free === 'true') {
      products = products.filter(p => p.isFree);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Get single product by slug or id
app.get('/api/products/:slug', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = db.getProductBySlug(slug) || db.getProductById(slug);
    
    if (!product || !product.isPublished) {
      res.status(404).json({ success: false, error: 'Ebook not found or is currently unavailable.' });
      return;
    }

    // Get related products in the same category
    const related = db.getProducts(false)
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 3);

    res.json({ success: true, product, related });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get categories
app.get('/api/categories', (_req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Public store settings
app.get('/api/settings/public', (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    res.json({
      success: true,
      settings: {
        jazzcashNumber: settings.jazzcashNumber,
        jazzcashAccountName: settings.jazzcashAccountName,
        easypaisaNumber: settings.easypaisaNumber,
        easypaisaAccountName: settings.easypaisaAccountName,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        whatsappNumber: settings.whatsappNumber,
        verificationPolicyHours: settings.verificationPolicyHours,
        currencySymbol: settings.currencySymbol,
        currencyCode: settings.currencyCode,
        storeNotice: settings.storeNotice
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Server-side promo code validation
app.post('/api/promotions/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal, customerEmail } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, error: 'Promo code is required.' });
      return;
    }

    const promo = db.getPromotionByCode(code);
    if (!promo || !promo.isActive) {
      res.status(400).json({ success: false, error: 'Invalid or inactive promotional code.' });
      return;
    }

    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) {
      res.status(400).json({ success: false, error: 'This promotional code has not started yet.' });
      return;
    }
    if (promo.endDate && new Date(promo.endDate) < now) {
      res.status(400).json({ success: false, error: 'This promotional code has expired.' });
      return;
    }

    if (promo.totalRedemptionLimit && promo.currentRedemptions >= promo.totalRedemptionLimit) {
      res.status(400).json({ success: false, error: 'This promo code has reached its maximum redemptions limit.' });
      return;
    }

    const currentSubtotal = Number(subtotal) || 0;
    if (promo.minOrderValue && currentSubtotal < promo.minOrderValue) {
      res.status(400).json({ 
        success: false, 
        error: `Order subtotal must be at least Rs. ${promo.minOrderValue} to use this coupon.` 
      });
      return;
    }

    // Check per-customer limit if email provided
    if (customerEmail && promo.perCustomerLimit) {
      const orders = db.getOrdersByEmail(customerEmail);
      const usedCount = orders.filter(o => o.promoCode && o.promoCode.toUpperCase() === promo.code.toUpperCase()).length;
      if (usedCount >= promo.perCustomerLimit) {
        res.status(400).json({ success: false, error: 'You have already reached the redemption limit for this code.' });
        return;
      }
    }

    // Calculate discount amount safely server-side
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = Math.round((currentSubtotal * promo.discountValue) / 100);
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
    } else {
      discountAmount = Math.min(promo.discountValue, currentSubtotal);
    }

    res.json({
      success: true,
      promo: {
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Checkout submission (Server-Side Price Validation & Processing)
app.post('/api/checkout', async (req: Request, res: Response) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      productIds, 
      promoCode, 
      paymentMethod,
      termsAccepted 
    } = req.body;

    // Validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Please enter a valid full name.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail.trim())) {
      res.status(400).json({ success: false, error: 'Please enter a valid email address for delivery.' });
      return;
    }
    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim().length < 9) {
      res.status(400).json({ success: false, error: 'Please enter a valid WhatsApp or mobile number.' });
      return;
    }
    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ success: false, error: 'Cart cannot be empty.' });
      return;
    }
    if (!termsAccepted) {
      res.status(400).json({ success: false, error: 'You must accept the Terms and Conditions to proceed.' });
      return;
    }

    // Look up trusted prices and calculate server-side subtotal
    const items: OrderItem[] = [];
    let serverSubtotal = 0;
    let allAreFree = true;

    for (const pid of productIds) {
      const prod = db.getProductById(pid);
      if (!prod || !prod.isPublished) {
        res.status(400).json({ success: false, error: `Product ${pid} is currently unavailable.` });
        return;
      }
      
      const itemPrice = prod.isFree ? 0 : (prod.salePrice ?? prod.regularPrice);
      if (!prod.isFree && itemPrice > 0) {
        allAreFree = false;
      }

      items.push({
        productId: prod.id,
        title: prod.title,
        price: itemPrice,
        regularPrice: prod.regularPrice,
        isFree: prod.isFree,
        coverUrl: prod.coverUrl
      });
      serverSubtotal += itemPrice;
    }

    // Server-side promo calculation
    let serverDiscount = 0;
    let validatedPromo: string | undefined = undefined;

    if (promoCode && typeof promoCode === 'string' && promoCode.trim().length > 0 && !allAreFree) {
      const promo = db.getPromotionByCode(promoCode.trim());
      if (promo && promo.isActive) {
        const meetsMin = !promo.minOrderValue || serverSubtotal >= promo.minOrderValue;
        const notExpired = (!promo.startDate || new Date(promo.startDate) <= new Date()) && 
                           (!promo.endDate || new Date(promo.endDate) >= new Date());
        const withinLimit = !promo.totalRedemptionLimit || promo.currentRedemptions < promo.totalRedemptionLimit;

        if (meetsMin && notExpired && withinLimit) {
          validatedPromo = promo.code;
          if (promo.discountType === 'percentage') {
            serverDiscount = Math.round((serverSubtotal * promo.discountValue) / 100);
            if (promo.maxDiscount && serverDiscount > promo.maxDiscount) {
              serverDiscount = promo.maxDiscount;
            }
          } else {
            serverDiscount = Math.min(promo.discountValue, serverSubtotal);
          }
          db.incrementPromoRedemption(promo.id);
        }
      }
    }

    const finalTotal = Math.max(0, serverSubtotal - serverDiscount);
    const orderId = generateOrderId();
    const accessToken = `acc_${crypto.randomBytes(20).toString('hex')}`;
    const nowIso = new Date().toISOString();

    // Determine order type: Free Claim vs Manual Payment
    if (allAreFree || finalTotal === 0) {
      const freeOrder: Order = {
        id: orderId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone.trim(),
        items,
        subtotal: serverSubtotal,
        discount: serverDiscount,
        promoCode: validatedPromo,
        finalTotal: 0,
        paymentMethod: 'free',
        paymentStatus: 'approved',
        accessToken,
        history: [
          {
            timestamp: nowIso,
            action: 'FREE_CLAIM_GRANTED',
            note: 'Free ebook claimed and verified automatically.'
          }
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
        approvedAt: nowIso
      };

      db.saveOrder(freeOrder);

      // Grant instant digital entitlements
      for (const item of items) {
        db.grantEntitlement(orderId, freeOrder.customerEmail, item.productId);
      }

      // Automated email notification for free claim
      sendFreeClaimEmail(freeOrder).catch(err => console.error('Email error:', err));

      res.json({
        success: true,
        orderId: freeOrder.id,
        accessToken: freeOrder.accessToken,
        isFree: true,
        finalTotal: 0,
        status: 'approved'
      });
      return;
    }

    // Paid Order: JazzCash or Easypaisa
    const validMethod = (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') ? paymentMethod : 'jazzcash';

    const paidOrder: Order = {
      id: orderId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      items,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      promoCode: validatedPromo,
      finalTotal,
      paymentMethod: validMethod,
      paymentStatus: 'awaiting_payment',
      accessToken,
      history: [
        {
          timestamp: nowIso,
          action: 'ORDER_CREATED',
          note: `Awaiting manual ${validMethod.toUpperCase()} payment of Rs. ${finalTotal}.`
        }
      ],
      createdAt: nowIso,
      updatedAt: nowIso
    };

    db.saveOrder(paidOrder);

    // Automated email notification for order placed
    sendOrderSubmittedEmail(paidOrder).catch(err => console.error('Email error:', err));

    res.json({
      success: true,
      orderId: paidOrder.id,
      accessToken: paidOrder.accessToken,
      isFree: false,
      finalTotal,
      status: 'awaiting_payment'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Manual Payment Submission (JazzCash / Easypaisa Reference & Receipt Screenshot)
app.post('/api/orders/:orderId/payment', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { accessToken, transactionReference, receiptImageBase64 } = req.body;

    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.accessToken !== accessToken) {
      res.status(403).json({ success: false, error: 'Unauthorized access token for this order.' });
      return;
    }

    if (!transactionReference || typeof transactionReference !== 'string' || transactionReference.trim().length < 3) {
      res.status(400).json({ success: false, error: 'Please enter a valid Transaction ID or Reference Number.' });
      return;
    }

    // Save screenshot if provided
    let receiptFileName: string | undefined = undefined;
    if (receiptImageBase64 && typeof receiptImageBase64 === 'string') {
      try {
        const matches = receiptImageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        const ext = matches ? matches[1] : 'png';
        const data = matches ? matches[2] : receiptImageBase64;
        
        receiptFileName = `receipt_${order.id}_${Date.now()}.${ext}`;
        const filePath = db.getReceiptFilePath(receiptFileName);
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
        order.receiptImageUrl = `/api/admin/receipt/${order.id}`;
      } catch (imgErr) {
        console.error('Failed to save receipt image:', imgErr);
      }
    }

    const nowIso = new Date().toISOString();
    order.transactionReference = transactionReference.trim();
    order.paymentStatus = 'submitted'; // or 'under_review'
    order.updatedAt = nowIso;
    order.history.push({
      timestamp: nowIso,
      action: 'PAYMENT_SUBMITTED',
      note: `Customer submitted transaction ref: ${transactionReference.trim()}`
    });

    db.saveOrder(order);

    // Send payment received automated email
    sendPaymentReceivedEmail(order).catch(err => console.error('Email error:', err));

    res.json({
      success: true,
      message: 'Payment proof submitted successfully. Your order is now under review.',
      order: {
        id: order.id,
        paymentStatus: order.paymentStatus,
        transactionReference: order.transactionReference
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Order Status & Access Portal by Secure Token
app.get('/api/orders/access/:token', (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const order = db.getOrderByAccessToken(token);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found or invalid access link.' });
      return;
    }

    const isEntitled = order.paymentStatus === 'approved';
    const entitlements = isEntitled ? db.getEntitlements(order.customerEmail) : [];

    // Map items with secure access details
    const items = order.items.map(item => {
      const prod = db.getProductById(item.productId);
      return {
        ...item,
        isUnlocked: isEntitled,
        downloadUrl: isEntitled ? `/api/download/${order.accessToken}/${item.productId}` : null,
        readUrl: isEntitled ? `/api/read/${order.accessToken}/${item.productId}` : null,
        fileSize: prod?.fileSize || '3.5 MB',
        pageCount: prod?.pageCount || 120,
        format: prod?.format || 'PDF'
      };
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        items,
        subtotal: order.subtotal,
        discount: order.discount,
        finalTotal: order.finalTotal,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        transactionReference: order.transactionReference,
        createdAt: order.createdAt,
        approvedAt: order.approvedAt,
        publicNotes: order.publicNotes,
        isEntitled
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Order Lookup by Email and Order ID (Customer Recovery)
app.post('/api/orders/lookup', (req: Request, res: Response) => {
  try {
    const { email, orderId } = req.body;
    if (!email || !orderId) {
      res.status(400).json({ success: false, error: 'Email and Order ID are required.' });
      return;
    }

    const order = db.getOrderById(orderId.trim().toUpperCase());
    if (!order || order.customerEmail.toLowerCase() !== email.trim().toLowerCase()) {
      res.status(404).json({ success: false, error: 'No matching order found for this email and Order ID.' });
      return;
    }

    sendAccessResentEmail(order).catch(err => console.error('Email error:', err));

    res.json({
      success: true,
      message: 'Access link sent! You can also proceed directly.',
      accessToken: order.accessToken
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Secure Protected Digital Ebook Download
app.get('/api/download/:token/:productId', (req: Request, res: Response) => {
  try {
    const { token, productId } = req.params;
    const order = db.getOrderByAccessToken(token);

    if (!order) {
      res.status(403).json({ success: false, error: 'Forbidden: Invalid access token.' });
      return;
    }

    // Must be approved or free claim
    if (order.paymentStatus !== 'approved') {
      res.status(403).json({ 
        success: false, 
        error: 'Access Denied: Payment has not been approved for this order.' 
      });
      return;
    }

    // Must have entitlement
    const hasEntitlement = db.hasEntitlement(order.customerEmail, productId);
    if (!hasEntitlement) {
      res.status(403).json({ 
        success: false, 
        error: 'Forbidden: You do not have an active license for this digital product.' 
      });
      return;
    }

    const product = db.getProductById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product file not found.' });
      return;
    }

    const filePath = db.getPrivateFilePath(product.fileName);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: 'Ebook file asset is currently unavailable.' });
      return;
    }

    // Log download event for audit and security
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    db.logDownloadEvent(order.id, productId, order.customerEmail, clientIp);

    // Stream download safely with protective headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(product.fileName)}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Secure In-Browser Ebook Reader Content
app.get('/api/read/:token/:productId', (req: Request, res: Response) => {
  try {
    const { token, productId } = req.params;
    const order = db.getOrderByAccessToken(token);

    if (!order || order.paymentStatus !== 'approved') {
      res.status(403).json({ success: false, error: 'Access Denied: Order is not approved.' });
      return;
    }

    if (!db.hasEntitlement(order.customerEmail, productId)) {
      res.status(403).json({ success: false, error: 'Access Denied: Entitlement not found.' });
      return;
    }

    const product = db.getProductById(productId);
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    res.json({
      success: true,
      readerData: {
        title: product.title,
        author: product.author,
        format: product.format,
        pageCount: product.pageCount,
        language: product.language,
        contents: product.contents,
        whatYouWillLearn: product.whatYouWillLearn,
        fullDescription: product.fullDescription,
        sampleExcerpt: product.sampleExcerpt,
        licensedTo: order.customerName,
        customerEmail: order.customerEmail,
        orderId: order.id
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// SECURE ADMINISTRATOR ROUTES
// -------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const isValid = verifyAdminPassword(email, password);
    if (!isValid) {
      // Intentionally generic error to prevent email enumeration
      res.status(401).json({ success: false, error: 'Invalid credentials. Please verify your details.' });
      return;
    }

    const token = createAdminSession(email);
    db.logAudit(email, 'ADMIN_LOGIN', 'auth', email, 'Administrator logged in successfully.');

    res.json({
      success: true,
      token,
      email: getAdminEmail()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Session Check
app.get('/api/admin/session', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.headers['x-admin-token'] as string);
  const isValid = validateAdminSession(token);
  res.json({ success: isValid, email: isValid ? getAdminEmail() : null });
});

// Admin Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || (req.headers['x-admin-token'] as string);
  destroyAdminSession(token);
  res.json({ success: true });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (_req: Request, res: Response) => {
  try {
    const products = db.getProducts(true);
    const orders = db.getOrders();

    const totalProducts = products.length;
    const publishedProducts = products.filter(p => p.isPublished).length;
    const freeProducts = products.filter(p => p.isFree).length;
    const paidProducts = products.filter(p => !p.isFree).length;

    const pendingReviews = orders.filter(o => o.paymentStatus === 'submitted' || o.paymentStatus === 'under_review').length;
    const approvedOrders = orders.filter(o => o.paymentStatus === 'approved').length;
    const rejectedOrders = orders.filter(o => o.paymentStatus === 'rejected').length;

    // Sales calculated strictly from APPROVED paid orders
    const totalApprovedSales = orders
      .filter(o => o.paymentStatus === 'approved')
      .reduce((sum, o) => sum + (o.finalTotal || 0), 0);

    res.json({
      success: true,
      stats: {
        totalProducts,
        publishedProducts,
        freeProducts,
        paidProducts,
        pendingReviews,
        approvedOrders,
        rejectedOrders,
        totalApprovedSales,
        totalOrders: orders.length
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Orders List
app.get('/api/admin/orders', requireAdmin, (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    let orders = db.getOrders();

    if (status && typeof status === 'string' && status !== 'all') {
      orders = orders.filter(o => o.paymentStatus === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      orders = orders.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.transactionReference && o.transactionReference.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Single Order Detail
app.get('/api/admin/orders/:orderId', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const entitlements = db.getEntitlements(order.customerEmail).filter(e => e.orderId === order.id);
    const downloads = db.getDownloadEvents(order.id);

    res.json({ success: true, order, entitlements, downloads });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Approve Payment (IDEMPOTENT)
app.post('/api/admin/orders/:orderId/approve', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    const order = db.getOrderById(orderId);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const wasAlreadyApproved = order.paymentStatus === 'approved';
    const nowIso = new Date().toISOString();

    order.paymentStatus = 'approved';
    order.approvedAt = order.approvedAt || nowIso;
    order.reviewedAt = nowIso;
    order.updatedAt = nowIso;
    if (note) order.adminNotes = note;

    order.history.push({
      timestamp: nowIso,
      action: 'PAYMENT_APPROVED',
      note: note || 'Payment verified and approved by administrator.',
      adminEmail: getAdminEmail()
    });

    db.saveOrder(order);

    // Grant entitlements idempotently
    for (const item of order.items) {
      db.grantEntitlement(order.id, order.customerEmail, item.productId);
    }

    db.logAudit(getAdminEmail(), 'APPROVE_ORDER', 'order', order.id, `Order ${order.id} approved for Rs. ${order.finalTotal}`);

    // Trigger email notification if freshly approved
    if (!wasAlreadyApproved) {
      sendOrderApprovedEmail(order).catch(err => console.error('Email error:', err));
    }

    res.json({ success: true, message: 'Order approved and digital access granted.', order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Reject Payment
app.post('/api/admin/orders/:orderId/reject', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason, note } = req.body;
    const order = db.getOrderById(orderId);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    const nowIso = new Date().toISOString();
    order.paymentStatus = 'rejected';
    order.reviewedAt = nowIso;
    order.updatedAt = nowIso;
    order.publicNotes = reason || 'Transaction could not be verified.';
    if (note) order.adminNotes = note;

    order.history.push({
      timestamp: nowIso,
      action: 'PAYMENT_REJECTED',
      note: `Rejected: ${reason || 'Unmatched transaction'}. Internal note: ${note || 'None'}`,
      adminEmail: getAdminEmail()
    });

    db.saveOrder(order);

    db.logAudit(getAdminEmail(), 'REJECT_ORDER', 'order', order.id, `Order ${order.id} rejected. Reason: ${reason}`);

    // Notify customer
    sendOrderRejectedEmail(order, reason).catch(err => console.error('Email error:', err));

    res.json({ success: true, message: 'Order rejected. Customer notified.', order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Add Note
app.post('/api/admin/orders/:orderId/note', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    order.adminNotes = note;
    order.history.push({
      timestamp: new Date().toISOString(),
      action: 'ADMIN_NOTE_UPDATED',
      note: note,
      adminEmail: getAdminEmail()
    });
    db.saveOrder(order);

    res.json({ success: true, message: 'Note saved.', order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Resend Email
app.post('/api/admin/orders/:orderId/resend-email', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    if (order.paymentStatus === 'approved') {
      sendOrderApprovedEmail(order).catch(console.error);
    } else {
      sendAccessResentEmail(order).catch(console.error);
    }

    db.logAudit(getAdminEmail(), 'RESEND_EMAIL', 'order', order.id, 'Resent access email.');
    res.json({ success: true, message: 'Notification dispatched to customer.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Revoke Entitlement
app.post('/api/admin/orders/:orderId/revoke', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { productId, reason } = req.body;
    const order = db.getOrderById(orderId);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    db.revokeEntitlement(orderId, productId, reason || 'Revoked by administrator');
    db.logAudit(getAdminEmail(), 'REVOKE_ENTITLEMENT', 'order', order.id, `Revoked entitlement for ${productId}. Reason: ${reason}`);

    res.json({ success: true, message: 'Entitlement successfully revoked.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Protected Receipt Image View
app.get('/api/admin/receipt/:orderId', requireAdmin, (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const receiptsDir = path.resolve(process.cwd(), 'data', 'receipts');
    
    // Look for matching receipt file
    if (!fs.existsSync(receiptsDir)) {
      res.status(404).json({ success: false, error: 'Receipts directory empty.' });
      return;
    }

    const files = fs.readdirSync(receiptsDir);
    const target = files.find(f => f.startsWith(`receipt_${orderId}_`));
    if (!target) {
      res.status(404).json({ success: false, error: 'Receipt file not found.' });
      return;
    }

    const filePath = path.join(receiptsDir, target);
    res.sendFile(filePath);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Products Admin CRUD
app.get('/api/admin/products', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, products: db.getProducts(true) });
});

app.post('/api/admin/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p.title || !p.categoryId) {
      res.status(400).json({ success: false, error: 'Title and category are required.' });
      return;
    }

    const slug = (p.slug || p.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct: Product = {
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slug: slug || `ebook-${Date.now()}`,
      title: p.title,
      author: p.author || 'Muhammad Husnain',
      shortDescription: p.shortDescription || '',
      fullDescription: p.fullDescription || '',
      whatYouWillLearn: Array.isArray(p.whatYouWillLearn) ? p.whatYouWillLearn : [],
      contents: Array.isArray(p.contents) ? p.contents : [],
      sampleExcerpt: p.sampleExcerpt || '',
      coverUrl: p.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      fileName: p.fileName || `${slug}.pdf`,
      fileSize: p.fileSize || '3.5 MB',
      pageCount: Number(p.pageCount) || 120,
      categoryId: p.categoryId,
      tags: Array.isArray(p.tags) ? p.tags : [],
      language: p.language || 'English',
      format: p.format || 'PDF',
      isFree: Boolean(p.isFree),
      regularPrice: Number(p.regularPrice) || 0,
      salePrice: p.salePrice ? Number(p.salePrice) : undefined,
      discountStart: p.discountStart,
      discountEnd: p.discountEnd,
      isPublished: p.isPublished !== false,
      isFeatured: Boolean(p.isFeatured),
      featuredOrder: p.featuredOrder ? Number(p.featuredOrder) : 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = db.saveProduct(newProduct);
    db.logAudit(getAdminEmail(), 'CREATE_PRODUCT', 'product', saved.id, `Created product: ${saved.title}`);
    res.json({ success: true, product: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    const updated: Product = {
      ...existing,
      ...req.body,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };

    const saved = db.saveProduct(updated);
    db.logAudit(getAdminEmail(), 'UPDATE_PRODUCT', 'product', saved.id, `Updated product: ${saved.title}`);
    res.json({ success: true, product: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Product not found.' });
      return;
    }

    // Soft-delete: unpublish to protect historical orders
    existing.isPublished = false;
    db.saveProduct(existing);
    db.logAudit(getAdminEmail(), 'ARCHIVE_PRODUCT', 'product', id, `Archived/Unpublished product: ${existing.title}`);
    res.json({ success: true, message: 'Product archived. Historical orders remain safe.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories Admin CRUD
app.get('/api/admin/categories', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, categories: db.getCategories() });
});

app.post('/api/admin/categories', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, description, displayOrder } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: 'Name is required.' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCat = db.saveCategory({
      id: `cat-${slug}`,
      name,
      slug,
      description: description || '',
      displayOrder: Number(displayOrder) || 10
    });

    db.logAudit(getAdminEmail(), 'CREATE_CATEGORY', 'category', newCat.id, `Created category: ${name}`);
    res.json({ success: true, category: newCat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cat = db.getCategories().find(c => c.id === id);
    if (!cat) {
      res.status(404).json({ success: false, error: 'Category not found.' });
      return;
    }

    const updated = db.saveCategory({ ...cat, ...req.body, id });
    db.logAudit(getAdminEmail(), 'UPDATE_CATEGORY', 'category', id, `Updated category: ${updated.name}`);
    res.json({ success: true, category: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/categories/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.deleteCategory(id);
    db.logAudit(getAdminEmail(), 'DELETE_CATEGORY', 'category', id, `Deleted category: ${id}`);
    res.json({ success: true, message: 'Category removed.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Promotions Admin CRUD
app.get('/api/admin/promotions', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, promotions: db.getPromotions() });
});

app.post('/api/admin/promotions', requireAdmin, (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p.code || !p.discountValue) {
      res.status(400).json({ success: false, error: 'Code and discount value are required.' });
      return;
    }

    const newPromo = db.savePromotion({
      id: `promo-${p.code.toLowerCase().trim()}`,
      code: p.code.toUpperCase().trim(),
      discountType: p.discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(p.discountValue),
      minOrderValue: p.minOrderValue ? Number(p.minOrderValue) : undefined,
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : undefined,
      startDate: p.startDate,
      endDate: p.endDate,
      isActive: p.isActive !== false,
      totalRedemptionLimit: p.totalRedemptionLimit ? Number(p.totalRedemptionLimit) : undefined,
      currentRedemptions: 0,
      perCustomerLimit: p.perCustomerLimit ? Number(p.perCustomerLimit) : 1
    });

    db.logAudit(getAdminEmail(), 'CREATE_PROMOTION', 'promo', newPromo.id, `Created promo code: ${newPromo.code}`);
    res.json({ success: true, promotion: newPromo });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/promotions/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = db.getPromotions().find(p => p.id === id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Promo not found.' });
      return;
    }

    const updated = db.savePromotion({ ...existing, ...req.body, id });
    db.logAudit(getAdminEmail(), 'UPDATE_PROMOTION', 'promo', id, `Updated promo: ${updated.code}`);
    res.json({ success: true, promotion: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/admin/promotions/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    db.deletePromotion(id);
    db.logAudit(getAdminEmail(), 'DELETE_PROMOTION', 'promo', id, `Deleted promo: ${id}`);
    res.json({ success: true, message: 'Promo deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Settings & External Configuration Status
app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  try {
    const settings = db.getSettings();
    const smtpStatus = getSmtpStatus();
    res.json({ success: true, settings, smtpStatus });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    db.logAudit(getAdminEmail(), 'UPDATE_SETTINGS', 'settings', 'all', 'Store payment & contact settings updated.');
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
      return;
    }

    const isValid = verifyAdminPassword(getAdminEmail(), currentPassword);
    if (!isValid) {
      res.status(400).json({ success: false, error: 'Current password does not match.' });
      return;
    }

    updateAdminPassword(newPassword);
    db.logAudit(getAdminEmail(), 'CHANGE_PASSWORD', 'auth', getAdminEmail(), 'Admin passcode updated.');
    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Logs
app.get('/api/admin/audit-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, logs: db.getAuditLogs() });
});

app.get('/api/admin/email-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, emails: db.getEmailLogs() });
});

// -------------------------------------------------------------
// STATIC OR VITE MIDDLEWARE SETUP
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Husnain Ebooks Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
