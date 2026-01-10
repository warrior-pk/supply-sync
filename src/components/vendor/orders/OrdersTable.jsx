import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Package01Icon,
  ViewIcon,
  ArrowRight01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";
import { PURCHASE_ORDER_STATUS } from "@/constants/entities";

const STATUS_COLORS = {
  [PURCHASE_ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [PURCHASE_ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [PURCHASE_ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [PURCHASE_ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [PURCHASE_ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

const OrdersTable = ({
  orders,
  plants,
  pendingActions,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const handleOpenOrder = (orderId) => {
    navigate(`/vendor/manage/orders/${orderId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Package01Icon} size={20} />
          My Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <HugeiconsIcon icon={Package01Icon} size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No purchase orders found</p>
            <p className="text-sm">Orders assigned to you will appear here</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const hasPendingAction = pendingActions[order.id];
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          #{order.id.slice(0, 6).toUpperCase()}
                          {hasPendingAction && (
                            <span 
                              className="relative flex h-3 w-3"
                              title="Pending action request"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{plants[order.plantId]?.name || order.plantId}</TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>
                        {order.actualDeliveryDate ? (
                          <div className="space-y-1">
                            <span className="text-green-600">{formatDate(order.actualDeliveryDate)}</span>
                            <p className="text-xs text-muted-foreground">Delivered</p>
                          </div>
                        ) : (
                          formatDate(order.expectedDeliveryDate)
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(order)}
                            title="Quick View"
                          >
                            <HugeiconsIcon icon={ViewIcon} size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenOrder(order.id)}
                            className="gap-1"
                          >
                            {hasPendingAction && (
                              <HugeiconsIcon icon={Alert02Icon} size={14} className="text-yellow-600" />
                            )}
                            Open
                            <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => onPageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => onPageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => onPageChange(currentPage + 1)}
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
  );
};

export default OrdersTable;
