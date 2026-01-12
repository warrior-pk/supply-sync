import React from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Package01Icon,
  UserIcon,
  File02Icon,
  ShoppingBasket03Icon,
} from "@hugeicons/core-free-icons";

const QuickActionsCard = () => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate("/vendor/manage/orders")} className="gap-2">
          <HugeiconsIcon icon={Package01Icon} size={16} />
          View Orders
        </Button>
        <Button variant="outline" onClick={() => navigate("/vendor/manage/products")} className="gap-2">
          <HugeiconsIcon icon={ShoppingBasket03Icon} size={16} />
          Manage Products
        </Button>
        <Button variant="outline" onClick={() => navigate("/vendor/manage/profile")} className="gap-2">
          <HugeiconsIcon icon={UserIcon} size={16} />
          Update Profile
        </Button>
        <Button variant="outline" onClick={() => navigate("/vendor/manage/profile")} className="gap-2">
          <HugeiconsIcon icon={File02Icon} size={16} />
          Upload Documents
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
