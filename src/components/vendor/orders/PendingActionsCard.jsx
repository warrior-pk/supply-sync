import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Alert02Icon,
  Edit02Icon,
  Cancel01Icon,
  MoneyReceive02Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";
import { ORDER_ACTION_TYPE, ORDER_ACTION_STATUS } from "@/constants/entities";

const ACTION_TYPE_CONFIG = {
  [ORDER_ACTION_TYPE.UPDATE]: {
    label: "Update Request",
    icon: Edit02Icon,
    color: "text-blue-600",
  },
  [ORDER_ACTION_TYPE.CANCEL]: {
    label: "Cancel Request",
    icon: Cancel01Icon,
    color: "text-red-600",
  },
  [ORDER_ACTION_TYPE.RETURN]: {
    label: "Return Request",
    icon: MoneyReceive02Icon,
    color: "text-orange-600",
  },
};

const ACTION_STATUS_COLORS = {
  [ORDER_ACTION_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_ACTION_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [ORDER_ACTION_STATUS.REJECTED]: "bg-red-100 text-red-800",
};

const PendingActionsCard = ({
  actions,
  actionResponses,
  onResponseChange,
  onApprove,
  onReject,
  processingAction,
}) => {
  if (actions.length === 0) return null;

  const getStatusBadge = (status) => {
    const colorClass = ACTION_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={20} />
          Pending Action Requests
        </CardTitle>
        <CardDescription>
          Review and respond to action requests from the admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action) => {
          const config = ACTION_TYPE_CONFIG[action.actionType];
          return (
            <div 
              key={action.id} 
              className="border rounded-lg p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={config?.icon || Alert02Icon} size={20} className={config?.color} />
                  <div>
                    <h4 className="font-medium">{config?.label || action.actionType}</h4>
                    <p className="text-sm text-muted-foreground">
                      Requested on {formatDate(action.createdAt)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(action.status)}
              </div>

              {/* Admin Message */}
              <div className="bg-muted p-3 rounded-md">
                <Label className="text-xs text-muted-foreground">Admin Message:</Label>
                <p className="text-sm mt-1">{action.message}</p>
              </div>

              {/* Proposed Changes for UPDATE actions */}
              {action.actionType === ORDER_ACTION_TYPE.UPDATE && action.proposedChanges && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-md space-y-3">
                  <Label className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Proposed Changes:
                  </Label>
                  
                  {action.proposedChanges.expectedDeliveryDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">New Delivery Date: </span>
                      <span className="font-medium">
                        {formatDate(action.proposedChanges.expectedDeliveryDate)}
                      </span>
                    </div>
                  )}
                  
                  {action.proposedChanges.itemChanges?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Quantity Changes:</span>
                      <div className="space-y-1">
                        {action.proposedChanges.itemChanges
                          .filter(item => item.newQuantity !== item.originalQuantity)
                          .map((item, index) => (
                            <div key={index} className="text-sm flex items-center gap-2">
                              <span className="font-medium">{item.productName}:</span>
                              <span className="text-red-500 line-through">{item.originalQuantity}</span>
                              <span>→</span>
                              <span className="text-green-600 font-medium">{item.newQuantity}</span>
                              <span className="text-muted-foreground">{item.unit}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Response */}
              <div className="space-y-2">
                <Label htmlFor={`response-${action.id}`}>Your Response</Label>
                <Textarea
                  id={`response-${action.id}`}
                  value={actionResponses[action.id] || ""}
                  onChange={(e) => onResponseChange(action.id, e.target.value)}
                  placeholder="Enter your response (required for rejection)"
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => onReject(action)}
                  disabled={processingAction === action.id}
                  className="gap-2"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  Reject
                </Button>
                <Button
                  onClick={() => onApprove(action)}
                  disabled={processingAction === action.id}
                  className="gap-2"
                >
                  <HugeiconsIcon icon={Tick02Icon} size={16} />
                  Approve
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PendingActionsCard;
