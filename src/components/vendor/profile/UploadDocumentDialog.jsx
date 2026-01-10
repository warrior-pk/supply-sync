import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon, File02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { DOCUMENT_TYPE_LABELS } from "@/constants/entities";
import { toast } from "sonner";

const UploadDocumentDialog = ({ open, onOpenChange, onUpload, uploading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.replace(".pdf", ""));
      }
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedFile(null);
    setDocumentName("");
    setDocumentType("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentName || !documentType) {
      toast.error("Please fill all required fields");
      return;
    }

    onUpload({
      file: selectedFile,
      documentName,
      documentType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a compliance or certification document. Only PDF files up to 5MB are allowed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="docName">Document Name *</Label>
            <Input
              id="docName"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g., ISO 9001 Certificate 2026"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="docType">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <HugeiconsIcon icon={File02Icon} size={24} className="text-primary" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <HugeiconsIcon icon={Upload01Icon} size={32} className="mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PDF only, max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ position: "relative" }}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog;
