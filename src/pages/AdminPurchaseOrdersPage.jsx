import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import purchaseOrderService from "@/services/purchase-order.service";
import purchaseOrderItemService from "@/services/purchase-order-item.service";
import orderActionService from "@/services/order-action.service";
import vendorService from "@/services/vendor.service";
import plantService from "@/services/plant.service";
import productService from "@/services/product.service";
import CreatePurchaseOrderDialog from "@/components/admin/purchase-order/CreatePurchaseOrderDialog";
import PurchaseOrdersTable, { ORDER_ACTIONS, ACTION_CONFIG } from "@/components/admin/purchase-order/PurchaseOrdersTable";
import ViewOrderDetailsDialog from "@/components/admin/purchase-order/ViewOrderDetailsDialog";
import OrderActionDialog from "@/components/admin/purchase-order/OrderActionDialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Add01Icon, 
  Package01Icon, 
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

const AdminPurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState({});
  const [plants, setPlants] = useState({});
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // View details dialog state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderActions, setOrderActions] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Check for restock data from inventory page
  const restockData = location.state?.restockData;

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [currentPage]);

  useEffect(() => {
    // Open dialog if we have restock data
    if (restockData) {
      setDialogOpen(true);
      // Clear the location state to prevent dialog reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [restockData]);

  const fetchMasterData = async () => {
    try {
      const [vendorsRes, plantsRes, productsRes] = await Promise.all([
        vendorService.getAll(),
        plantService.getAll(),
        productService.getAll(),
      ]);

      if (vendorsRes.success) {
        const vendorMap = {};
        vendorsRes.data.forEach((vendor) => {
          vendorMap[vendor.id] = vendor;
        });
        setVendors(vendorMap);
      }

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
      toast.error("Failed to load master data");
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrderService.getAll({
        _page: currentPage,
        _limit: ITEMS_PER_PAGE,
        _sort: "orderDate",
        _order: "desc",
      });

      if (response.success) {
        setPurchaseOrders(response.data || []);
        setTotalItems(response.total);
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

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOrderCreated = () => {
    fetchPurchaseOrders();
    setDialogOpen(false);
    toast.success("Purchase order created successfully");
  };

  const handleActionClick = async (order, action) => {
    setSelectedOrder(order);
    setSelectedAction(action);
    setActionMessage("");
    setSelectedOrderItems([]);
    
    // For UPDATE action, fetch order items to show in dialog
    if (action === "UPDATE") {
      try {
        const response = await purchaseOrderItemService.getByPurchaseOrderId(order.id);
        if (response.success) {
          setSelectedOrderItems(response.data || []);
        }
      } catch (error) {
        console.error("Error fetching order items:", error);
      }
    }
    
    setActionDialogOpen(true);
  };

  const handleViewDetails = async (order) => {
    setViewOrder(order);
    setViewDetailsOpen(true);
    setLoadingItems(true);
    setOrderActions([]);
    
    try {
      const [itemsRes, actionsRes] = await Promise.all([
        purchaseOrderItemService.getByPurchaseOrderId(order.id),
        orderActionService.getByPurchaseOrderId(order.id),
      ]);
      
      if (itemsRes.success) {
        setOrderItems(itemsRes.data || []);
      } else {
        toast.error("Failed to load order items");
        setOrderItems([]);
      }
      
      if (actionsRes.success) {
        setOrderActions(actionsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
      setOrderItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleActionSubmit = async (proposedChanges = null) => {
    if (!actionMessage.trim()) {
      toast.error("Please provide a message/reason");
      return;
    }

    setIsSubmittingAction(true);
    
    try {
      const actionData = {
        purchaseOrderId: selectedOrder.id,
        vendorId: selectedOrder.vendorId,
        actionType: selectedAction,
        message: actionMessage,
      };
      
      // Include proposed changes for UPDATE actions
      if (selectedAction === "UPDATE" && proposedChanges) {
        actionData.proposedChanges = proposedChanges;
      }
      
      const response = await orderActionService.create(actionData);

      if (response.success) {
        const actionLabel = ACTION_CONFIG[selectedAction]?.label || "Action";
        toast.success(`${actionLabel} request submitted for Order #${selectedOrder.id}`);
        
        // Refresh orders list to show any status changes
        fetchPurchaseOrders();
        
        setActionDialogOpen(false);
        setSelectedOrder(null);
        setSelectedAction(null);
        setSelectedOrderItems([]);
        setActionMessage("");
      } else {
        toast.error(response.message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting action:", error);
      toast.error("An error occurred while submitting the request");
    } finally {
      setIsSubmittingAction(false);
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

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/admin")} className="cursor-pointer">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-2">
            Manage purchase orders and track deliveries from vendors.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Create Purchase Order
        </Button>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Package01Icon} size={20} />
            All Purchase Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {purchaseOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={Package01Icon} size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No purchase orders found</p>
              <p className="text-sm">Create your first purchase order to get started</p>
            </div>
          ) : (
            <>
              <PurchaseOrdersTable
                orders={purchaseOrders}
                vendors={vendors}
                plants={plants}
                onViewDetails={handleViewDetails}
                onActionClick={handleActionClick}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => handlePageChange(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Purchase Order Dialog */}
      <CreatePurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onOrderCreated={handleOrderCreated}
        vendors={Object.values(vendors)}
        plants={Object.values(plants)}
        products={Object.values(products)}
        restockData={restockData}
      />

      {/* View Details Dialog */}
      <ViewOrderDetailsDialog
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
        order={viewOrder}
        vendors={vendors}
        plants={plants}
        products={products}
        orderItems={orderItems}
        orderActions={orderActions}
        loadingItems={loadingItems}
      />

      {/* Action Dialog */}
      <OrderActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        order={selectedOrder}
        action={selectedAction}
        vendors={vendors}
        orderItems={selectedOrderItems}
        products={products}
        actionMessage={actionMessage}
        onActionMessageChange={setActionMessage}
        onSubmit={handleActionSubmit}
        isSubmitting={isSubmittingAction}
      />
    </div>
  );
};

export default AdminPurchaseOrdersPage;
