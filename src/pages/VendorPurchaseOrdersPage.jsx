import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "@/store/auth.store";
import purchaseOrderService from "@/services/purchase-order.service";
import purchaseOrderItemService from "@/services/purchase-order-item.service";
import orderActionService from "@/services/order-action.service";
import plantService from "@/services/plant.service";
import productService from "@/services/product.service";
import { ORDER_ACTION_STATUS } from "@/constants/entities";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

import OrdersTable from "@/components/vendor/orders/OrdersTable";
import OrderQuickViewDialog from "@/components/vendor/orders/OrderQuickViewDialog";

const ITEMS_PER_PAGE = 10;

const VendorPurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [plants, setPlants] = useState({});
  const [products, setProducts] = useState({});
  const [pendingActions, setPendingActions] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // View details dialog state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (user?.vendorId) {
      fetchPurchaseOrders();
      fetchPendingActions();
    } else {
      setLoading(false);
    }
  }, [currentPage, user?.vendorId]);

  const fetchMasterData = async () => {
    try {
      const [plantsRes, productsRes] = await Promise.all([
        plantService.getAll(),
        productService.getAll(),
      ]);

      if (plantsRes.success) {
        const plantMap = {};
        plantsRes.data.forEach((plant) => {
          plantMap[plant.id] = plant;
        });
        setPlants(plantMap);
      }

      if (productsRes.success) {
        const productMap = {};
        productsRes.data.forEach((product) => {
          productMap[product.id] = product;
        });
        setProducts(productMap);
      }
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders for this vendor with pagination
      const queryParams = new URLSearchParams({
        vendorId: user.vendorId,
        _page: currentPage,
        _limit: ITEMS_PER_PAGE,
        _sort: "orderDate",
        _order: "desc",
      });

      const response = await purchaseOrderService.getAll({
        vendorId: user.vendorId,
        _page: currentPage,
        _limit: ITEMS_PER_PAGE,
        _sort: "orderDate",
        _order: "desc",
      });

      if (response.success) {
        // Filter for this vendor (since getAll doesn't filter by vendorId)
        const vendorOrders = response.data.filter(
          (order) => order.vendorId === user.vendorId
        );
        setPurchaseOrders(vendorOrders);
        setTotalItems(vendorOrders.length);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast.error("Failed to fetch purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingActions = async () => {
    try {
      const response = await orderActionService.getByVendorId(user.vendorId);
      
      if (response.success) {
        // Create a map of purchaseOrderId -> hasPendingAction
        const pendingMap = {};
        response.data.forEach((action) => {
          if (action.status === ORDER_ACTION_STATUS.PENDING) {
            pendingMap[action.purchaseOrderId] = true;
          }
        });
        setPendingActions(pendingMap);
      }
    } catch (error) {
      console.error("Error fetching pending actions:", error);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetails = async (order) => {
    setViewOrder(order);
    setViewDetailsOpen(true);
    setLoadingItems(true);

    try {
      const response = await purchaseOrderItemService.getByPurchaseOrderId(order.id);
      if (response.success) {
        setOrderItems(response.data || []);
      } else {
        toast.error("Failed to load order items");
        setOrderItems([]);
      }
    } catch (error) {
      console.error("Error fetching order items:", error);
      toast.error("Failed to load order items");
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Handle case where vendor account is not properly linked
  if (!user?.vendorId) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/vendor")} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-2">
            View and manage purchase orders assigned to you.
          </p>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/vendor")} className="cursor-pointer">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Purchase Orders</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-muted-foreground mt-2">
          View and manage purchase orders assigned to you.
        </p>
      </div>

      {/* Purchase Orders Table */}
      <OrdersTable
        orders={purchaseOrders}
        plants={plants}
        pendingActions={pendingActions}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />

      {/* View Details Dialog */}
      <OrderQuickViewDialog
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
        order={viewOrder}
        orderItems={orderItems}
        loadingItems={loadingItems}
        plants={plants}
        products={products}
      />
    </div>
  );
};

export default VendorPurchaseOrdersPage;
