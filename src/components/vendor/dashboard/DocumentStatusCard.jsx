import React from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { File02Icon } from "@hugeicons/core-free-icons";

const DocumentStatusCard = ({ totalDocuments, verifiedDocuments }) => {
  const navigate = useNavigate();
  const pendingDocuments = totalDocuments - verifiedDocuments;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={File02Icon} size={20} />
            Compliance Documents
          </CardTitle>
          <CardDescription>
            Your uploaded documents status
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/vendor/manage/profile")}>
          Manage
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between py-4">
          <div className="text-center flex-1">
            <p className="text-3xl font-bold">{totalDocuments}</p>
            <p className="text-sm text-muted-foreground">Total Documents</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center flex-1">
            <p className="text-3xl font-bold text-green-600">{verifiedDocuments}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div className="text-center flex-1">
            <p className="text-3xl font-bold text-yellow-600">{pendingDocuments}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>

        {totalDocuments === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No documents uploaded yet
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/vendor/manage/profile")}>
              Upload Documents
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentStatusCard;
