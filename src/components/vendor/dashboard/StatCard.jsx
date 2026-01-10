import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";

const StatCard = ({ title, value, icon, subtext, loading }) => (
  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <>
              <p className="text-2xl font-bold">{value}</p>
              {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <HugeiconsIcon icon={icon} className="text-primary" size={20} />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default StatCard;
