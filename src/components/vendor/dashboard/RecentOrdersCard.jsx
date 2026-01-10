import React from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const RecentOrdersCard = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Package01Icon} size={20} />
            Recent Orders
          </CardTitle>
          <CardDescription>
            Your latest purchase orders
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/vendor/manage/orders")}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <HugeiconsIcon icon={Package01Icon} size={32} className="mx-auto mb-2 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/vendor/manage/orders/${order.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <HugeiconsIcon icon={Package01Icon} size={16} />
                  </div>
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}>
                    {order.status}
                  </Badge>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrdersCard;
