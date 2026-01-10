import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { Package01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";
import { PURCHASE_ORDER_STATUS } from "@/constants/entities";

const STATUS_COLORS = {
  [PURCHASE_ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [PURCHASE_ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [PURCHASE_ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [PURCHASE_ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [PURCHASE_ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

const OrderQuickViewDialog = ({ 
  open, 
  onOpenChange, 
  order, 
  orderItems, 
  loadingItems, 
  plants, 
  products 
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const handleOpenFullDetails = () => {
    if (!order) return;
    onOpenChange(false);
    navigate(`/vendor/manage/orders/${order.id}`);
  };

  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Package01Icon} size={20} />
            Order #{order.id.slice(0, 6).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Order details and items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Plant:</span>
              <p className="font-medium">{plants[order.plantId]?.name || order.plantId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="mt-1">{getStatusBadge(order.status)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Order Date:</span>
              <p className="font-medium">{formatDate(order.orderDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Delivery:</span>
              <p className="font-medium">{formatDate(order.expectedDeliveryDate)}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            {loadingItems ? (
              <div className="space-y-2">
                <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              ) : orderItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      {orderItems[0]?.unitPrice && <TableHead className="text-right">Unit Price</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{products[item.productId]?.name || item.productId}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        {item.unitPrice && (
                          <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleOpenFullDetails} className="gap-2">
                Open Full Details
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderQuickViewDialog;
