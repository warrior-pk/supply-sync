import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

const PerformanceMetricsCard = ({ onTimeDeliveryRate, qualityScore }) => {
  const hasData = onTimeDeliveryRate > 0 || qualityScore > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={StarIcon} size={20} />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Your latest performance evaluation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* On-Time Delivery Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">On-Time Delivery Rate</span>
            <span className="font-medium">{onTimeDeliveryRate}%</span>
          </div>
          <Progress value={onTimeDeliveryRate} className="h-2" />
        </div>

        {/* Quality Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quality Score</span>
            <span className="font-medium">{qualityScore}/5.0</span>
          </div>
          <Progress value={(qualityScore / 5) * 100} className="h-2" />
        </div>

        {!hasData && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No performance data available yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
