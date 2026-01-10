import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateVendorSchema } from "@/lib/schemas/updateVendor.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";

const ProfileForm = ({ vendor, onSubmit, saving }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(updateVendorSchema),
    defaultValues: {
      name: vendor?.name || "",
      contactEmail: vendor?.contactEmail || "",
      contactPhone: vendor?.contactPhone || "",
      address: {
        street: vendor?.address?.street || "",
        city: vendor?.address?.city || "",
        state: vendor?.address?.state || "",
        zipCode: vendor?.address?.zipCode || "",
        country: vendor?.address?.country || "",
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={UserIcon} size={20} />
          Vendor Information
        </CardTitle>
        <CardDescription>
          Update your business details. Note: Any changes will require re-approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter business name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
                placeholder="Enter contact email"
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                {...register("contactPhone")}
                placeholder="Enter phone number"
              />
              {errors.contactPhone && (
                <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-medium mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Street */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  {...register("address.street")}
                  placeholder="Enter street address"
                />
                {errors.address?.street && (
                  <p className="text-sm text-destructive">{errors.address.street.message}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("address.city")}
                  placeholder="Enter city"
                />
                {errors.address?.city && (
                  <p className="text-sm text-destructive">{errors.address.city.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register("address.state")}
                  placeholder="Enter state"
                />
                {errors.address?.state && (
                  <p className="text-sm text-destructive">{errors.address.state.message}</p>
                )}
              </div>

              {/* Zip Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  {...register("address.zipCode")}
                  placeholder="Enter zip code"
                />
                {errors.address?.zipCode && (
                  <p className="text-sm text-destructive">{errors.address.zipCode.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("address.country")}
                  placeholder="Enter country"
                />
                {errors.address?.country && (
                  <p className="text-sm text-destructive">{errors.address.country.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving || !isDirty}>
              {saving ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
