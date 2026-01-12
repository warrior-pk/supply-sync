import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Package01Icon, Clock01Icon, Tick02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";
import { STATUS_COLORS } from "./PurchaseOrdersTable";
import { ORDER_ACTION_STATUS } from "@/constants/entities";

const ACTION_STATUS_COLORS = {
  [ORDER_ACTION_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_ACTION_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [ORDER_ACTION_STATUS.REJECTED]: "bg-red-100 text-red-800",
};

const ViewOrderDetailsDialog = ({
  open,
  onOpenChange,
  order,
  vendors,
  plants,
  products,
  orderItems,
  orderActions = [],
  loadingItems,
}) => {
  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const getActionStatusBadge = (status) => {
    const colorClass = ACTION_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        {order && (
          <div className="space-y-4 py-4">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{vendors[order.vendorId]?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plant</p>
                <p className="font-medium">{plants[order.plantId]?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Delivery</p>
                <p className="font-medium">{formatDate(order.expectedDeliveryDate)}</p>
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

            {/* Order Actions */}
            {orderActions.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Action Requests</h4>
                  <div className="space-y-2">
                    {orderActions.map((action) => (
                      <div key={action.id} className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{action.actionType} Request</p>
                            <p className="text-sm text-muted-foreground">{action.message}</p>
                          </div>
                          {getActionStatusBadge(action.status)}
                        </div>
                        {action.vendorResponse && action.status !== ORDER_ACTION_STATUS.PENDING && (
                          <div className="text-sm border-t pt-2 mt-2">
                            <span className="text-muted-foreground">Vendor Response: </span>
                            <span>{action.vendorResponse}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewOrderDetailsDialog;
