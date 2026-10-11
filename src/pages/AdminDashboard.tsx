import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Settings, 
  Mail, 
  ShieldCheck, 
  LogOut, 
  FileText, 
  RefreshCw, 
  Layers, 
  Tag, 
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Lock,
  ChevronRight,
  Send,
  Ban
} from 'lucide-react';
import { 
  AdminStats, 
  Order, 
  Product, 
  Category, 
  Promotion, 
  AdminSettings, 
  AdminAuditLog, 
  EmailNotification 
} from '../types';
import { HusnainLogo } from '../components/HusnainLogo';

interface AdminDashboardProps {
  token: string;
  adminEmail: string;
  onLogout: () => void;
  onNavigateStorefront: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  adminEmail,
  onLogout,
  onNavigateStorefront
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'categories' | 'promotions' | 'settings' | 'logs'>('overview');
  
  // Dashboard Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [smtpStatus, setSmtpStatus] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Active Order Detail / Review Modal
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Product Add / Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Promo Add / Edit Modal
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [isNewPromo, setIsNewPromo] = useState(false);

  // Category Add / Edit Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState('');

  // Fetch all initial admin data
  const fetchAllData = async () => {
    setLoading(true);
    const headers = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    };

    try {
      const [
        statsRes, 
        ordersRes, 
        productsRes, 
        categoriesRes, 
        promosRes, 
        settingsRes, 
        auditRes, 
        emailRes
      ] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/orders', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch('/api/admin/categories', { headers }),
        fetch('/api/admin/promotions', { headers }),
        fetch('/api/admin/settings', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
        fetch('/api/admin/email-logs', { headers })
      ]);

