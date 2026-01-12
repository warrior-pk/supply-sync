import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon } from "@hugeicons/core-free-icons";
import { PURCHASE_ORDER_STATUS } from "@/constants/entities";

const UpdateOrderCard = ({
  order,
  expectedDeliveryDate,
  selectedStatus,
  onDeliveryDateChange,
  onStatusChange,
  onUpdate,
  saving,
  availableStatusOptions,
}) => {
  const isDisabled = [PURCHASE_ORDER_STATUS.DELIVERED, PURCHASE_ORDER_STATUS.CANCELLED].includes(order?.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Edit02Icon} size={20} />
          Update Order
        </CardTitle>
        <CardDescription>
          Update delivery date and order status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expected Delivery Date */}
        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
          <Input
            id="deliveryDate"
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => onDeliveryDateChange(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            disabled={isDisabled}
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Order Status</Label>
          <Select 
            value={selectedStatus} 
            onValueChange={onStatusChange}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status">
                {(value) => value}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableStatusOptions.map((status) => (
                <SelectItem key={status} value={status} label={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Status can only be moved forward in the workflow
          </p>
        </div>

        <Button 
          onClick={onUpdate} 
          disabled={saving || isDisabled}
          className="w-full"
        >
          {saving ? "Saving..." : "Update Order"}
        </Button>

        {isDisabled && (
          <p className="text-sm text-muted-foreground text-center">
            This order is {order?.status?.toLowerCase()} and cannot be modified.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpdateOrderCard;
