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

interface ResellerFormValues {
  domain: string;
  orgDisplayName: string;
  alternateEmail: string;
  primaryEmail: string;
  primaryFirstName: string;
  primaryLastName: string;
}

interface ResellerFormModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  fetchResellers: () => void;
  editingReseller: any | null;
  setEditingReseller: (reseller: any | null) => void;
}

const API_BASE_URL = "http://localhost:3000";

const initialFormValues: ResellerFormValues = {
  domain: "",
  orgDisplayName: "",
  alternateEmail: "",
  primaryEmail: "",
  primaryFirstName: "",
  primaryLastName: "",
};

export default function ResellerFormModal({
  open,
  setOpen,
  fetchResellers,
  editingReseller,
  setEditingReseller,
}: ResellerFormModalProps) {
  const [formValues, setFormValues] = useState<ResellerFormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<ResellerFormValues>>({});

  useEffect(() => {
    if (editingReseller) {
      setFormValues({
        domain: editingReseller.domain || "",
        orgDisplayName: editingReseller.orgDisplayName || "",
        alternateEmail: editingReseller.alternateEmail || "",
        primaryEmail: editingReseller.primaryContactInfo?.email || "",
        primaryFirstName: editingReseller.primaryContactInfo?.firstName || "",
        primaryLastName: editingReseller.primaryContactInfo?.lastName || "",
      });
    } else {
      setFormValues(initialFormValues);
    }
  }, [editingReseller]);

  const validate = (): boolean => {
    const newErrors: Partial<ResellerFormValues> = {};

    if (!formValues.domain.trim()) newErrors.domain = "Domain is required";
    if (!formValues.orgDisplayName.trim()) newErrors.orgDisplayName = "Organization display name is required";
    if (!formValues.alternateEmail.trim()) newErrors.alternateEmail = "Alternate email is required";
    if (!formValues.primaryEmail.trim()) newErrors.primaryEmail = "Primary email is required";
    if (!formValues.primaryFirstName.trim()) newErrors.primaryFirstName = "Primary contact first name is required";
    if (!formValues.primaryLastName.trim()) newErrors.primaryLastName = "Primary contact last name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      domain: formValues.domain,
      orgDisplayName: formValues.orgDisplayName,
      alternateEmail: formValues.alternateEmail,
      primaryContactInfo: {
        email: formValues.primaryEmail,
        firstName: formValues.primaryFirstName,
        lastName: formValues.primaryLastName,
      },
    };

    try {
      if (editingReseller) {
        await axios.put(`${API_BASE_URL}/resellers/${editingReseller.id}`, payload);
        toast.success("Reseller updated successfully");
      } else {
        await axios.post(`${API_BASE_URL}/resellers`, payload);
        toast.success("Reseller created successfully");
      }

      fetchResellers();
      setOpen(false);
      setEditingReseller(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save reseller");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl w-full rounded-xl p-6 overflow-y-auto max-h-[90vh] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{editingReseller ? "Edit Reseller" : "Add Reseller"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              name="domain"
              value={formValues.domain}
              onChange={(e) => setFormValues({ ...formValues, domain: e.target.value })}
            />
            {errors.domain && <p className="text-red-500 text-sm">{errors.domain}</p>}
          </div>

          {/* Organization Display Name */}
          <div className="space-y-2">
            <Label htmlFor="orgDisplayName">Organization Display Name</Label>
            <Input
              id="orgDisplayName"
              name="orgDisplayName"
              value={formValues.orgDisplayName}
              onChange={(e) => setFormValues({ ...formValues, orgDisplayName: e.target.value })}
            />
            {errors.orgDisplayName && <p className="text-red-500 text-sm">{errors.orgDisplayName}</p>}
          </div>

          {/* Alternate Email */}
          <div className="space-y-2">
            <Label htmlFor="alternateEmail">Alternate Email</Label>
            <Input
              id="alternateEmail"
              name="alternateEmail"
              type="email"
              value={formValues.alternateEmail}
              onChange={(e) => setFormValues({ ...formValues, alternateEmail: e.target.value })}
            />
            {errors.alternateEmail && <p className="text-red-500 text-sm">{errors.alternateEmail}</p>}
          </div>

          {/* Primary Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="primaryEmail">Primary Contact Email</Label>
            <Input
              id="primaryEmail"
              name="primaryEmail"
              type="email"
              value={formValues.primaryEmail}
              onChange={(e) => setFormValues({ ...formValues, primaryEmail: e.target.value })}
            />
            {errors.primaryEmail && <p className="text-red-500 text-sm">{errors.primaryEmail}</p>}
          </div>

          {/* Primary Contact First Name */}
          <div className="space-y-2">
            <Label htmlFor="primaryFirstName">Primary Contact First Name</Label>
            <Input
              id="primaryFirstName"
              name="primaryFirstName"
              value={formValues.primaryFirstName}
              onChange={(e) => setFormValues({ ...formValues, primaryFirstName: e.target.value })}
            />
            {errors.primaryFirstName && <p className="text-red-500 text-sm">{errors.primaryFirstName}</p>}
          </div>

          {/* Primary Contact Last Name */}
          <div className="space-y-2">
            <Label htmlFor="primaryLastName">Primary Contact Last Name</Label>
            <Input
              id="primaryLastName"
              name="primaryLastName"
              value={formValues.primaryLastName}
              onChange={(e) => setFormValues({ ...formValues, primaryLastName: e.target.value })}
            />
            {errors.primaryLastName && <p className="text-red-500 text-sm">{errors.primaryLastName}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingReseller ? "Update Reseller" : "Create Reseller"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
