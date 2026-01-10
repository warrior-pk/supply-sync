import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import purchaseOrderService from "@/services/purchase-order.service";
import purchaseOrderItemService from "@/services/purchase-order-item.service";
import orderActionService from "@/services/order-action.service";
import vendorService from "@/services/vendor.service";
import plantService from "@/services/plant.service";
import productService from "@/services/product.service";
import CreatePurchaseOrderDialog from "@/components/admin/purchase-order/CreatePurchaseOrderDialog";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Add01Icon, 
  Package01Icon, 
  Calendar03Icon, 
  TruckIcon,
  MoreVerticalIcon,
  Tick02Icon,
  Cancel01Icon,
  MoneyReceive02Icon,
  Edit02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-time";
import { PURCHASE_ORDER_STATUS } from "@/constants/entities";

const ITEMS_PER_PAGE = 10;

// Color coding similar to VendorCardItem
const STATUS_COLORS = {
  [PURCHASE_ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [PURCHASE_ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [PURCHASE_ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [PURCHASE_ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [PURCHASE_ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

// Action types for the order
const ORDER_ACTIONS = {
  UPDATE: "UPDATE",
  CANCEL: "CANCEL",
  RETURN: "RETURN",
};

const ACTION_CONFIG = {
  [ORDER_ACTIONS.UPDATE]: {
    label: "Update Order",
    icon: Edit02Icon,
    description: "Update the status or details of this order",
    buttonText: "Update Order",
    buttonVariant: "default",
  },
  [ORDER_ACTIONS.CANCEL]: {
    label: "Cancel Order",
    icon: Cancel01Icon,
    description: "Cancel this purchase order with a reason",
    buttonText: "Cancel Order",
    buttonVariant: "destructive",
  },
  [ORDER_ACTIONS.RETURN]: {
    label: "Request Return",
    icon: MoneyReceive02Icon,
    description: "Request a return for this order",
    buttonText: "Request Return",
    buttonVariant: "secondary",
  },
};

const PurchaseOrderPage = () => {
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
  const [actionMessage, setActionMessage] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // View details dialog state
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
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

  const handleActionClick = (order, action) => {
    setSelectedOrder(order);
    setSelectedAction(action);
    setActionMessage("");
    setActionDialogOpen(true);
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

  const handleActionSubmit = async () => {
    if (!actionMessage.trim()) {
      toast.error("Please provide a message/reason");
      return;
    }

    setIsSubmittingAction(true);
    
    try {
      const response = await orderActionService.create({
        purchaseOrderId: selectedOrder.id,
        vendorId: selectedOrder.vendorId,
        actionType: selectedAction,
        message: actionMessage,
      });

      if (response.success) {
        const actionLabel = ACTION_CONFIG[selectedAction]?.label || "Action";
        toast.success(`${actionLabel} request submitted for Order #${selectedOrder.id}`);
        
        setActionDialogOpen(false);
        setSelectedOrder(null);
        setSelectedAction(null);
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

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  // Check if action is available based on order status
  const getAvailableActions = (order) => {
    const status = order.status;
    const actions = [];
    
    // Update is available for PENDING and CONFIRMED
    if ([PURCHASE_ORDER_STATUS.PENDING, PURCHASE_ORDER_STATUS.CONFIRMED].includes(status)) {
      actions.push(ORDER_ACTIONS.UPDATE);
    }
    
    // Cancel is available for PENDING, CONFIRMED, and SHIPPED
    if ([PURCHASE_ORDER_STATUS.PENDING, PURCHASE_ORDER_STATUS.CONFIRMED, PURCHASE_ORDER_STATUS.SHIPPED].includes(status)) {
      actions.push(ORDER_ACTIONS.CANCEL);
    }
    
    // Return is available for DELIVERED and CANCELLED
    if ([PURCHASE_ORDER_STATUS.DELIVERED, PURCHASE_ORDER_STATUS.CANCELLED].includes(status)) {
      actions.push(ORDER_ACTIONS.RETURN);
    }
    
    return actions;
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Plant</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected / Delivered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((order) => {
                    const availableActions = getAvailableActions(order);
                    return (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-medium">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        {vendors[order.vendorId]?.name || "Unknown Vendor"}
                      </TableCell>
                      <TableCell>
                        {plants[order.plantId]?.name || "Unknown Plant"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Calendar03Icon} size={16} className="text-muted-foreground" />
                          {formatDate(order.orderDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={TruckIcon} size={16} className="text-muted-foreground" />
                          {formatDate(order.expectedDeliveryDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(order)}
                              className="gap-2"
                            >
                              <HugeiconsIcon icon={ViewIcon} size={16} />
                              View Details
                            </DropdownMenuItem>
                            {availableActions.length > 0 && <DropdownMenuSeparator />}
                            {availableActions.map((action, idx) => {
                              const config = ACTION_CONFIG[action];
                              return (
                                <React.Fragment key={action}>
                                  {idx > 0 && <DropdownMenuSeparator />}
                                  <DropdownMenuItem
                                    onClick={() => handleActionClick(order, action)}
                                    className="gap-2"
                                  >
                                    <HugeiconsIcon icon={config.icon} size={16} />
                                    {config.label}
                                  </DropdownMenuItem>
                                </React.Fragment>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>

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
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Package01Icon} size={20} />
              Order Details
            </DialogTitle>
            <DialogDescription>
              View complete details of this purchase order
            </DialogDescription>
          </DialogHeader>

          {viewOrder && (
            <div className="space-y-4 py-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-mono font-medium">#{viewOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(viewOrder.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{vendors[viewOrder.vendorId]?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plant</p>
                  <p className="font-medium">{plants[viewOrder.plantId]?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{formatDate(viewOrder.orderDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Delivery</p>
                  <p className="font-medium">{formatDate(viewOrder.expectedDeliveryDate)}</p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div className="space-y-3">
                <h4 className="font-medium">Order Items</h4>
                {loadingItems ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : orderItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No items found for this order
                  </p>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map((item, index) => (
                      <div key={item.id || index} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {products[item.productId]?.name || "Unknown Product"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {products[item.productId]?.category || ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && (
                <HugeiconsIcon icon={ACTION_CONFIG[selectedAction]?.icon} size={20} />
              )}
              {ACTION_CONFIG[selectedAction]?.label || "Order Action"}
            </DialogTitle>
            <DialogDescription>
              {ACTION_CONFIG[selectedAction]?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Order Info */}
            {selectedOrder && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Order ID: </span>
                  <span className="font-mono font-medium">#{selectedOrder.id}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Vendor: </span>
                  <span className="font-medium">{vendors[selectedOrder.vendorId]?.name}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Status: </span>
                  {getStatusBadge(selectedOrder.status)}
                </p>
              </div>
            )}

            {/* Message Input */}
            <div className="space-y-2">
              <Label htmlFor="actionMessage">
                {selectedAction === ORDER_ACTIONS.CANCEL 
                  ? "Cancellation Reason *" 
                  : selectedAction === ORDER_ACTIONS.RETURN 
                    ? "Return Reason *" 
                    : "Message/Notes *"}
              </Label>
              <Textarea
                id="actionMessage"
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
                placeholder={
                  selectedAction === ORDER_ACTIONS.CANCEL 
                    ? "Please provide a reason for cancellation..." 
                    : selectedAction === ORDER_ACTIONS.RETURN 
                      ? "Please provide details for the return request..." 
                      : "Enter your message or notes..."
                }
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setActionDialogOpen(false)}
                disabled={isSubmittingAction}
              >
                Cancel
              </Button>
              <Button 
                variant={ACTION_CONFIG[selectedAction]?.buttonVariant || "default"}
                onClick={handleActionSubmit}
                disabled={isSubmittingAction || !actionMessage.trim()}
              >
                {isSubmittingAction ? "Submitting..." : ACTION_CONFIG[selectedAction]?.buttonText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderPage;
