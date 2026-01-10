import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import { Package01Icon } from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";

const OrderDetailsCard = ({ order, orderItems, plants, products }) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Package01Icon} size={20} />
          Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-muted-foreground">Plant</Label>
            <p className="font-medium">{plants[order.plantId]?.name || order.plantId}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Order Date</Label>
            <p className="font-medium">{formatDate(order.orderDate)}</p>
          </div>
          {order.actualDeliveryDate && (
            <div>
              <Label className="text-muted-foreground">Actual Delivery</Label>
              <p className="font-medium text-green-600">{formatDate(order.actualDeliveryDate)}</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Order Items */}
        <div>
          <h4 className="font-medium mb-3">Order Items</h4>
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
                  <TableCell className="font-medium">
                    {products[item.productId]?.name || item.productId}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  {item.unitPrice && (
                    <TableCell className="text-right">₹{item.unitPrice}</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsCard;
