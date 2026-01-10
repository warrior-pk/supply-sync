import React from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, ArrowLeft01Icon, Search01Icon } from "@hugeicons/core-free-icons";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-bold leading-none text-muted-foreground/20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-muted p-6">
              <HugeiconsIcon 
                icon={Search01Icon} 
                size={48} 
                className="text-muted-foreground" 
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight">
          Page Not Found
        </h1>
        <p className="mb-8 text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page might have been 
          removed, renamed, or doesn't exist.
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

export default NotFoundPage;
