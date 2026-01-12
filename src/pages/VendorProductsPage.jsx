import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "@/store/auth.store";
import vendorProductService from "@/services/vendor-product.service";
import productService from "@/services/product.service";
import { getCurrentUTC } from "@/lib/date-time";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon, Edit02Icon, Package01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

const VendorProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vendorProducts, setVendorProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    unitPrice: "",
    leadTimeDays: "",
  });

  useEffect(() => {
    if (user?.vendorId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user?.vendorId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vpRes, productsRes] = await Promise.all([
        vendorProductService.getByVendorId(user.vendorId),
        productService.getAll(),
      ]);

      if (vpRes.success) {
        setVendorProducts(vpRes.data || []);
      }

      if (productsRes.success) {
        setAllProducts(productsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const getProductById = (productId) => {
    return allProducts.find((p) => p.id === productId);
  };

  const getAvailableProducts = () => {
    const existingProductIds = vendorProducts.map((vp) => vp.productId);
    return allProducts.filter((p) => p.isActive && !existingProductIds.includes(p.id));
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      unitPrice: "",
      leadTimeDays: "",
    });
  };

  const handleAddProduct = async () => {
    if (!formData.productId || !formData.unitPrice || !formData.leadTimeDays) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const response = await vendorProductService.create({
        vendorId: user.vendorId,
        productId: formData.productId,
        unitPrice: parseFloat(formData.unitPrice),
        leadTimeDays: parseInt(formData.leadTimeDays),
        createdAt: getCurrentUTC(),
      });

      if (response.success) {
        toast.success("Product added successfully");
        setAddDialogOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(response.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("An error occurred while adding product");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (vendorProduct) => {
    setSelectedProduct(vendorProduct);
    setFormData({
      productId: vendorProduct.productId,
      unitPrice: vendorProduct.unitPrice.toString(),
      leadTimeDays: vendorProduct.leadTimeDays.toString(),
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!formData.unitPrice || !formData.leadTimeDays) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const response = await vendorProductService.update(selectedProduct.id, {
        ...selectedProduct,
        unitPrice: parseFloat(formData.unitPrice),
        leadTimeDays: parseInt(formData.leadTimeDays),
      });

      if (response.success) {
        toast.success("Product updated successfully");
        setEditDialogOpen(false);
        resetForm();
        setSelectedProduct(null);
        fetchData();
      } else {
        toast.error(response.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (vendorProduct) => {
    setSelectedProduct(vendorProduct);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await vendorProductService.delete(selectedProduct.id);

      if (response.success) {
        toast.success("Product removed successfully");
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
        fetchData();
      } else {
        toast.error(response.message || "Failed to remove product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while removing product");
    }
  };

  // Handle case where vendor account is not properly linked
  if (!user?.vendorId) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/vendor")} className="cursor-pointer">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage products that you provide.
          </p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Account Setup Incomplete
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            Your vendor profile is being set up. Please contact the administrator if this issue persists.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            You may need to log out and log back in after your account is fully configured.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate("/vendor")} className="cursor-pointer">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage products that you provide and set your pricing.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <HugeiconsIcon icon={Add01Icon} size={18} />
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Package01Icon} size={20} />
            Products You Provide
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendorProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <HugeiconsIcon icon={Package01Icon} size={48} className="mb-4 opacity-50" />
              <p className="text-lg">No products added yet</p>
              <p className="text-sm">Add products that you can supply to get started</p>
              <Button onClick={() => setAddDialogOpen(true)} className="mt-4 gap-2">
                <HugeiconsIcon icon={Add01Icon} size={18} />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Unit Price (₹)</TableHead>
                  <TableHead>Lead Time (Days)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorProducts.map((vp) => {
                  const product = getProductById(vp.productId);
                  return (
                    <TableRow key={vp.id}>
                      <TableCell className="font-medium">
                        {product?.name || "Unknown Product"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product?.unit || "-"}</Badge>
                      </TableCell>
                      <TableCell>₹{vp.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>{vp.leadTimeDays} days</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(vp)}
                          >
                            <HugeiconsIcon icon={Edit02Icon} size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(vp)}
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Add a product that you can supply. Set your pricing and lead time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product">
                    {(value) => {
                      const product = allProducts.find(p => p.id === value);
                      return product ? `${product.name} (${product.unit})` : value;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableProducts().map((product) => (
                    <SelectItem key={product.id} value={product.id} label={product.name}>
                      {product.name} ({product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getAvailableProducts().length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No more products available to add.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 55.00"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadTime">Lead Time (Days) *</Label>
              <Input
                id="leadTime"
                type="number"
                min="1"
                placeholder="e.g., 5"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Number of days required to deliver this product
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct} disabled={saving}>
              {saving ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update pricing and lead time for {getProductById(selectedProduct?.productId)?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editUnitPrice">Unit Price (₹) *</Label>
              <Input
                id="editUnitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLeadTime">Lead Time (Days) *</Label>
              <Input
                id="editLeadTime"
                type="number"
                min="1"
                value={formData.leadTimeDays}
                onChange={(e) => setFormData({ ...formData, leadTimeDays: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); setSelectedProduct(null); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{getProductById(selectedProduct?.productId)?.name}" from your product list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProduct(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorProductsPage;
