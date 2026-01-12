import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { STATUS_COLORS, ORDER_ACTIONS, ACTION_CONFIG } from "./PurchaseOrdersTable";
import { formatDate } from "@/lib/date-time";

const OrderActionDialog = ({
  open,
  onOpenChange,
  order,
  action,
  vendors,
  orderItems = [],
  products = {},
  actionMessage,
  onActionMessageChange,
  onSubmit,
  isSubmitting,
}) => {
  const [proposedChanges, setProposedChanges] = useState({
    expectedDeliveryDate: "",
    itemChanges: [],
  });

  // Initialize proposed changes when dialog opens with UPDATE action
  useEffect(() => {
    if (open && action === ORDER_ACTIONS.UPDATE && order) {
      setProposedChanges({
        expectedDeliveryDate: order.expectedDeliveryDate ? 
          new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : "",
        itemChanges: orderItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: products[item.productId]?.name || "Unknown Product",
          originalQuantity: item.quantity,
          newQuantity: item.quantity,
          unit: item.unit,
        })),
      });
    }
  }, [open, action, order, orderItems, products]);

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    setProposedChanges(prev => ({
      ...prev,
      itemChanges: prev.itemChanges.map(item =>
        item.id === itemId ? { ...item, newQuantity: parseInt(newQuantity) || 0 } : item
      ),
    }));
  };

  const handleDateChange = (newDate) => {
    setProposedChanges(prev => ({
      ...prev,
      expectedDeliveryDate: newDate,
    }));
  };

  const handleSubmit = () => {
    if (action === ORDER_ACTIONS.UPDATE) {
      // Pass proposed changes along with the action
      onSubmit(proposedChanges);
    } else {
      onSubmit(null);
    }
  };

  const config = ACTION_CONFIG[action];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={action === ORDER_ACTIONS.UPDATE ? "max-w-lg max-h-[90vh] flex flex-col" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config && (
              <HugeiconsIcon icon={config.icon} size={20} />
            )}
            {config?.label || "Order Action"}
          </DialogTitle>
          <DialogDescription>
            {config?.description}
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 py-4 ${action === ORDER_ACTIONS.UPDATE ? "overflow-y-auto flex-1" : ""}`}>
          {/* Order Info */}
          {order && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Order ID: </span>
                <span className="font-mono font-medium">#{order.id}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Vendor: </span>
                <span className="font-medium">{vendors[order.vendorId]?.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                {getStatusBadge(order.status)}
              </p>
            </div>
          )}

          {/* UPDATE: Show proposed changes form */}
          {action === ORDER_ACTIONS.UPDATE && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Proposed Changes</h4>
                
                {/* Delivery Date Change */}
                <div className="space-y-2">
                  <Label htmlFor="newDeliveryDate">New Expected Delivery Date</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Current: {order?.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : "N/A"}
                    </span>
                  </div>
                  <Input
                    id="newDeliveryDate"
                    type="date"
                    value={proposedChanges.expectedDeliveryDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Quantity Changes */}
                {proposedChanges.itemChanges.length > 0 && (
                  <div className="space-y-2">
                    <Label>Item Quantity Changes</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {proposedChanges.itemChanges.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {products[item.productId]?.name || "Unknown Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Current: {item.originalQuantity} {item.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              className="w-24 h-8"
                              value={item.newQuantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            />
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="actionMessage">
              {action === ORDER_ACTIONS.CANCEL 
                ? "Cancellation Reason *" 
                : action === ORDER_ACTIONS.RETURN 
                  ? "Return Reason *" 
                  : "Reason for Update *"}
            </Label>
            <Textarea
              id="actionMessage"
              value={actionMessage}
              onChange={(e) => onActionMessageChange(e.target.value)}
              placeholder={
                action === ORDER_ACTIONS.CANCEL 
                  ? "Please provide a reason for cancellation..." 
                  : action === ORDER_ACTIONS.RETURN 
                    ? "Please provide details for the return request..." 
                    : "Explain why these changes are needed..."
              }
              rows={3}
            />
          </div>
        </div>

        {/* Actions - outside scrollable area */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant={config?.buttonVariant || "default"}
            onClick={handleSubmit}
            disabled={isSubmitting || !actionMessage.trim()}
          >
            {isSubmitting ? "Submitting..." : (config?.buttonText || "Submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderActionDialog;
