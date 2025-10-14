
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilterColumnsModal } from "@/components/modals/FilterCoulmnModal";
import AddCandidateModal from "@/components/modals/AddUserModal";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Building2,
  DollarSign,
  GraduationCap,
  Star,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import CandidateProfileModal from "@/components/modals/CandidateProfileModal";
import { BulkUpdateFieldsModal } from "@/components/modals/BulkUpdateUserFieldsModal";
import AssignToJobModal from "@/components/modals/AssigntoJobModal";

import { ALL_COLUMNS, TABS } from "@/lib/user-config";
import { UserActionsPopover } from "./userActionsPopover";

const API_BASE_URL = " http://13.62.22.94:3000";

interface CandidateForm {
  id: number;
  agency_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  headline: string | null;
  status: string;
  address: string;
  experience: string;
  photo_url: string | null;
  education: string;
  summary: string | null;
  resume_url: string;
  cover_letter: string | null;
  rating: string | null;
  hmapproval: string;
  recruiter_status: string;
  current_company: string | null;
  current_ctc: string | null;
  expected_ctc: string | null;
  skill: string[];
  created_at: string;
  updated_at: string;
  linkedinprofile: string;
  role: string;
  created_dt: string;
  name:string;
}

interface ParsedEducation {
  institution: string;
  degree: string;
  candidateId: number;
}

const formatCandidateAddress = (address: string): string => {
  if (!address || !address.trim()) return "NA";
  try {
    const parsed = JSON.parse(address);
    if (Array.isArray(parsed)) {
      const latestAddress = [...parsed]
        .reverse()
        .find((addr) =>
          addr && Object.values(addr).some((val) => val && val !== "")
        );
      if (!latestAddress) return "NA";
      const fields = [
        latestAddress.firstline,
        latestAddress.city,
        latestAddress.district,
        latestAddress.state,
        latestAddress.pincode,
        latestAddress.country,
      ];
      const cleaned = fields
        .map((val) => (val ?? "").trim())
        .filter((val) => val);
      return cleaned.length ? cleaned.join(", ") : "NA";
    }
    return "NA";
  } catch {
    return address.trim() || "NA";
  }
};

interface CandidateViewListProps {
  loading: boolean;
  candidates: CandidateForm[];
  fetchCandidates: () => void;
}