      const [
        statsData, 
        ordersData, 
        productsData, 
        categoriesData, 
        promosData, 
        settingsData, 
        auditData, 
        emailData
      ] = await Promise.all([
        statsRes.json(),
        ordersRes.json(),
        productsRes.json(),
        categoriesRes.json(),
        promosRes.json(),
        settingsRes.json(),
        auditRes.json(),
        emailRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setOrders(ordersData.orders);
      if (productsData.success) setProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
      if (promosData.success) setPromotions(promosData.promotions);
      if (settingsData.success) {
        setSettings(settingsData.settings);
        setSmtpStatus(settingsData.smtpStatus);
      }
      if (auditData.success) setAuditLogs(auditData.logs);
      if (emailData.success) setEmailLogs(emailData.emails);

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Order Approval Handler (Idempotent)
  const handleApproveOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note: reviewNote || 'Approved after verifying payment.' })
      });

      const data = await res.json();
      if (data.success) {
        setInspectingOrder(null);
        setReviewNote('');
        fetchAllData();
      } else {
        alert(data.error || 'Failed to approve order.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Order Rejection Handler
  const handleRejectOrder = async (orderId: string) => {
    if (!reviewNote.trim()) {
      alert('Please enter a rejection reason for customer notification.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reviewNote, note: reviewNote })
      });

      const data = await res.json();
      if (data.success) {
        setInspectingOrder(null);
        setReviewNote('');
        fetchAllData();
      } else {
        alert(data.error || 'Failed to reject order.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Resend Email Handler
  const handleResendEmail = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend-email`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      alert(data.message || 'Notification dispatched.');
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Revoke Entitlement Handler
  const handleRevokeEntitlement = async (orderId: string, productId: string) => {
    const reason = prompt('Reason for access revocation:');
    if (!reason) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, reason })
      });
      const data = await res.json();
      alert(data.message || 'Revoked.');
      fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Save / Update Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const isCreating = isNewProduct;
    const url = isCreating ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
    const method = isCreating ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct)
      });

      const data = await res.json();
      if (data.success) {
        setEditingProduct(null);
        fetchAllData();
      } else {
        alert(data.error || 'Failed to save product.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Soft Delete Product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to archive this ebook? (Historical orders remain intact)')) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Promo Code
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPromo) return;

    const url = isNewPromo ? '/api/admin/promotions' : `/api/admin/promotions/${editingPromo.id}`;
    const method = isNewPromo ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingPromo)
      });
      const data = await res.json();
      if (data.success) {
        setEditingPromo(null);
        fetchAllData();
      } else {
        alert(data.error || 'Failed to save promotion.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('Settings successfully updated.');
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Change Admin Passcode
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatusMsg('');

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatusMsg('Password successfully changed.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setPasswordStatusMsg(data.error || 'Failed to change password.');
      }
    } catch (e) {
      setPasswordStatusMsg('Error updating password.');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter !== 'all' && o.paymentStatus !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        (o.transactionReference && o.transactionReference.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080A0D] text-white flex flex-col font-sans">
      
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-30 bg-[#0E1116] border-b border-[#1E2532] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <HusnainLogo size="sm" showTagline={false} />
          <div className="hidden sm:block border-l border-[#262E3E] pl-4">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">
              Store Control Panel
            </span>
            <span className="text-[11px] text-gray-400">
              Admin: {adminEmail}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateStorefront}
            className="px-3.5 py-1.5 rounded-lg bg-[#161B23] hover:bg-[#202734] border border-[#273244] text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1.5"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-300 transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Area with Sidebar Tabs */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 bg-[#0B0D12] border-r border-[#1C222D] p-4 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Overview & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4" />
              <span>Orders & Payments</span>
            </div>
            {stats && stats.pendingReviews > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'orders' ? 'bg-black text-[#D4AF37]' : 'bg-amber-500 text-black'}`}>
                {stats.pendingReviews}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Ebook Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'promotions'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupons & Promos</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Store & Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-[#D4AF37] text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#151922]'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email & Audit Logs</span>
          </button>
        </nav>

        {/* Content Pane */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          
          {loading && !stats ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW & METRICS */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif-luxury">
                      Store Performance & Revenue
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Real-time calculations from verified database orders.
                    </p>
                  </div>

                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Total Verified Revenue */}
                    <div className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Total Approved Sales</span>
                        <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#D4AF37]">
                        Rs. {stats?.totalApprovedSales.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Derived strictly from approved paid orders
                      </div>
                    </div>

                    {/* Pending Reviews */}
                    <div className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Pending Payment Reviews</span>
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                        {stats?.pendingReviews}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Awaiting manual JazzCash/Easypaisa checks
                      </div>
                    </div>

                    {/* Approved Orders */}
                    <div className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Approved Orders</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                        {stats?.approvedOrders}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Entitlements active and unlocked
                      </div>
                    </div>

                    {/* Catalog Breakdown */}
                    <div className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Total Ebooks</span>
                        <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-white">
                        {stats?.totalProducts}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {stats?.paidProducts} Paid • {stats?.freeProducts} Free Publications
                      </div>
                    </div>

                  </div>

                  {/* Pending Reviews Alert Banner */}
                  {stats && stats.pendingReviews > 0 && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-amber-200">
                            {stats.pendingReviews} Customer Payment {stats.pendingReviews === 1 ? 'Submission' : 'Submissions'} Awaiting Review
                          </h4>
                          <p className="text-xs text-amber-300/80">
                            Review transaction references and screenshots to unlock customer ebooks.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setOrderStatusFilter('submitted');
                          setActiveTab('orders');
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs whitespace-nowrap transition-colors"
                      >
                        Review Submissions
                      </button>
                    </div>
                  )}

                  {/* Recent Orders Overview */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">Recent Customer Orders</h3>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-[#D4AF37] hover:underline"
                      >
                        View all orders →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-gray-300">
                        <thead className="bg-[#161B23] text-gray-400 uppercase text-[10px]">
                          <tr>
                            <th className="p-3">Order</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Amount</th>
                            <th className="p-3">Method</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1D232F]">
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="hover:bg-[#161A22]">
                              <td className="p-3 font-mono font-bold text-white">{o.id}</td>
                              <td className="p-3">
                                <div className="font-semibold text-white">{o.customerName}</div>
                                <div className="text-[11px] text-gray-400">{o.customerEmail}</div>
                              </td>
                              <td className="p-3 font-bold text-[#D4AF37]">
                                {o.finalTotal === 0 ? 'FREE' : `Rs. ${o.finalTotal.toLocaleString()}`}
                              </td>
                              <td className="p-3 uppercase text-[11px]">{o.paymentMethod}</td>
                              <td className="p-3">
                                {o.paymentStatus === 'approved' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Approved</span>
                                )}
                                {(o.paymentStatus === 'submitted' || o.paymentStatus === 'under_review') && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">Under Review</span>
                                )}
                                {o.paymentStatus === 'rejected' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400">Rejected</span>
                                )}
                                {o.paymentStatus === 'awaiting_payment' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400">Awaiting Pay</span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setInspectingOrder(o)}
                                  className="px-2.5 py-1 rounded bg-[#202734] hover:bg-[#2A3446] text-white text-[11px]"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ORDERS & PAYMENT VERIFICATION */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white font-serif-luxury">
                        Order & Payment Verification
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Verify manual JazzCash and Easypaisa transactions against merchant records.
                      </p>
                    </div>

                    <button
                      onClick={fetchAllData}
                      className="px-3.5 py-2 rounded-xl bg-[#161B23] border border-[#252E3E] text-xs font-semibold hover:bg-[#1E2532] text-gray-200 flex items-center gap-2 self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Refresh Orders</span>
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="p-4 rounded-2xl bg-[#11141B] border border-[#212733] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-80">
                      <input
                        type="text"
                        placeholder="Search by Order ID, name, TID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#D4AF37]"
                      />
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'submitted', label: 'Under Review' },
                        { id: 'approved', label: 'Approved' },
                        { id: 'rejected', label: 'Rejected' },
                        { id: 'awaiting_payment', label: 'Awaiting' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setOrderStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                            orderStatusFilter === tab.id
                              ? 'bg-[#D4AF37] text-black shadow'
                              : 'bg-[#161B23] text-gray-400 hover:text-white'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#161B23] text-gray-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Order Ref</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Customer & Contact</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">TID Reference</th>
                          <th className="p-3">Receipt</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1D232F]">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-gray-500 text-xs">
                              No orders found matching your criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o) => (
                            <tr key={o.id} className="hover:bg-[#161A22]">
                              <td className="p-3 font-mono font-bold text-white">{o.id}</td>
                              <td className="p-3 text-[11px] text-gray-400">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-white">{o.customerName}</div>
                                <div className="text-[11px] text-gray-400">{o.customerEmail}</div>
                                <div className="text-[10px] text-emerald-400">{o.customerPhone}</div>
                              </td>
                              <td className="p-3 font-bold text-[#D4AF37]">
                                {o.finalTotal === 0 ? 'FREE' : `Rs. ${o.finalTotal.toLocaleString()}`}
                              </td>
                              <td className="p-3 font-mono text-[11px]">
                                {o.transactionReference ? (
                                  <span className="text-gray-200 bg-[#1A202C] px-2 py-0.5 rounded border border-[#2B3545]">
                                    {o.transactionReference}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 italic">None</span>
                                )}
                              </td>
                              <td className="p-3">
                                {o.receiptImageUrl ? (
                                  <button
                                    onClick={() => setReceiptModalUrl(o.receiptImageUrl!)}
                                    className="px-2 py-1 rounded bg-[#202734] hover:bg-[#2A3446] text-[#D4AF37] text-[11px] font-semibold flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Receipt</span>
                                  </button>
                                ) : (
                                  <span className="text-gray-500 text-[11px]">—</span>
                                )}
                              </td>
                              <td className="p-3">
                                {o.paymentStatus === 'approved' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Approved
                                  </span>
                                )}
                                {(o.paymentStatus === 'submitted' || o.paymentStatus === 'under_review') && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Under Review
                                  </span>
                                )}
                                {o.paymentStatus === 'rejected' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                    Rejected
                                  </span>
                                )}
                                {o.paymentStatus === 'awaiting_payment' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    Awaiting Payment
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => setInspectingOrder(o)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#202734] hover:bg-[#2A3446] text-white text-[11px] font-semibold"
                                  >
                                    Inspect & Verify
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 3: EBOOK CATALOG MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white font-serif-luxury">
                        Digital Ebook Catalog
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Add new publications, adjust pricing, upload cover assets, and manage visibility.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsNewProduct(true);
                        setEditingProduct({
                          id: '',
                          slug: '',
                          title: '',
                          author: 'Muhammad Husnain',
                          shortDescription: '',
                          fullDescription: '',
                          whatYouWillLearn: ['Practical Skill 1', 'Practical Skill 2'],
                          contents: ['Chapter 1: Foundations', 'Chapter 2: Scaling'],
                          sampleExcerpt: '',
                          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
                          fileName: 'new-ebook.pdf',
                          fileSize: '3.5 MB',
                          pageCount: 140,
                          categoryId: categories[0]?.id || 'cat-freelancing',
                          tags: ['Practical'],
                          language: 'English',
                          format: 'PDF',
                          isFree: false,
                          regularPrice: 2000,
                          salePrice: 1499,
                          isPublished: true,
                          isFeatured: false,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString()
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Publication</span>
                    </button>
                  </div>

                  {/* Products List Table */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-[#161B23] text-gray-400 uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Cover</th>
                          <th className="p-3">Title & Author</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Pricing</th>
                          <th className="p-3">Format</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1D232F]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#161A22]">
                            <td className="p-3">
                              <img src={p.coverUrl} alt={p.title} className="w-10 h-14 object-cover rounded shadow" />
                            </td>
                            <td className="p-3 max-w-xs">
                              <div className="font-bold text-white line-clamp-1">{p.title}</div>
                              <div className="text-[11px] text-gray-400">by {p.author}</div>
                            </td>
                            <td className="p-3 text-[11px]">
                              {categories.find(c => c.id === p.categoryId)?.name || p.categoryId}
                            </td>
                            <td className="p-3">
                              {p.isFree ? (
                                <span className="font-bold text-emerald-400">FREE</span>
                              ) : (
                                <div>
                                  <span className="font-bold text-[#D4AF37]">
                                    Rs. {(p.salePrice ?? p.regularPrice).toLocaleString()}
                                  </span>
                                  {p.salePrice && p.salePrice < p.regularPrice && (
                                    <span className="text-[10px] text-gray-500 line-through block">
                                      Rs. {p.regularPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-[11px]">{p.format} ({p.pageCount}p)</td>
                            <td className="p-3">
                              {p.isPublished ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">Published</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400">Archived</span>
                              )}
                              {p.isFeatured && (
                                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D4AF37]/20 text-[#D4AF37]">Featured</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setIsNewProduct(false);
                                    setEditingProduct(p);
                                  }}
                                  className="p-1.5 rounded hover:bg-[#202734] text-gray-300 hover:text-white"
                                  title="Edit Ebook"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 rounded hover:bg-[#202734] text-gray-500 hover:text-red-400"
                                  title="Archive Ebook"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {/* TAB 4: CATEGORIES */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white font-serif-luxury">
                        Store Categories
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Organize publications by high-level curriculum subjects.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsNewCategory(true);
                        setEditingCategory({
                          id: '',
                          name: '',
                          slug: '',
                          description: '',
                          displayOrder: categories.length + 1
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Category</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((c) => (
                      <div key={c.id} className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-gray-400">Order: #{c.displayOrder}</span>
                          <span className="text-xs font-bold text-[#D4AF37] bg-[#161B23] px-2 py-0.5 rounded">
                            {products.filter(p => p.categoryId === c.id).length} Products
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{c.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PROMOTIONS */}
              {activeTab === 'promotions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white font-serif-luxury">
                        Coupons & Promotional Codes
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Create percentage or flat discounts with minimum spend and redemption caps.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsNewPromo(true);
                        setEditingPromo({
                          id: '',
                          code: 'NEWCODE',
                          discountType: 'percentage',
                          discountValue: 10,
                          minOrderValue: 1000,
                          maxDiscount: 500,
                          isActive: true,
                          totalRedemptionLimit: 100,
                          currentRedemptions: 0,
                          perCustomerLimit: 1
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs flex items-center gap-2 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Coupon</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {promotions.map((p) => (
                      <div key={p.id} className="p-5 rounded-2xl bg-[#11141B] border border-[#212733] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-[#D4AF37] px-2.5 py-1 rounded bg-[#181D26] border border-[#262E3B]">
                            {p.code}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {p.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-white">
                          {p.discountType === 'percentage' ? `${p.discountValue}% Off` : `Rs. ${p.discountValue} Off`}
                        </div>

                        <div className="text-[11px] text-gray-400 space-y-1">
                          <div>Min Order: Rs. {p.minOrderValue || 0}</div>
                          <div>Redemptions: {p.currentRedemptions} / {p.totalRedemptionLimit || 'Unlimited'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: STORE SETTINGS & PAYMENT CONFIGURATION */}
              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-3xl">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif-luxury">
                      Store & Manual Payment Settings
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Update your official JazzCash and Easypaisa recipient details and contact channels without modifying code.
                    </p>
                  </div>

                  {settings && (
                    <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-6">
                      <div className="border-b border-[#1E2532] pb-4">
                        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                          JazzCash Account Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              JazzCash Recipient Number
                            </label>
                            <input
                              type="text"
                              value={settings.jazzcashNumber}
                              onChange={(e) => setSettings({ ...settings, jazzcashNumber: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              JazzCash Account Title
                            </label>
                            <input
                              type="text"
                              value={settings.jazzcashAccountName}
                              onChange={(e) => setSettings({ ...settings, jazzcashAccountName: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-b border-[#1E2532] pb-4">
                        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                          Easypaisa Account Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Easypaisa Recipient Number
                            </label>
                            <input
                              type="text"
                              value={settings.easypaisaNumber}
                              onChange={(e) => setSettings({ ...settings, easypaisaNumber: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Easypaisa Account Title
                            </label>
                            <input
                              type="text"
                              value={settings.easypaisaAccountName}
                              onChange={(e) => setSettings({ ...settings, easypaisaAccountName: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-b border-[#1E2532] pb-4">
                        <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider">
                          Contact & Verification Policy
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Support WhatsApp Number
                            </label>
                            <input
                              type="text"
                              value={settings.whatsappNumber}
                              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">
                              Verification Policy Turnaround
                            </label>
                            <input
                              type="text"
                              value={settings.verificationPolicyHours}
                              onChange={(e) => setSettings({ ...settings, verificationPolicyHours: e.target.value })}
                              className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs"
                      >
                        Save Payment & Contact Settings
                      </button>
                    </form>
                  )}

                  {/* Change Admin Password Card */}
                  <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37]">
                      Update Administrator Passcode
                    </h3>
                    <p className="text-xs text-gray-400">
                      Changes the master password for <strong>{adminEmail}</strong>.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">Current Password</label>
                        <input
                          type="password"
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">New Password (Min 6 chars)</label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#161B23] border border-[#262E3B] text-xs text-white rounded-xl px-4 py-2.5"
                        />
                      </div>
                    </div>

                    {passwordStatusMsg && (
                      <div className="text-xs text-amber-300">{passwordStatusMsg}</div>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#202734] hover:bg-[#2A3444] text-white font-semibold text-xs border border-[#2D384A]"
                    >
                      Update Passcode
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 7: EMAIL & AUDIT LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white font-serif-luxury">
                      Automated Email Dispatcher & Audit Logs
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Check external SMTP credentials status and inspect automated email dispatches.
                    </p>
                  </div>

                  {/* SMTP Status Diagnostics Box (Acceptance Test 22 Requirement) */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-5 h-5 text-[#D4AF37]" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                          Automated Email Provider Diagnostic
                        </h3>
                      </div>
                      {smtpStatus?.isConfigured ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          External SMTP Live
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Diagnostic Simulator Active
                        </span>
                      )}
                    </div>

                    {smtpStatus?.isConfigured ? (
                      <p className="text-xs text-emerald-300 leading-relaxed">
                        External SMTP is configured via <strong>{smtpStatus.host}</strong>. Customer notifications are actively dispatched through your configured email server.
                      </p>
                    ) : (
                      <div className="p-4 rounded-xl bg-[#161B23] border border-[#242C39] space-y-2 text-xs text-gray-300">
                        <div className="font-bold text-amber-400">
                          Missing External SMTP Credentials in .env:
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          To deliver emails directly through an external mail server (SendGrid, Mailgun, Brevo, or Gmail SMTP), provide the following variables in your environment:
                        </p>
                        <div className="font-mono text-[11px] bg-[#0E1116] p-3 rounded-lg border border-[#1E2532] text-amber-300 space-y-1">
                          {smtpStatus?.missingFields?.map((f: string) => (
                            <div key={f}>{f}="your-value"</div>
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          All customer order confirmations, payment receipts, and download links are logged below with full preview contents.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Dispatched Email Notifications Log */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37]">
                      Dispatched Notifications ({emailLogs.length})
                    </h3>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {emailLogs.map((item) => (
                        <div key={item.id} className="p-3 rounded-xl bg-[#161B23] border border-[#222936] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{item.subject}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(item.sentAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            To: <strong className="text-gray-200">{item.customerEmail}</strong> • Order: {item.orderId}
                          </div>
                          <div className="text-[11px] text-gray-300 italic pt-1">
                            "{item.contentPreview}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Administrative Audit Logs */}
                  <div className="p-6 rounded-2xl bg-[#11141B] border border-[#212733] space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#D4AF37]">
                      Security & Administrative Audit Trail ({auditLogs.length})
                    </h3>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-lg bg-[#141820] border border-[#202734] flex items-center justify-between">
                          <div>
                            <span className="text-[#D4AF37] font-bold">[{log.action}]</span>{' '}
                            <span className="text-gray-300">{log.details}</span>
                          </div>
                          <span className="text-gray-500 text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </>
          )}

        </main>
      </div>

      {/* INSPECT ORDER MODAL */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#11141B] border border-[#262E3B] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2532] bg-[#0C0E12]">
              <div>
                <h3 className="text-base font-bold text-white">
                  Order Verification: {inspectingOrder.id}
                </h3>
                <span className="text-xs text-gray-400">
                  Customer: {inspectingOrder.customerName} ({inspectingOrder.customerEmail})
                </span>
              </div>
              <button 
                onClick={() => setInspectingOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#1A202A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-300">
              
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#161B23] border border-[#242C39]">
                <div>
                  <span className="text-gray-400 block mb-0.5">Amount Due / Paid:</span>
                  <strong className="text-base text-[#D4AF37]">
                    {inspectingOrder.finalTotal === 0 ? 'FREE' : `Rs. ${inspectingOrder.finalTotal.toLocaleString()}`}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Payment Method:</span>
                  <strong className="text-white uppercase">{inspectingOrder.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Customer Mobile/WhatsApp:</span>
                  <strong className="text-emerald-400">{inspectingOrder.customerPhone}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Transaction ID (TID):</span>
                  <strong className="text-white font-mono bg-[#0F1218] px-2 py-0.5 rounded border border-[#2B3545]">
                    {inspectingOrder.transactionReference || 'Not provided'}
                  </strong>
                </div>
              </div>

              {/* Receipt Screenshot Preview (If Attached) */}
              {inspectingOrder.receiptImageUrl && (
                <div className="p-4 rounded-xl bg-[#161B23] border border-[#242C39] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Uploaded Payment Proof Screenshot:</span>
                    <a
                      href={inspectingOrder.receiptImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <span>Open Full Size</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <img
                    src={inspectingOrder.receiptImageUrl}
                    alt="Receipt Screenshot"
                    className="max-h-56 rounded-lg border border-[#2A3446] mx-auto object-contain"
                  />
                </div>
              )}

              {/* Items in this Order */}
              <div className="space-y-2">
                <span className="font-bold text-white block">Ebooks in this Order:</span>
                {inspectingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#141820] border border-[#1E2530] flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-[#D4AF37] font-bold">Rs. {item.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Review Note Input */}
              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Administrative Note / Customer Message:
                </label>
                <textarea
                  rows={2}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified with JazzCash statement at 11:30 AM"
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-[#1E2532] bg-[#0C0E12] flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleResendEmail(inspectingOrder.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#1C2330] hover:bg-[#252E3E] text-gray-300 text-xs font-semibold"
                >
                  Resend Email
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleRejectOrder(inspectingOrder.id)}
                  className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-700/60 text-red-300 text-xs font-bold"
                >
                  Reject Payment
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleApproveOrder(inspectingOrder.id)}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold shadow-md shadow-[#D4AF37]/15 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Unlock</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RECEIPT VIEW MODAL */}
      {receiptModalUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setReceiptModalUrl(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-[#11141B] border border-[#273244] rounded-2xl overflow-hidden p-4">
            <button
              onClick={() => setReceiptModalUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={receiptModalUrl} alt="Receipt Full View" className="max-h-[80vh] w-auto mx-auto object-contain rounded" />
          </div>
        </div>
      )}

      {/* EDIT / CREATE PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#11141B] border border-[#262E3B] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2532] bg-[#0C0E12]">
              <h3 className="text-base font-bold text-white">
                {isNewProduct ? 'Add New Ebook Publication' : `Edit Ebook: ${editingProduct.title}`}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="p-1.5 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Ebook Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.author}
                    onChange={(e) => setEditingProduct({ ...editingProduct, author: e.target.value })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2.5 text-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDescription}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Description *</label>
                <textarea
                  rows={4}
                  required
                  value={editingProduct.fullDescription}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDescription: e.target.value })}
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#161B23] rounded-xl border border-[#262E3B]">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFree}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFree: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Free Ebook?</span>
                </label>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Regular Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.regularPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, regularPrice: Number(e.target.value) })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.salePrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={editingProduct.coverUrl}
                  onChange={(e) => setEditingProduct({ ...editingProduct, coverUrl: e.target.value })}
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#161B23] rounded-xl border border-[#262E3B]">
                  <input
                    type="checkbox"
                    checked={editingProduct.isPublished}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isPublished: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Published on Store</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#161B23] rounded-xl border border-[#262E3B]">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="accent-[#D4AF37]"
                  />
                  <span>Featured on Home</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#1E2532] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-[#202734] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-black font-bold"
                >
                  Save Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROMO MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#11141B] border border-[#262E3B] rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create / Edit Promotional Code</h3>
            
            <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={editingPromo.code}
                  onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })}
                  className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 uppercase text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Type</label>
                  <select
                    value={editingPromo.discountType}
                    onChange={(e: any) => setEditingPromo({ ...editingPromo, discountType: e.target.value })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (PKR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={editingPromo.discountValue}
                    onChange={(e) => setEditingPromo({ ...editingPromo, discountValue: Number(e.target.value) })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Min Spend (PKR)</label>
                  <input
                    type="number"
                    value={editingPromo.minOrderValue || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Redemption Cap</label>
                  <input
                    type="number"
                    value={editingPromo.totalRedemptionLimit || ''}
                    onChange={(e) => setEditingPromo({ ...editingPromo, totalRedemptionLimit: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#161B23] border border-[#262E3B] rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPromo(null)}
                  className="px-4 py-2 rounded-xl bg-[#202734] text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-black font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
