import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthStore from "@/store/auth.store";
import purchaseOrderService from "@/services/purchase-order.service";
import purchaseOrderItemService from "@/services/purchase-order-item.service";
import orderActionService from "@/services/order-action.service";
import plantService from "@/services/plant.service";
import productService from "@/services/product.service";
import { getCurrentUTC } from "@/lib/date-time";
import { 
  PURCHASE_ORDER_STATUS, 
  ORDER_ACTION_STATUS, 
  ORDER_ACTION_TYPE 
} from "@/constants/entities";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft02Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import OrderDetailsCard from "@/components/vendor/orders/OrderDetailsCard";
import UpdateOrderCard from "@/components/vendor/orders/UpdateOrderCard";
import PendingActionsCard from "@/components/vendor/orders/PendingActionsCard";

const STATUS_COLORS = {
  [PURCHASE_ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [PURCHASE_ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [PURCHASE_ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [PURCHASE_ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [PURCHASE_ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

// Allowed status transitions for vendor
const ALLOWED_STATUS_TRANSITIONS = {
  [PURCHASE_ORDER_STATUS.PENDING]: [PURCHASE_ORDER_STATUS.CONFIRMED],
  [PURCHASE_ORDER_STATUS.CONFIRMED]: [PURCHASE_ORDER_STATUS.SHIPPED],
  [PURCHASE_ORDER_STATUS.SHIPPED]: [PURCHASE_ORDER_STATUS.DELIVERED],
  [PURCHASE_ORDER_STATUS.DELIVERED]: [],
  [PURCHASE_ORDER_STATUS.CANCELLED]: [],
};

const VendorOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [plants, setPlants] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit state
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Action response state
  const [actionResponses, setActionResponses] = useState({});
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

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

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      const [orderRes, itemsRes, actionsRes] = await Promise.all([
        purchaseOrderService.getById(id),
        purchaseOrderItemService.getByPurchaseOrderId(id),
        orderActionService.getByPurchaseOrderId(id),
      ]);

      if (orderRes.success && orderRes.data) {
        const orderData = Array.isArray(orderRes.data) ? orderRes.data[0] : orderRes.data;
        
        // Verify this order belongs to the vendor
        if (orderData.vendorId !== user.vendorId) {
          toast.error("You don't have access to this order");
          navigate("/vendor/manage/orders");
          return;
        }
        
        setOrder(orderData);
        setSelectedStatus(orderData.status);
        
        // Format date for input
        if (orderData.expectedDeliveryDate) {
          const date = new Date(orderData.expectedDeliveryDate);
          setExpectedDeliveryDate(date.toISOString().split("T")[0]);
        }
      } else {
        toast.error("Order not found");
        navigate("/vendor/manage/orders");
        return;
      }

      if (itemsRes.success) {
        setOrderItems(itemsRes.data || []);
      }

      if (actionsRes.success) {
        // Filter for pending actions
        const pending = actionsRes.data.filter(
          (action) => action.status === ORDER_ACTION_STATUS.PENDING
        );
        setPendingActions(pending);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setSaving(true);
      
      const updateData = {
        ...order,
        expectedDeliveryDate: new Date(expectedDeliveryDate).toISOString(),
        status: selectedStatus,
      };

      // Add actual delivery date if status is DELIVERED
      if (selectedStatus === PURCHASE_ORDER_STATUS.DELIVERED && !order.actualDeliveryDate) {
        updateData.actualDeliveryDate = getCurrentUTC();
      }

      const response = await purchaseOrderService.update(id, updateData);
      
      if (response.success) {
        setOrder(response.data);
        toast.success("Order updated successfully");
      } else {
        toast.error(response.message || "Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("An error occurred while updating order");
    } finally {
      setSaving(false);
    }
  };

  const handleActionResponse = async (action, approved) => {
    const vendorResponse = actionResponses[action.id] || "";
    
    if (!vendorResponse.trim() && !approved) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingAction(action.id);
      
      const updateData = {
        ...action,
        status: approved ? ORDER_ACTION_STATUS.APPROVED : ORDER_ACTION_STATUS.REJECTED,
        resolvedAt: getCurrentUTC(),
        resolvedBy: user.vendorId,
        vendorResponse: vendorResponse.trim() || (approved ? "Approved" : "Rejected"),
      };

      const response = await orderActionService.update(action.id, updateData);
      
      if (response.success) {
        // If action was approved and it's a CANCEL request, update order status
        if (approved && action.actionType === ORDER_ACTION_TYPE.CANCEL) {
          await purchaseOrderService.update(order.id, {
            ...order,
            status: PURCHASE_ORDER_STATUS.CANCELLED,
          });
          setOrder({ ...order, status: PURCHASE_ORDER_STATUS.CANCELLED });
          setSelectedStatus(PURCHASE_ORDER_STATUS.CANCELLED);
        }

        // Remove from pending actions
        setPendingActions(pendingActions.filter((a) => a.id !== action.id));
        
        // Clear response
        setActionResponses((prev) => {
          const updated = { ...prev };
          delete updated[action.id];
          return updated;
        });

        toast.success(`Action ${approved ? "approved" : "rejected"} successfully`);
      } else {
        toast.error(response.message || "Failed to process action");
      }
    } catch (error) {
      console.error("Error processing action:", error);
      toast.error("An error occurred while processing action");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResponseChange = (actionId, value) => {
    setActionResponses((prev) => ({
      ...prev,
      [actionId]: value,
    }));
  };

  const handleApprove = (action) => {
    handleActionResponse(action, true);
  };

  const handleReject = (action) => {
    handleActionResponse(action, false);
  };

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const getAvailableStatusOptions = () => {
    if (!order) return [];
    const currentStatus = order.status;
    const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    return [currentStatus, ...allowedNext];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">Order not found</p>
        <Button variant="outline" onClick={() => navigate("/vendor/manage/orders")} className="mt-4">
          Back to Orders
        </Button>
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
            <BreadcrumbLink onClick={() => navigate("/vendor/manage/orders")} className="cursor-pointer">
              Purchase Orders
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>#{order.id.slice(0, 6).toUpperCase()}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/vendor/manage/orders")}>
          <HugeiconsIcon icon={ArrowLeft02Icon} size={20} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Order #{order.id.slice(0, 6).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage order details and respond to action requests
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      {/* Pending Actions Alert */}
      {pendingActions.length > 0 && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <HugeiconsIcon icon={Alert02Icon} size={20} className="text-yellow-600" />
          <AlertTitle className="text-yellow-800">
            {pendingActions.length} Pending Action Request{pendingActions.length > 1 ? "s" : ""}
          </AlertTitle>
          <AlertDescription className="text-yellow-700">
            Please review and respond to the action requests below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details Card */}
        <OrderDetailsCard 
          order={order}
          orderItems={orderItems}
          plants={plants}
          products={products}
        />

        {/* Update Order Card */}
        <UpdateOrderCard
          order={order}
          expectedDeliveryDate={expectedDeliveryDate}
          selectedStatus={selectedStatus}
          onDeliveryDateChange={setExpectedDeliveryDate}
          onStatusChange={setSelectedStatus}
          onUpdate={handleUpdateOrder}
          saving={saving}
          availableStatusOptions={getAvailableStatusOptions()}
        />
      </div>

      {/* Pending Action Requests */}
      <PendingActionsCard
        actions={pendingActions}
        actionResponses={actionResponses}
        onResponseChange={handleResponseChange}
        onApprove={handleApprove}
        onReject={handleReject}
        processingAction={processingAction}
      />
    </div>
  );
};

export default VendorOrderDetailsPage;
