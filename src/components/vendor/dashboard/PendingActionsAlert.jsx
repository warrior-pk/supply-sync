import React from "react";
import { useNavigate } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

const PendingActionsAlert = ({ count }) => {
  const navigate = useNavigate();

  if (count <= 0) return null;

  return (
    <Card className="border-yellow-500 bg-yellow-50">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <HugeiconsIcon icon={Alert02Icon} size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-yellow-800">
              {count} Pending Action Request{count > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-yellow-700">
              You have action requests that need your attention
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/vendor/manage/orders")}
          className="border-yellow-500 text-yellow-700 hover:bg-yellow-100"
        >
          View Orders
        </Button>
      </CardContent>
    </Card>
  );
};

export default PendingActionsAlert;
