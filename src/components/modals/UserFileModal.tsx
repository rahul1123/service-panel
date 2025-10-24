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
import { API_BASE_URL } from "../../config/api";

interface UserFileUploadFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchFileUploads: () => void;
  editingFileUpload: any | null;
  setEditingFileUpload: (fileUpload: any | null) => void;
}


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

  if (!file) {
    newErrors.file = "File is required";
  } else {
    const allowedMimeTypes = ["text/csv", "application/vnd.ms-excel"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (
      !allowedMimeTypes.includes(file.type) &&
      fileExtension !== "csv"
    ) {
      newErrors.file = "Only CSV files are allowed";
    }
  }

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
        const url='https://gwsapi.amyntas.in/api/v1/panel/user/upload';
         const headers = {
      "x-api-key": "f7ab26185b14fc87db613850887be3b8",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VySWQiOjYsImVtYWlsIjoiYWRtaW5AcGFuZWwuY29tIiwiaWF0IjoxNzYxMjkyNTE2LCJleHAiOjE3NjEzMjEzMTZ9.-0OGopOZtblSi_9x2Y3GFSdIToftqumXerSYYlf4Au8",
      "Content-Type": "multipart/form-data",
    };
    const { data } = await axios.post(url, formData, { headers });

    console.log("Upload response:", data);
        // await axios.post(`${API_BASE_URL}/user-file-uploads/import`, formData, {
        //   headers: { "Content-Type": "multipart/form-data" },
        // });
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
          <DialogTitle>{editingFileUpload ? "Edit Remarks" : "Upload  User File"}</DialogTitle>
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
