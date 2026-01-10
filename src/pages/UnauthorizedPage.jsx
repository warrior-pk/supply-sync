import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, ArrowLeft01Icon, SecurityLockIcon } from "@hugeicons/core-free-icons";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        {/* 403 Illustration */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-bold leading-none text-muted-foreground/20">
            403
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-destructive/10 p-6">
              <HugeiconsIcon 
                icon={SecurityLockIcon} 
                size={48} 
                className="text-destructive" 
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight">
          Access Denied
        </h1>
        <p className="mb-8 text-muted-foreground">
          Sorry, you don't have permission to access this page. Please contact your 
          administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <HugeiconsIcon icon={Home01Icon} size={18} />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
