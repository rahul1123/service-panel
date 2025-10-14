import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

interface UserFileUploadFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchFileUploads: () => void;
  editingFileUpload: any | null;
  setEditingFileUpload: (fileUpload: any | null) => void;
}

const API_BASE_URL = "http://16.171.117.2:3000";

export default function UserFileUploadFormModal({
  open,
  setOpen,
  fetchFileUploads,
  editingFileUpload,
  setEditingFileUpload,
}: UserFileUploadFormModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<{ file?: string }>({});

  useEffect(() => {
    if (editingFileUpload) {
      setRemarks(editingFileUpload.remarks || "");
    } else {
      setRemarks("");
      setFile(null);
    }
  }, [editingFileUpload]);

  const validate = (): boolean => {
    const newErrors: { file?: string } = {};
    if (!file) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("file", file as File);
    formData.append("remarks", remarks);
    formData.append("batchId", crypto.randomUUID());

    try {
      if (editingFileUpload) {
        await axios.put(`${API_BASE_URL}/user-file-uploads/${editingFileUpload.id}`, {
          remarks,
        });
        toast.success("File upload updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/user-file-uploads`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("File uploaded successfully");
      }

      fetchFileUploads();
      setOpen(false);
      setEditingFileUpload(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save file upload");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl w-full rounded-xl p-6">
        <DialogHeader>
          <DialogTitle>{editingFileUpload ? "Edit Remarks" : "Upload File"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingFileUpload && (
            <div className="space-y-2">
              <Label htmlFor="file">Choose File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remarks"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingFileUpload ? "Update Remarks" : "Upload File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
