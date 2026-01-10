import React from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { USER_ROLES } from "@/constants/entities";

const BrandName = ({ 
  size = "default", 
  showIcon = false,
  className,
  clickable = true,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const sizeClasses = {
    sm: "text-lg font-semibold",
    default: "text-xl font-semibold",
    lg: "text-2xl md:text-3xl font-bold",
    xl: "text-3xl md:text-4xl font-bold",
  };

  const handleClick = () => {
    if (!clickable) return;
    
    if (user?.role === USER_ROLES.ADMIN) {
      navigate("/admin");
    } else if (user?.role === USER_ROLES.VENDOR) {
      navigate("/vendor");
    } else {
      navigate("/");
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2", 
        clickable && "cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      {showIcon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">S</span>
        </div>
      )}
      <span className={cn("tracking-tight", sizeClasses[size])}>
        <span className="text-foreground">Supply</span>
        <span className="text-primary">Sync</span>
      </span>
    </div>
  );
};

export default BrandName;
