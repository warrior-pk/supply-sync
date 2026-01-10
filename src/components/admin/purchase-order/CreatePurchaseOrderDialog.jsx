import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPurchaseOrderSchema } from "@/lib/schemas/createPurchaseOrder.schema";
import purchaseOrderService from "@/services/purchase-order.service";
import vendorProductService from "@/services/vendor-product.service";
import { PURCHASE_ORDER_STATUS, UNIT_OF_MEASUREMENT } from "@/constants/entities";

const CreatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  onOrderCreated,
  vendors = [],
  plants = [],
  products = [],
  restockData = null,
}) => {
  const [vendorProducts, setVendorProducts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loadingVendorProducts, setLoadingVendorProducts] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      vendorId: "",
      plantId: "",
      expectedDeliveryDate: "",
      orderItems: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "orderItems",
  });

  const watchVendorId = watch("vendorId");

  // Pre-populate form if restockData is provided
  useEffect(() => {
    if (open && restockData) {
      setValue("plantId", restockData.plantId || "");
      
      // Set a default expected delivery date (7 days from now)
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setValue("expectedDeliveryDate", defaultDate.toISOString().split('T')[0]);
    }
  }, [open, restockData, setValue]);

  // Fetch vendor products when vendor is selected
  useEffect(() => {
    if (watchVendorId) {
      fetchVendorProducts(watchVendorId);
    } else {
      setVendorProducts([]);
      setValue("orderItems", []);
    }
  }, [watchVendorId, setValue]);

  // Add restock product when vendor products are loaded
  useEffect(() => {
    if (restockData && vendorProducts.length > 0) {
      const matchingVP = vendorProducts.find(vp => vp.productId === restockData.productId);
      if (matchingVP) {
        const product = products.find(p => p.id === restockData.productId);
        setValue("orderItems", [{
          productId: restockData.productId,
          quantity: restockData.suggestedQuantity || 100,
          unit: product?.unit || UNIT_OF_MEASUREMENT.KG,
        }]);
      }
    }
  }, [vendorProducts, restockData, products, setValue]);

  const fetchVendorProducts = async (vendorId) => {
    try {
      setLoadingVendorProducts(true);
      const response = await vendorProductService.getByVendorId(vendorId);
      if (response.success) {
        setVendorProducts(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      toast.error("Failed to load vendor products");
    } finally {
      setLoadingVendorProducts(false);
    }
  };

  const resetForm = () => {
    reset({
      vendorId: "",
      plantId: "",
      expectedDeliveryDate: "",
      orderItems: [],
    });
    setVendorProducts([]);
  };

  const handleClose = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const addOrderItem = () => {
    append({
      productId: "",
      quantity: 1,
      unit: UNIT_OF_MEASUREMENT.KG,
    });
  };

  const handleProductChange = (index, value) => {
    setValue(`orderItems.${index}.productId`, value);
    // Set default unit from product when product is selected
    const product = products.find(p => p.id === value);
    if (product) {
      setValue(`orderItems.${index}.unit`, product.unit || UNIT_OF_MEASUREMENT.KG);
    }
  };

  const getAvailableProducts = () => {
    const vendorProductIds = vendorProducts.map(vp => vp.productId);
    return products.filter(p => vendorProductIds.includes(p.id));
  };

  const getProductAcceptedUnits = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.acceptedUnits || Object.values(UNIT_OF_MEASUREMENT);
  };

  const onSubmit = async (data) => {
    try {
      setIsCreating(true);

      const orderData = {
        vendorId: data.vendorId,
        plantId: data.plantId,
        expectedDeliveryDate: new Date(data.expectedDeliveryDate).toISOString(),
        status: PURCHASE_ORDER_STATUS.PENDING,
      };

      const response = await purchaseOrderService.create(orderData, data.orderItems);

      if (response.success) {
        resetForm();
        onOrderCreated?.();
      } else {
        toast.error(response.message || "Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast.error("An error occurred while creating purchase order");
    } finally {
      setIsCreating(false);
    }
  };

  const approvedVendors = vendors.filter(v => v.status === "APPROVED");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Package01Icon} size={20} />
            Create Purchase Order
            {restockData && (
              <Badge variant="secondary" className="ml-2">Restock Request</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Create a new purchase order by selecting a vendor, plant, and adding products.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Order Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Controller
                  name="vendorId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full ${errors.vendorId ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedVendors.map((vendor) => (
                          <SelectItem key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vendorId && (
                  <p className="text-sm text-destructive">{errors.vendorId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant">Plant *</Label>
                <Controller
                  name="plantId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`w-full ${errors.plantId ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Select plant" />
                      </SelectTrigger>
                      <SelectContent>
                        {plants.map((plant) => (
                          <SelectItem key={plant.id} value={plant.id}>
                            {plant.name} - {plant.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.plantId && (
                  <p className="text-sm text-destructive">{errors.plantId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">Expected Delivery *</Label>
                <Controller
                  name="expectedDeliveryDate"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="date"
                      id="expectedDeliveryDate"
                      className={`w-full ${errors.expectedDeliveryDate ? "border-destructive" : ""}`}
                      value={field.value}
                      onChange={field.onChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  )}
                />
                {errors.expectedDeliveryDate && (
                  <p className="text-sm text-destructive">{errors.expectedDeliveryDate.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Order Items</h3>
                {errors.orderItems?.root && (
                  <p className="text-sm text-destructive">{errors.orderItems.root.message}</p>
                )}
                {errors.orderItems?.message && (
                  <p className="text-sm text-destructive">{errors.orderItems.message}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOrderItem}
                disabled={!watchVendorId || loadingVendorProducts}
                className="gap-2"
              >
                <HugeiconsIcon icon={Add01Icon} size={16} />
                Add Item
              </Button>
            </div>

            {!watchVendorId ? (
              <div className="text-center py-8 text-muted-foreground">
                Please select a vendor first to add products
              </div>
            ) : loadingVendorProducts ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading vendor products...
              </div>
            ) : vendorProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                This vendor has no products available
              </div>
            ) : fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items added. Click "Add Item" to add products.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => remove(index)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </Button>
                    <CardContent className="pt-4 pr-12 space-y-4">
                      {/* Product Select */}
                      <div className="space-y-2">
                        <Label>Product *</Label>
                        <Controller
                          name={`orderItems.${index}.productId`}
                          control={control}
                          render={({ field: productField }) => (
                            <Select
                              value={productField.value}
                              onValueChange={(value) => handleProductChange(index, value)}
                            >
                              <SelectTrigger className={`w-full ${errors.orderItems?.[index]?.productId ? "border-destructive" : ""}`}>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAvailableProducts().map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.orderItems?.[index]?.productId && (
                          <p className="text-sm text-destructive">{errors.orderItems[index].productId.message}</p>
                        )}
                      </div>

                      {/* Quantity + Unit */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <Controller
                            name={`orderItems.${index}.quantity`}
                            control={control}
                            render={({ field: quantityField }) => (
                              <Input
                                type="number"
                                min="1"
                                className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.orderItems?.[index]?.quantity ? "border-destructive" : ""}`}
                                value={quantityField.value}
                                onChange={(e) => quantityField.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                          {errors.orderItems?.[index]?.quantity && (
                            <p className="text-sm text-destructive">{errors.orderItems[index].quantity.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Unit *</Label>
                          <Controller
                            name={`orderItems.${index}.unit`}
                            control={control}
                            render={({ field: unitField }) => (
                              <Select
                                value={unitField.value}
                                onValueChange={unitField.onChange}
                              >
                                <SelectTrigger className={`w-full ${errors.orderItems?.[index]?.unit ? "border-destructive" : ""}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getProductAcceptedUnits(field.productId).map((unit) => (
                                    <SelectItem key={unit} value={unit}>
                                      {unit}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.orderItems?.[index]?.unit && (
                            <p className="text-sm text-destructive">{errors.orderItems[index].unit.message}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Purchase Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePurchaseOrderDialog;
