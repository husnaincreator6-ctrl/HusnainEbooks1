export type PaymentMethod = 'jazzcash' | 'easypaisa' | 'free';

export type PaymentStatus = 
  | 'awaiting_payment'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'refunded';

export type EbookFormat = 'PDF' | 'EPUB';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  author: string;
  shortDescription: string;
  fullDescription: string;
  whatYouWillLearn: string[];
  contents: string[];
  sampleExcerpt?: string;
  coverUrl: string;
  fileUrl?: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  categoryId: string;
  tags: string[];
  language: string;
  format: EbookFormat;
  isFree: boolean;
  regularPrice: number;
  salePrice?: number;
  discountStart?: string;
  discountEnd?: string;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  regularPrice: number;
  isFree: boolean;
  coverUrl: string;
}

export interface OrderHistoryEntry {
  timestamp: string;
  action: string;
  note?: string;
  adminEmail?: string;
}

export interface Order {
  id: string; // e.g. HEB-94812
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  finalTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  receiptImageUrl?: string;
  adminNotes?: string;
  publicNotes?: string;
  accessToken: string;
  history: OrderHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  totalRedemptionLimit?: number;
  currentRedemptions: number;
  perCustomerLimit?: number;
  applicableCategoryIds?: string[];
}

export interface Entitlement {
  id: string;
  orderId: string;
  customerEmail: string;
  productId: string;
  grantedAt: string;
  isActive: boolean;
  revokedAt?: string;
  revokeReason?: string;
}

export interface DownloadEvent {
  id: string;
  orderId: string;
  productId: string;
  customerEmail: string;
  ipAddress?: string;
  downloadedAt: string;
}

export interface AdminSettings {
  jazzcashNumber: string;
  jazzcashAccountName: string;
  easypaisaNumber: string;
  easypaisaAccountName: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  verificationPolicyHours: string;
  currencySymbol: string;
  currencyCode: string;
  storeNotice: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
}

export interface EmailNotification {
  id: string;
  orderId: string;
  customerEmail: string;
  subject: string;
  type: 'order_submitted' | 'payment_received' | 'order_approved' | 'order_rejected' | 'free_claimed' | 'access_resent';
  contentPreview: string;
  status: 'sent' | 'simulated_fallback' | 'failed';
  sentAt: string;
  errorMessage?: string;
}

export interface AdminStats {
  totalProducts: number;
  publishedProducts: number;
  freeProducts: number;
  paidProducts: number;
  pendingReviews: number;
  approvedOrders: number;
  rejectedOrders: number;
  totalApprovedSales: number;
  totalOrders: number;
}
