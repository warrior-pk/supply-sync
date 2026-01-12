import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  TruckIcon,
  MoreVerticalIcon,
  ViewIcon,
  Edit02Icon,
  Cancel01Icon,
  MoneyReceive02Icon,
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

const ORDER_ACTIONS = {
  UPDATE: "UPDATE",
  CANCEL: "CANCEL",
  RETURN: "RETURN",
};

const ACTION_CONFIG = {
  [ORDER_ACTIONS.UPDATE]: {
    label: "Update Order",
    icon: Edit02Icon,
    buttonText: "Submit Update Request",
    buttonVariant: "default",
    description: "Propose changes to this order",
  },
  [ORDER_ACTIONS.CANCEL]: {
    label: "Cancel Order",
    icon: Cancel01Icon,
    buttonText: "Submit Cancellation",
    buttonVariant: "destructive",
    description: "Request to cancel this order",
  },
  [ORDER_ACTIONS.RETURN]: {
    label: "Request Return",
    icon: MoneyReceive02Icon,
    buttonText: "Submit Return Request",
    buttonVariant: "default",
    description: "Request to return items from this order",
  },
};

const PurchaseOrdersTable = ({
  orders,
  vendors,
  plants,
  onViewDetails,
  onActionClick,
}) => {
  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const getAvailableActions = (order) => {
    const status = order.status;
    const actions = [];

    if ([PURCHASE_ORDER_STATUS.PENDING, PURCHASE_ORDER_STATUS.CONFIRMED].includes(status)) {
      actions.push(ORDER_ACTIONS.UPDATE);
    }

    if ([PURCHASE_ORDER_STATUS.PENDING, PURCHASE_ORDER_STATUS.CONFIRMED, PURCHASE_ORDER_STATUS.SHIPPED].includes(status)) {
      actions.push(ORDER_ACTIONS.CANCEL);
    }

    if ([PURCHASE_ORDER_STATUS.DELIVERED, PURCHASE_ORDER_STATUS.CANCELLED].includes(status)) {
      actions.push(ORDER_ACTIONS.RETURN);
    }

    return actions;
  };

  return (
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
        {orders.map((order) => {
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
                  <DropdownMenuTrigger className="focus-visible:border-ring focus-visible:ring-ring/50 rounded-md border border-transparent focus-visible:ring-[3px] inline-flex items-center justify-center transition-all outline-none hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 size-8">
                    <HugeiconsIcon icon={MoreVerticalIcon} size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onViewDetails(order)}
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
                            onClick={() => onActionClick(order, action)}
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
          );
        })}
      </TableBody>
    </Table>
  );
};

export { PurchaseOrdersTable, ORDER_ACTIONS, ACTION_CONFIG, STATUS_COLORS };
export default PurchaseOrdersTable;
