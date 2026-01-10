import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "@/store/auth.store";
import vendorService from "@/services/vendor.service";
import vendorDocumentService from "@/services/vendor-document.service";
import fileUploadService from "@/services/file-upload.service";
import { getCurrentUTC } from "@/lib/date-time";
import { VENDOR_STATUS } from "@/constants/entities";

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
import { toast } from "sonner";

import ProfileForm from "@/components/vendor/profile/ProfileForm";
import DocumentsTable from "@/components/vendor/profile/DocumentsTable";
import UploadDocumentDialog from "@/components/vendor/profile/UploadDocumentDialog";
import DeleteDocumentDialog from "@/components/vendor/profile/DeleteDocumentDialog";

const STATUS_COLORS = {
  [VENDOR_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [VENDOR_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [VENDOR_STATUS.SUSPENDED]: "bg-red-100 text-red-800",
  [VENDOR_STATUS.INACTIVE]: "bg-gray-100 text-gray-800",
};

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.vendorId) {
      fetchVendorData();
    }
  }, [user?.vendorId]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      const [vendorRes, docsRes] = await Promise.all([
        vendorService.getById(user.vendorId),
        vendorDocumentService.getByVendorId(user.vendorId),
      ]);

      if (vendorRes.success && vendorRes.data) {
        setVendor(vendorRes.data);
      }

      if (docsRes.success) {
        setDocuments(docsRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // When updating profile, set status to PENDING for re-approval
      const updateData = {
        ...vendor,
        ...data,
        status: VENDOR_STATUS.PENDING,
      };

      const response = await vendorService.update(vendor.id, updateData);
      
      if (response.success) {
        setVendor(response.data);
        toast.success("Profile updated successfully. Your status is now pending approval.");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDocument = async ({ file, documentName, documentType }) => {
    try {
      setUploading(true);

      // Upload file (mock)
      const uploadResult = await fileUploadService.upload(file);
      
      if (!uploadResult.success) {
        toast.error("Failed to upload file");
        return;
      }

      // Create document record
      const documentData = {
        vendorId: vendor.id,
        documentName,
        documentType,
        url: uploadResult.url,
        fileName: uploadResult.fileName,
        fileType: uploadResult.fileType,
        verified: false,
        uploadedAt: getCurrentUTC(),
        verifiedAt: null,
      };

      const response = await vendorDocumentService.create(documentData);
      
      if (response.success) {
        setDocuments([...documents, response.data]);
        
        // Update vendor status to pending when uploading new document
        await vendorService.update(vendor.id, {
          ...vendor,
          status: VENDOR_STATUS.PENDING,
        });
        setVendor({ ...vendor, status: VENDOR_STATUS.PENDING });
        
        toast.success("Document uploaded successfully. Status updated to pending.");
        setUploadDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to save document");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("An error occurred while uploading document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      const response = await vendorDocumentService.delete(documentToDelete.id);
      
      if (response.success) {
        setDocuments(documents.filter((d) => d.id !== documentToDelete.id));
        toast.success("Document deleted successfully");
      } else {
        toast.error(response.message || "Failed to delete document");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("An error occurred while deleting document");
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleViewDocument = (doc) => {
    window.open(doc.url, "_blank");
  };

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
    return <Badge className={colorClass}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
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
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your vendor profile and compliance documents.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          {getStatusBadge(vendor?.status)}
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm vendor={vendor} onSubmit={onSubmit} saving={saving} />

      {/* Documents Section */}
      <DocumentsTable 
        documents={documents}
        onUploadClick={() => setUploadDialogOpen(true)}
        onViewDocument={handleViewDocument}
        onDeleteDocument={handleDeleteClick}
      />

      {/* Upload Document Dialog */}
      <UploadDocumentDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUploadDocument}
        uploading={uploading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        document={documentToDelete}
        onConfirm={handleDeleteDocument}
      />
    </div>
  );
};

export default VendorProfilePage;
