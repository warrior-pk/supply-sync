import LoginCard from "@/components/auth/LoginCard";
import BrandName from "@/components/common/BrandName";
import ThemeSwitcher from "@/components/common/ThemeSwitcher";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Package01Icon, 
  TruckIcon, 
  AnalyticsUpIcon, 
  ShieldBlockchainIcon 
} from "@hugeicons/core-free-icons";
import React from "react";

const features = [
  {
    icon: Package01Icon,
    title: "Inventory Management",
    description: "Track stock levels in real-time across all your plants",
  },
  {
    icon: TruckIcon,
    title: "Vendor Coordination",
    description: "Streamline purchase orders and vendor relationships",
  },
  {
    icon: AnalyticsUpIcon,
    title: "Performance Insights",
    description: "Monitor delivery rates and quality metrics",
  },
  {
    icon: ShieldBlockchainIcon,
    title: "Document Verification",
    description: "Manage vendor compliance and certifications",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-svh w-full bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <BrandName size="default" showIcon />
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Hero Section - Left */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                Enterprise Supply Chain Platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                Streamline Your
                <span className="text-primary"> Supply Chain</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                A comprehensive platform for managing vendors, inventory, and purchase orders. 
                Built for efficiency and scalability.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div 
                  key={feature.title}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <HugeiconsIcon 
                      icon={feature.icon} 
                      size={20} 
                      className="text-primary" 
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Login Card - Right */}
          <div className="lg:pl-8">
            <div className="mx-auto max-w-sm lg:max-w-md">
              <LoginCard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-muted-foreground">
          © 2026 SupplySync. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