export default function PagesViewList({
  loading,
  candidates,
  fetchCandidates,
}: CandidateViewListProps) {
  const [localCandidates, setLocalCandidates] = useState<CandidateForm[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAgency, setSelectedAgency] = useState("");
  const [agencies, setAgencies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const itemsPerPage = 20;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key)
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateForm | null>(null);
  const [editCandidate, setEditCandidate] = useState<CandidateForm | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    setLocalCandidates(candidates);
  }, [candidates]);

  const fetchAgencies = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/agency/getAllAgencies`);
      setAgencies(data.result || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch agencies.");
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  const lowerTerm = searchQuery.toLowerCase().trim();
  const safe = (s?: string | null) => s?.toLowerCase() ?? "";

  // ✅ Filtering includes role + agency
  const filtered = useMemo(
    () =>
      localCandidates.filter((c) => {
        if (selectedRole && c.role !== selectedRole) return false;
        if (selectedAgency && String(c.agency_id) !== selectedAgency) return false;

        if (!lowerTerm) return true;
        const fullName = `${c.first_name ?? ""} ${c.last_name ?? ""}`;
        return (
          fullName.toLowerCase().includes(lowerTerm) ||
          (c.skill ?? []).join(" ").toLowerCase().includes(lowerTerm) ||
          safe(c.current_company).includes(lowerTerm) ||
          safe(c.email).includes(lowerTerm)
        );
      }),
    [localCandidates, lowerTerm, activeTab, selectedRole, selectedAgency]
  );

  const filteredIds = useMemo(() => filtered.map((c) => c.id), [filtered]);
  const allSelectedInFilter = useMemo(
    () => filteredIds.length > 0 && filteredIds.every((id) => selected.has(id)),
    [filteredIds, selected]
  );

  const toggleAll = () => {
    if (allSelectedInFilter) {
      const next = new Set(selected);
      filteredIds.forEach((id) => next.delete(id));
      setSelected(next);
    } else {
      setSelected((prev) => new Set([...prev, ...filteredIds]));
    }
  };

  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleColumn = (key: string, show: boolean) => {
    setVisibleColumns((prev) =>
      show ? [...prev, key] : prev.filter((c) => c !== key)
    );
  };

  const handleDelete = async () => {
    if (!selected.size) return;
    try {
      await axios.post(`${API_BASE_URL}/user/bulk-delete`, {
        data: { ids: [...selected] },
      });
      setLocalCandidates((prev) => prev.filter((c) => !selected.has(c.id)));
      setSelected(new Set());
      toast.success("Deleted!");
    } catch (err) {
      console.error("Failed to delete users", err);
      toast.error("Could not delete users");
    }
  };

  const handleEdit = () => {
    if (!selected.size) {
      toast.error("Select at least one candidate first");
      return;
    }
    setIsBulkModalOpen(true);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/candidate/${id}`, { status });
      setLocalCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error("Could not update status");
    }
  };

  const handleRecruiterStatusChange = async (
    id: number,
    recruiter_status: string
  ) => {
    try {
      await axios.put(`${API_BASE_URL}/candidate/${id}`, {
        recruiter_status,
      });
      setLocalCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, recruiter_status } : c))
      );
    } catch (err) {
      console.error("Failed to update recruiter status", err);
      toast.error("Could not update recruiter status");
    }
  };

  const handleEditUser = (user: CandidateForm) => {
    console.log("Edit user:", user);
    toast.info("Edit functionality will be implemented soon");
  };

  const handleDeleteUser = async (userId: number) => {
    console.log("Delete user:", userId);
    toast.info("Delete functionality will be implemented soon");
  };

  const handleHMApprovalChange = async (id: number, hmapproval: string) => {
    try {
      await axios.put(`${API_BASE_URL}/candidate/${id}`, { hmapproval });
      setLocalCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, hmapproval } : c))
      );
    } catch (err) {
      console.error("Failed to update HM approval", err);
      toast.error("Could not update HM approval");
    }
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="space-y-4 max-w-[95vw]">
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skills, company..."
                className="h-9 bg-white/80 pl-10"
              />
            </div>

            {/* Role Dropdown */}
            <div className="w-full sm:w-40">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  {/* <SelectItem value="Candidate">Candidate</SelectItem>
                  <SelectItem value="HiringManager">Hiring Manager</SelectItem> */}
                  <SelectItem value="Interviewer">Interviewer</SelectItem>
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agency Dropdown */}
            <div className="w-full sm:w-48">
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id.toString()}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {TABS.map(([label, key]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={activeTab === key ? "secondary" : "outline"}
                  onClick={() => {
                    setActiveTab(key);
                    setSearchQuery("");
                  }}
                >
                  {label}
                </Button>
              ))}

            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedRole("");
                setSelectedAgency("");
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-0 bg-white/60 shadow-sm backdrop-blur-sm max-w-[100%]">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white/90 backdrop-blur-sm">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelectedInFilter}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  {ALL_COLUMNS.map((col) =>
                    visibleColumns.includes(col.key) ? (
                      <TableHead
                        className="whitespace-nowrap text-black"
                        key={col.key}
                      >
                        {col.label}
                      </TableHead>
                    ) : null
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length + 1}
                      className="text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length + 1}
                      className="text-center"
                    >
                      No candidates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((candidate) => {
                    let parsedEdu: ParsedEducation | null = null;
                    try {
                      const eduData = JSON.parse(candidate.education);
                      if (Array.isArray(eduData) && eduData.length > 0)
                        parsedEdu = eduData[0];
                    } catch { }
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selected.has(candidate.id)}
                            onCheckedChange={() => toggleOne(candidate.id)}
                          />
                        </TableCell>
                        {visibleColumns.includes("name") && (
                          <TableCell className="min-w-[200px] py-2">
                            <UserActionsPopover
                              candidateId={candidate.id}
                              candidate={candidate}
                              fetchCandidates={fetchCandidates}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {candidate.first_name?.[0]}
                                    {candidate.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <button
                                  onClick={() => {
                                    setSelectedCandidate(candidate);
                                    setProfileModalOpen(true);
                                  }}
                                  className="text-sm font-medium hover:underline"
                                >
                                  {candidate.first_name} {candidate.last_name}
                                </button>
                              </div>
                            </UserActionsPopover>

                          </TableCell>
                        )}

                        {visibleColumns.includes("email") && (
                          <TableCell>{candidate.email}</TableCell>
                        )}
                        {visibleColumns.includes("phone") && (
                          <TableCell>{candidate.phone}</TableCell>
                        )}
                        {visibleColumns.includes("status") && (
                          <TableCell>
                            {Number(candidate.status) === 1
                              ? "Active"
                              : "Inactive"}
                          </TableCell>
                        )}
                        {visibleColumns.includes("role") && (
                          <TableCell>{candidate.role}</TableCell>
                        )}
                        
                        {visibleColumns.includes("created_at") && (
                          <TableCell>{candidate.created_dt}</TableCell>
                        )}
                        {visibleColumns.includes("actions") && (
                          <TableCell className="min-w-[120px] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleEditUser(candidate)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => handleDeleteUser(candidate.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes("actions") && (
                          <TableCell className="min-w-[120px] whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs"
                                onClick={() => handleEditUser(candidate)}
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => handleDeleteUser(candidate.id)}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes("current_company") && (
                          <TableCell>{candidate.current_company || "N/A"}</TableCell>
                        )}
                        {visibleColumns.includes("skill") && (
                          <TableCell>
                            <div className="flex gap-1">
                              {(candidate.skill || [])
                                .slice(0, 2)
                                .map((skill, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {skill}
                                  </Badge>
                                ))}
                              {(candidate.skill || []).length > 2 && (
                                <Badge variant="secondary">
                                  +{candidate.skill.length - 2}
                                </Badge>
                              )}
                            </div>

                          </TableCell>
                        )}
                        {visibleColumns.includes("education") && (
                          <TableCell>
                            {parsedEdu?.institution || "N/A"}{" "}
                            <span className="text-xs">
                              {parsedEdu?.degree || ""}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.includes("rating") && (
                          <TableCell>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {candidate.rating || "N/A"}
                          </TableCell>
                        )}
                        {visibleColumns.includes("address") && (
                          <TableCell>
                            {formatCandidateAddress(candidate.address)}
                          </TableCell>
                        )}
                        {/* Edit Button */}
                        <TableCell className="min-w-[120px] whitespace-nowrap">
                            <div className="flex items-center gap-2 ">
                       <Button
                       size="sm" 
                                variant="outline"
                                className="h-8 px-3 text-xs bg-blue-400 hover:bg-blue-500 hover:text-black-600 hover:border-blue-200"
  onClick={() => {
    setEditCandidate({
      ...candidate,
      name: `${candidate.first_name ?? ""} ${candidate.last_name ?? ""}`.trim(),
      agency: candidate.agency_id ?? "",
      password: "",
      confirm_password: "",
    });
    setIsAddModalOpen(true);
  }}
>
                          <Edit className="w-3 h-3 mr-1 " />
                                Edit
                        </Button>

                        {/* Delete Button */}
                        <Button
                          size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600 hover:text-black-600 hover:border-red-200"
                          onClick={async () => {
                            try {
                              await axios.delete(`${API_BASE_URL}/user/${candidate.id}`);
                              toast.success("Candidate deleted successfully");
                              fetchCandidates();
                            } catch (err) {
                              console.error(err);
                              toast.error("Failed to delete candidate");
                            }
                          }}
                        >
                        <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                        </Button>
                        </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <CardContent className="flex justify-center space-x-2 py-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((p) => (p < totalPages ? p + 1 : p))
            }
          >
            Next
          </Button>
        </CardContent>
      )}

      <AddCandidateModal
        open={isAddModalOpen}
        handleClose={() => setAddModalOpen(false)}
        candidate=""
        fetchCandidates={fetchCandidates}
      />
      {editCandidate && (
        <AddCandidateModal
          open={!!editCandidate}
          handleClose={() => setEditCandidate(null)}
          candidate={editCandidate}   // pass candidate to modal
          fetchCandidates={fetchCandidates}
        />
      )}
      <CandidateProfileModal
        open={isProfileModalOpen}
        onOpenChange={setProfileModalOpen}
        candidate={selectedCandidate}
        fetchCandidates={fetchCandidates}
      />
    </div>
  );
}
