import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ResellerModal from "./modals/ResellerModal";

interface Reseller {
  id: number;
  domain: string;
  orgDisplayName: string;
  alternate_email: string;
  primaryContactInfo: {
    email: string;
    firstName: string;
    lastName: string;
  };
  created_at: string;
  updated_at: string;
}

interface ResellersViewListProps {
  loading: boolean;
  fetchResellers: () => void;
  resellers: Reseller[];
}

const API_BASE_URL = "http://16.171.117.2:3000";

export default function ResellersViewList({
  loading,
  fetchResellers,
  resellers,
}: ResellersViewListProps) {
  const [localResellers, setLocalResellers] = useState<Reseller[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
  if (Array.isArray(resellers)) {
    setLocalResellers(resellers);
  } else {
    setLocalResellers([]); // fallback to empty array
  }
}, [resellers]);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return localResellers.slice(start, start + itemsPerPage);
  }, [localResellers, currentPage]);

  const totalPages = Math.ceil(localResellers.length / itemsPerPage);

  const allSelected = useMemo(
    () => paginated.length > 0 && paginated.every((r) => selected.has(r.id)),
    [paginated, selected]
  );

  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) {
      paginated.forEach((r) => next.delete(r.id));
    } else {
      paginated.forEach((r) => next.add(r.id));
    }
    setSelected(next);
  };

  const toggleOne = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleAdd = () => {
    setEditingReseller(null);
    setOpen(true);
  };

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/resellers/${id}`);
      toast.success("Reseller deleted successfully");
      fetchResellers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete reseller");
    }
  };

  return (
    <div className="space-y-4 max-w-[95vw]">
      {/* Header */}
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="flex justify-between p-4">
          <h2 className="font-semibold text-lg">Resellers</h2>
          <Button onClick={handleAdd}>+ Add Reseller</Button>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Org Display Name</TableHead>
                  <TableHead>Alternate Email</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No resellers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                      </TableCell>
                      <TableCell className="font-medium">{r.domain}</TableCell>
                      <TableCell>{r.orgDisplayName}</TableCell>
                      <TableCell>{r.alternate_email}</TableCell>
                      <TableCell>
                        {r.primaryContactInfo.firstName} {r.primaryContactInfo.lastName} <br />
                        <span className="text-xs text-muted-foreground">{r.primaryContactInfo.email}</span>
                      </TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(r.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(r)}>
                          <Edit className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardContent className="flex justify-center gap-2 py-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </Button>
        </CardContent>
      )}

      {/* Modal Form */}
      <ResellerModal
        open={open}
        setOpen={setOpen}
        fetchResellers={fetchResellers}
        editingReseller={editingReseller}
        setEditingReseller={setEditingReseller}
      />
    </div>
  );
}
