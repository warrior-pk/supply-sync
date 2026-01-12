import React, { useState, useEffect } from "react";
import useAuthStore from "@/store/auth.store";
import vendorService from "@/services/vendor.service";
import purchaseOrderService from "@/services/purchase-order.service";
import orderActionService from "@/services/order-action.service";
import performanceMetricsService from "@/services/performance-metrics.service";
import vendorDocumentService from "@/services/vendor-document.service";
import { 
  PURCHASE_ORDER_STATUS, 
  ORDER_ACTION_STATUS,
  VENDOR_STATUS 
} from "@/constants/entities";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package01Icon,
  TruckIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

import StatCard from "@/components/vendor/dashboard/StatCard";
import PendingActionsAlert from "@/components/vendor/dashboard/PendingActionsAlert";
import PerformanceMetricsCard from "@/components/vendor/dashboard/PerformanceMetricsCard";
import DocumentStatusCard from "@/components/vendor/dashboard/DocumentStatusCard";
import RecentOrdersCard from "@/components/vendor/dashboard/RecentOrdersCard";
import QuickActionsCard from "@/components/vendor/dashboard/QuickActionsCard";

const STATUS_COLORS = {
  [VENDOR_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [VENDOR_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [VENDOR_STATUS.SUSPENDED]: "bg-red-100 text-red-800",
  [VENDOR_STATUS.INACTIVE]: "bg-gray-100 text-gray-800",
};

const VendorDashboardPage = () => {
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    pendingActions: 0,
    totalDocuments: 0,
    verifiedDocuments: 0,
    onTimeDeliveryRate: 0,
    qualityScore: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (user?.vendorId) {
      fetchDashboardData();
    } else {
      // If no vendorId, try to fetch vendor by user's email or stop loading
      setLoading(false);
    }
  }, [user?.vendorId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [vendorRes, ordersRes, actionsRes, metricsRes, docsRes] = await Promise.all([
        vendorService.getById(user.vendorId),
        purchaseOrderService.getByVendorId(user.vendorId),
        orderActionService.getByVendorId(user.vendorId),
        performanceMetricsService.getByVendorId(user.vendorId),
        vendorDocumentService.getByVendorId(user.vendorId),
      ]);

      if (vendorRes.success) {
        setVendor(vendorRes.data);
      }

      if (ordersRes.success && ordersRes.data) {
        const orders = ordersRes.data;
        
        // Calculate order stats
        const pendingOrders = orders.filter(o => o.status === PURCHASE_ORDER_STATUS.PENDING).length;
        const shippedOrders = orders.filter(o => o.status === PURCHASE_ORDER_STATUS.SHIPPED).length;
        const deliveredOrders = orders.filter(o => o.status === PURCHASE_ORDER_STATUS.DELIVERED).length;
        
        // Get recent orders (last 5)
        const sorted = [...orders].sort((a, b) => 
          new Date(b.orderDate) - new Date(a.orderDate)
        );
        setRecentOrders(sorted.slice(0, 5));

        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders,
          shippedOrders,
          deliveredOrders,
        }));
      }

      if (actionsRes.success && actionsRes.data) {
        const pendingActions = actionsRes.data.filter(
          a => a.status === ORDER_ACTION_STATUS.PENDING
        ).length;
        
        setStats(prev => ({
          ...prev,
          pendingActions,
        }));
      }

      if (metricsRes.success && metricsRes.data && metricsRes.data.length > 0) {
        // Get the latest metrics
        const latestMetrics = metricsRes.data[metricsRes.data.length - 1];
        
        setStats(prev => ({
          ...prev,
          onTimeDeliveryRate: latestMetrics.onTimeDeliveryRate || 0,
          qualityScore: latestMetrics.qualityScore || 0,
        }));
      }

      if (docsRes.success && docsRes.data) {
        const docs = docsRes.data;
        const verifiedDocs = docs.filter(d => d.verified).length;
        
        setStats(prev => ({
          ...prev,
          totalDocuments: docs.length,
          verifiedDocuments: verifiedDocs,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  if (loading && !vendor) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Handle case where vendor account is not properly linked
  if (!user?.vendorId || !vendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back!
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Account Setup Incomplete
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Your vendor profile is being set up. Please contact the administrator if this issue persists.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            You may need to log out and log back in after your account is fully configured.
          </p>
        </div>

        {/* Quick Actions - still show even without full setup */}
        <QuickActionsCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {vendor?.name || "Vendor"}!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Account Status:</span>
          {getStatusBadge(vendor?.status)}
        </div>
      </div>

      {/* Status Reason Alert (for suspended/inactive vendors) */}
      {vendor?.statusReason && (vendor?.status === VENDOR_STATUS.SUSPENDED || vendor?.status === VENDOR_STATUS.INACTIVE) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
            {vendor?.status === VENDOR_STATUS.SUSPENDED ? "Account Suspended" : "Account Inactive"}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">Reason:</span> {vendor.statusReason}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Please contact the administrator for more information.
          </p>
        </div>
      )}

      {/* Pending Actions Alert */}
      <PendingActionsAlert count={stats.pendingActions} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={Package01Icon} 
          loading={loading}
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={Clock01Icon} 
          loading={loading}
        />
        <StatCard 
          title="In Transit" 
          value={stats.shippedOrders} 
          icon={TruckIcon} 
          loading={loading}
        />
        <StatCard 
          title="Delivered" 
          value={stats.deliveredOrders} 
          icon={CheckmarkCircle02Icon} 
          loading={loading}
        />
      </div>

      {/* Performance & Documents Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceMetricsCard 
          onTimeDeliveryRate={stats.onTimeDeliveryRate}
          qualityScore={stats.qualityScore}
        />
        <DocumentStatusCard 
          totalDocuments={stats.totalDocuments}
          verifiedDocuments={stats.verifiedDocuments}
        />
      </div>

      {/* Recent Orders */}
      <RecentOrdersCard orders={recentOrders} />

      {/* Quick Actions */}
      <QuickActionsCard />
    </div>
  );
};

export default VendorDashboardPage;
