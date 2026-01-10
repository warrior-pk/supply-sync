import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File02Icon,
  Upload01Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { formatDate } from "@/lib/date-time";
import { DOCUMENT_TYPE_LABELS } from "@/constants/entities";

const DocumentsTable = ({ documents, onUploadClick, onViewDocument, onDeleteDocument }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={File02Icon} size={20} />
            Compliance Documents
          </CardTitle>
          <CardDescription>
            Upload and manage your compliance and certification documents.
          </CardDescription>
        </div>
        <Button onClick={onUploadClick} className="gap-2">
          <HugeiconsIcon icon={Upload01Icon} size={18} />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <HugeiconsIcon icon={File02Icon} size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No documents uploaded</p>
            <p className="text-sm">Upload your compliance documents to get started</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.documentName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {DOCUMENT_TYPE_LABELS[doc.documentType] || doc.documentType}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                  <TableCell>
                    {doc.verified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600">
                        <HugeiconsIcon icon={Clock01Icon} size={16} />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDocument(doc)}
                        title="View Document"
                      >
                        <HugeiconsIcon icon={ViewIcon} size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteDocument(doc)}
                        title="Delete Document"
                        className="text-destructive hover:text-destructive"
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsTable;
