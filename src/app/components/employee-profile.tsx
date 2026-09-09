import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit,
  Download,
  CheckCircle2,
  UserX,
  Trash2,
  IdCard,
  Camera,
} from "lucide-react";
import { TrainingMatrix } from "../components/Training-Matrix/training-matrix";
import { LegalAppointments } from "./legal-appointments";
import { MedicalSurveillanceEnhanced } from "./medical-surveillance-enhanced";
import { PPERegister } from "../components/PPE-Submodule/ppe-register";
import { useRecycleBin } from "../contexts/recycle-bin-context";

interface EmployeeProfileProps {
  employee: any;
  onBack: () => void;
  onEmployeeUpdate?: (updated: any) => void;
}

type TabType =
  | "personal"
  | "appointments"
  | "training"
  | "medical"
  | "ppe"
  | "documents";
type EditTabType = "personal" | "contact" | "employment" | "emergency";

const tabs = [
  { id: "personal" as TabType, label: "Personal Details" },
  { id: "appointments" as TabType, label: "Legal Appointments" },
  { id: "training" as TabType, label: "Training Matrix" },
  { id: "medical" as TabType, label: "Medical Surveillance" },
  { id: "ppe" as TabType, label: "PPE Issued" },
  { id: "documents" as TabType, label: "Scanned Documents" },
];

const editTabs: { id: EditTabType; label: string }[] = [
  { id: "personal", label: "Personal" },
  { id: "contact", label: "Contact" },
  { id: "employment", label: "Employment" },
  { id: "emergency", label: "Emergency" },
];

const sites = [
  "Johannesburg Main",
  "Cape Town Depot",
  "Durban Operations",
  "Pretoria Branch",
];

const employmentTypes = ["Permanent", "Contract", "Temporary"];
const complianceOptions = [
  { value: "compliant", label: "Compliant" },
  { value: "review", label: "Review Needed" },
  { value: "action", label: "Action Required" },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function calculateServiceLength(startDate: string): string {
  if (!startDate) return "N/A";
  const start = new Date(startDate);
  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth();

  let totalMonths = years * 12 + months;
  if (totalMonths < 0) totalMonths = 0;
  const yearsPart = Math.floor(totalMonths / 12);
  const monthsPart = totalMonths % 12;

  if (yearsPart === 0) {
    return `${monthsPart} month${monthsPart !== 1 ? "s" : ""}`;
  } else if (monthsPart === 0) {
    return `${yearsPart} year${yearsPart !== 1 ? "s" : ""}`;
  } else {
    return `${yearsPart} year${yearsPart !== 1 ? "s" : ""}, ${monthsPart} month${monthsPart !== 1 ? "s" : ""}`;
  }
}

export function EmployeeProfile({
  employee,
  onBack,
  onEmployeeUpdate,
}: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState<EditTabType>("personal");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [confirmModal, setConfirmModal] = useState<
    null | "deactivate" | "delete"
  >(null);
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { moveToRecycleBin } = useRecycleBin();

  const [localEmployee, setLocalEmployee] = useState(employee);

  const [profilePicUploading, setProfilePicUploading] = useState(false);
  const [idDocUploading, setIdDocUploading] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: employee.fullName ?? "",
    date_of_birth: employee.dateOfBirth?.split("T")[0] ?? "",
    gender: employee.gender ?? "",
    nationality: employee.nationality ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    mobile: employee.mobile ?? "",
    address: employee.address ?? "",
    reporting_manager: employee.reportingManager ?? "",
    job_title: employee.jobTitle ?? "",
    site_location: employee.siteLocation ?? "",
    employment_type: employee.employmentType ?? "",
    compliance_status: employee.complianceStatus ?? "compliant",
    salary_grade: employee.salaryGrade ?? "",
    start_date: employee.startDate?.split("T")[0] ?? "",
    contract_end_date: employee.contractEndDate?.split("T")[0] ?? "",
    work_schedule: employee.workSchedule ?? "",
    emergency_contact: employee.emergencyContact ?? "",
    relationship: employee.relationship ?? "",
    emergency_phone: employee.emergencyPhone ?? "",
  });

  const set =
    (field: keyof typeof editForm) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  const mapSavedToLocal = (saved: any) => ({
    ...localEmployee,
    fullName: saved.full_name,
    dateOfBirth: saved.date_of_birth,
    gender: saved.gender,
    nationality: saved.nationality,
    email: saved.email,
    phone: saved.phone,
    mobile: saved.mobile,
    address: saved.address,
    reportingManager: saved.reporting_manager,
    jobTitle: saved.job_title,
    siteLocation: saved.site_location,
    employmentType: saved.employment_type,
    complianceStatus: saved.compliance_status,
    salaryGrade: saved.salary_grade,
    startDate: saved.start_date,
    contractEndDate: saved.contract_end_date,
    workSchedule: saved.work_schedule,
    emergencyContact: saved.emergency_contact,
    relationship: saved.relationship,
    emergencyPhone: saved.emergency_phone,
    status: saved.status,
    idDocumentFileName: saved.id_document_file_name,
    idDocumentUrl: saved.id_document_url,
    profilePictureFileName: saved.profile_picture_file_name,
    profilePictureUrl: saved.profile_picture_url,
  });

  // Re-sync local state whenever a different employee is opened —
  // guards against stale state if this component instance is reused
  // across selections.
  useEffect(() => {
    setLocalEmployee(employee);
    setEditForm({
      full_name: employee.fullName ?? "",
      date_of_birth: employee.dateOfBirth?.split("T")[0] ?? "",
      gender: employee.gender ?? "",
      nationality: employee.nationality ?? "",
      email: employee.email ?? "",
      phone: employee.phone ?? "",
      mobile: employee.mobile ?? "",
      address: employee.address ?? "",
      reporting_manager: employee.reportingManager ?? "",
      job_title: employee.jobTitle ?? "",
      site_location: employee.siteLocation ?? "",
      employment_type: employee.employmentType ?? "",
      compliance_status: employee.complianceStatus ?? "compliant",
      salary_grade: employee.salaryGrade ?? "",
      start_date: employee.startDate?.split("T")[0] ?? "",
      contract_end_date: employee.contractEndDate?.split("T")[0] ?? "",
      work_schedule: employee.workSchedule ?? "",
      emergency_contact: employee.emergencyContact ?? "",
      relationship: employee.relationship ?? "",
      emergency_phone: employee.emergencyPhone ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee.id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`${API_URL}/employees/${localEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message ?? "Save failed");
      }

      const saved = await response.json();
      const updated = mapSavedToLocal(saved);

      setLocalEmployee(updated);
      onEmployeeUpdate?.(updated);
      setShowEditModal(false);
    } catch (err: any) {
      setSaveError(err.message ?? "Unknown error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    setIsActioning(true);
    setActionError(null);
    try {
      const response = await fetch(
        `${API_URL}/employees/${localEmployee.id}/deactivate`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) throw new Error("Deactivation failed");
      const saved = await response.json();
      const updated = { ...localEmployee, status: saved.status };
      setLocalEmployee(updated);
      onEmployeeUpdate?.(updated);
      setConfirmModal(null);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsActioning(false);
    }
  };

  const handleDelete = async () => {
    setIsActioning(true);
    setActionError(null);
    try {
      const response = await fetch(`${API_URL}/employees/${localEmployee.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");

      moveToRecycleBin({
        id: localEmployee.id,
        name: localEmployee.fullName,
        type: "Employee",
        data: localEmployee,
        deletedAt: new Date().toISOString(),
      });

      onEmployeeUpdate?.({ ...localEmployee, _deleted: true });
      setConfirmModal(null);
      onBack();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsActioning(false);
    }
  };

  const handleProfilePictureChange = async (file: File) => {
    setProfilePicUploading(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await fetch(
        `${API_URL}/employees/${localEmployee.id}/profile-picture`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      const saved = await res.json();
      const updated = mapSavedToLocal(saved);
      setLocalEmployee(updated);
      onEmployeeUpdate?.(updated);
    } catch (err) {
      console.error("Profile picture upload failed:", err);
    } finally {
      setProfilePicUploading(false);
    }
  };

  const handleIdDocumentChange = async (file: File) => {
    setIdDocUploading(true);
    try {
      const formData = new FormData();
      formData.append("idDocument", file);
      const res = await fetch(
        `${API_URL}/employees/${localEmployee.id}/id-document`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) throw new Error("Upload failed");
      const saved = await res.json();
      const updated = mapSavedToLocal(saved);
      setLocalEmployee(updated);
      onEmployeeUpdate?.(updated);
    } catch (err) {
      console.error("ID document upload failed:", err);
    } finally {
      setIdDocUploading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all";
  const inputStyle = {
    backgroundColor: "var(--grey-50, #F9FAFB)",
    color: "var(--grey-900)",
    borderColor: "var(--grey-200)",
  };
  const labelStyle = {
    color: "var(--grey-600)",
    fontSize: "12px",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Back Button */}
      <div
        className="px-8 py-4 border-b"
        style={{ borderColor: "var(--grey-200)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm hover:underline"
          style={{ color: "var(--brand-blue)" }}
        >
          <ArrowLeft className="size-4" />
          Back to Workforce
        </button>
      </div>

      {/* Profile Header */}
      <div
        className="px-8 py-6 border-b"
        style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Employee Photo — editable */}
            <label className="relative cursor-pointer group shrink-0">
              <div
                className="size-24 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden"
                style={{ backgroundColor: "var(--brand-blue)" }}
              >
                {localEmployee.profilePictureUrl ? (
                  <img
                    src={localEmployee.profilePictureUrl}
                    alt={localEmployee.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (localEmployee.fullName || "Unknown User")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                {profilePicUploading ? "Uploading…" : "Change"}
              </div>
              {/* Persistent camera badge — always visible, not just on hover */}
              <div
                className="absolute -bottom-1 -right-1 size-8 rounded-full flex items-center justify-center border-2"
                style={{
                  backgroundColor: "var(--brand-blue)",
                  borderColor: "white",
                }}
              >
                <Camera className="size-4 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProfilePictureChange(file);
                }}
              />
            </label>

            {/* Employee Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl" style={{ color: "var(--grey-900)" }}>
                  {localEmployee.fullName}
                </h1>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 text-white"
                  style={{
                    backgroundColor:
                      localEmployee.status === "Inactive"
                        ? "var(--grey-400)"
                        : "var(--compliance-success)",
                  }}
                >
                  <CheckCircle2 className="size-4" />
                  {localEmployee.status}
                </span>
              </div>
              <p className="text-lg mb-1" style={{ color: "var(--grey-600)" }}>
                {localEmployee.jobTitle}
              </p>
              <p className="text-sm mb-3" style={{ color: "var(--grey-500)" }}>
                {localEmployee.employeeId}
              </p>
              <div
                className="flex items-center gap-6 text-sm"
                style={{ color: "var(--grey-600)" }}
              >
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  {localEmployee.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {localEmployee.mobile}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {localEmployee.siteLocation}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 relative">
            <button
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              style={{
                backgroundColor: "var(--grey-100)",
                color: "var(--grey-900)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-200)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--grey-100)";
              }}
            >
              <Download className="size-4" />
              Export Profile
            </button>
            <button
              onClick={() => {
                setEditTab("personal");
                setShowEditModal(true);
              }}
              className="px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-blue)" }}
            >
              <Edit className="size-4" />
              Edit Profile
            </button>

            <div className="relative">
              <button
                onClick={() => setShowActionMenu((v) => !v)}
                className="px-3 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "var(--grey-100)",
                  color: "var(--grey-900)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--grey-200)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--grey-100)";
                }}
              >
                ⋮
              </button>
              {showActionMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActionMenu(false)}
                  />
                  <div
                    className="absolute right-0 mt-1 w-52 rounded-lg border shadow-lg z-20 overflow-hidden"
                    style={{
                      backgroundColor: "white",
                      borderColor: "var(--grey-200)",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowActionMenu(false);
                        setConfirmModal("deactivate");
                      }}
                      className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 transition-colors hover:bg-amber-50"
                      style={{ color: "#B45309" }}
                    >
                      <UserX className="size-4" />
                      Deactivate Employee
                    </button>
                    <div style={{ borderTop: "1px solid var(--grey-100)" }} />
                    <button
                      onClick={() => {
                        setShowActionMenu(false);
                        setConfirmModal("delete");
                      }}
                      className="w-full px-4 py-3 text-sm text-left flex items-center gap-2 transition-colors hover:bg-red-50"
                      style={{ color: "#DC2626" }}
                    >
                      <Trash2 className="size-4" />
                      Delete Permanently
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div
        className="border-b"
        style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
      >
        <div className="px-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium transition-colors relative"
                style={{
                  color:
                    activeTab === tab.id
                      ? "var(--brand-blue)"
                      : "var(--grey-600)",
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id)
                    e.currentTarget.style.color = "var(--grey-900)";
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id)
                    e.currentTarget.style.color = "var(--grey-600)";
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: "var(--brand-blue)" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === "personal" && (
          <PersonalDetailsTab
            employee={localEmployee}
            onIdDocumentUpload={handleIdDocumentChange}
            idDocUploading={idDocUploading}
          />
        )}
        {activeTab === "appointments" && (
          <LegalAppointments employeeId={localEmployee.employeeId} />
        )}
        {activeTab === "training" && (
          <TrainingMatrix employeeId={localEmployee.employeeId} />
        )}
        {activeTab === "medical" && (
          <MedicalSurveillanceEnhanced employeeId={localEmployee.employeeId} />
        )}
        {activeTab === "ppe" && (
          <PPERegister employeeId={localEmployee.employeeId} />
        )}
        {activeTab === "documents" && (
          <PlaceholderTab title="Scanned Documents" />
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col"
            style={{ maxHeight: "90vh" }}
          >
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: "var(--grey-200)" }}
            >
              <h2
                className="text-xl font-medium"
                style={{ color: "var(--grey-900)" }}
              >
                Edit Profile — {localEmployee.fullName}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-sm px-3 py-1 rounded-lg"
                style={{
                  backgroundColor: "var(--grey-100)",
                  color: "var(--grey-600)",
                }}
              >
                ✕
              </button>
            </div>

            <div
              className="border-b px-6"
              style={{ borderColor: "var(--grey-200)" }}
            >
              <div className="flex gap-1">
                {editTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEditTab(t.id)}
                    className="px-4 py-3 text-sm font-medium relative transition-colors"
                    style={{
                      color:
                        editTab === t.id
                          ? "var(--brand-blue)"
                          : "var(--grey-600)",
                    }}
                  >
                    {t.label}
                    {editTab === t.id && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: "var(--brand-blue)" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-5">
              {/* Personal */}
              {editTab === "personal" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Full name</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.full_name}
                      onChange={set("full_name")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Date of birth</label>
                    <input
                      type="date"
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.date_of_birth}
                      onChange={set("date_of_birth")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.gender}
                      onChange={set("gender")}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Nationality</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.nationality}
                      onChange={set("nationality")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Employee ID document</label>
                    <div className="flex items-center gap-3">
                      {localEmployee.idDocumentUrl && (
                        <a
                          href={localEmployee.idDocumentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm px-3 py-2 rounded-lg flex items-center gap-2"
                          style={{
                            backgroundColor: "var(--grey-100)",
                            color: "var(--brand-blue)",
                          }}
                        >
                          <IdCard className="size-4" />
                          {localEmployee.idDocumentFileName ||
                            "View current document"}
                        </a>
                      )}
                      <label
                        className="text-sm px-3 py-2 rounded-lg cursor-pointer"
                        style={{
                          backgroundColor: "var(--grey-100)",
                          color: "var(--grey-700)",
                        }}
                      >
                        {idDocUploading
                          ? "Uploading…"
                          : localEmployee.idDocumentUrl
                            ? "Replace"
                            : "Upload"}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleIdDocumentChange(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact */}
              {editTab === "contact" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.email}
                      onChange={set("email")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Office phone</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.phone}
                      onChange={set("phone")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Mobile phone</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.mobile}
                      onChange={set("mobile")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label style={labelStyle}>Address</label>
                    <textarea
                      rows={2}
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.address}
                      onChange={set("address")}
                    />
                  </div>
                </div>
              )}

              {/* Employment */}
              {editTab === "employment" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Job title</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.job_title}
                      onChange={set("job_title")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Site location</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.site_location}
                      onChange={set("site_location")}
                    >
                      {sites.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Reporting manager</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.reporting_manager}
                      onChange={set("reporting_manager")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Employment type</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.employment_type}
                      onChange={set("employment_type")}
                    >
                      <option value="">Select</option>
                      {employmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Compliance status</label>
                    <select
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.compliance_status}
                      onChange={set("compliance_status")}
                    >
                      {complianceOptions.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Salary grade</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.salary_grade}
                      onChange={set("salary_grade")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Start date</label>
                    <input
                      type="date"
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.start_date}
                      onChange={set("start_date")}
                    />
                  </div>
                  {editForm.employment_type === "Contract" && (
                    <div>
                      <label style={labelStyle}>Contract end date</label>
                      <input
                        type="date"
                        className={inputClass}
                        style={inputStyle}
                        value={editForm.contract_end_date}
                        onChange={set("contract_end_date")}
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label style={labelStyle}>Work schedule</label>
                    <textarea
                      rows={2}
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.work_schedule}
                      onChange={set("work_schedule")}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs" style={{ color: "var(--grey-500)" }}>
                      Length of service:{" "}
                      <strong>
                        {calculateServiceLength(editForm.start_date)}
                      </strong>{" "}
                      (calculated automatically from the start date)
                    </p>
                  </div>
                </div>
              )}

              {/* Emergency */}
              {editTab === "emergency" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Contact name</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.emergency_contact}
                      onChange={set("emergency_contact")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Relationship</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.relationship}
                      onChange={set("relationship")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone number</label>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      value={editForm.emergency_phone}
                      onChange={set("emergency_phone")}
                    />
                  </div>
                </div>
              )}

              {saveError && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: "var(--compliance-danger)" }}
                >
                  Error: {saveError}
                </p>
              )}
            </div>

            <div
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: "var(--grey-200)" }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--grey-100)",
                  color: "var(--grey-700)",
                }}
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                {editTabs.findIndex((t) => t.id === editTab) > 0 && (
                  <button
                    onClick={() =>
                      setEditTab(
                        editTabs[
                          editTabs.findIndex((t) => t.id === editTab) - 1
                        ].id,
                      )
                    }
                    className="px-4 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: "var(--grey-100)",
                      color: "var(--grey-700)",
                    }}
                  >
                    ← Back
                  </button>
                )}
                {editTabs.findIndex((t) => t.id === editTab) <
                editTabs.length - 1 ? (
                  <button
                    onClick={() =>
                      setEditTab(
                        editTabs[
                          editTabs.findIndex((t) => t.id === editTab) + 1
                        ].id,
                      )
                    }
                    className="px-4 py-2 rounded-lg text-sm text-white"
                    style={{ backgroundColor: "var(--brand-blue)" }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2 rounded-lg text-sm text-white font-medium disabled:opacity-60"
                    style={{ backgroundColor: "#16A34A" }}
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirmation */}
      {confirmModal === "deactivate" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FEF3C7" }}
              >
                <UserX className="size-5" style={{ color: "#B45309" }} />
              </div>
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--grey-900)" }}
              >
                Deactivate Employee
              </h2>
            </div>
            <p className="text-sm mb-1" style={{ color: "var(--grey-700)" }}>
              Are you sure you want to deactivate{" "}
              <strong>{localEmployee.fullName}</strong>?
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--grey-500)" }}>
              Their record will be kept but they will be marked as Inactive.
              This can be reversed by editing their profile.
            </p>
            {actionError && (
              <p className="text-sm mb-4" style={{ color: "#DC2626" }}>
                Error: {actionError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmModal(null);
                  setActionError(null);
                }}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--grey-100)",
                  color: "var(--grey-700)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isActioning}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: "#D97706" }}
              >
                {isActioning ? "Deactivating…" : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmModal === "delete" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="size-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#FEE2E2" }}
              >
                <Trash2 className="size-5" style={{ color: "#DC2626" }} />
              </div>
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--grey-900)" }}
              >
                Delete Permanently
              </h2>
            </div>
            <p className="text-sm mb-1" style={{ color: "var(--grey-700)" }}>
              Are you sure you want to permanently delete{" "}
              <strong>{localEmployee.fullName}</strong>?
            </p>
            <p className="text-sm mb-6" style={{ color: "#DC2626" }}>
              ⚠ This cannot be undone. All data for this employee will be
              removed from the database.
            </p>
            {actionError && (
              <p className="text-sm mb-4" style={{ color: "#DC2626" }}>
                Error: {actionError}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmModal(null);
                  setActionError(null);
                }}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: "var(--grey-100)",
                  color: "var(--grey-700)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isActioning}
                className="px-4 py-2 rounded-lg text-sm text-white disabled:opacity-60"
                style={{ backgroundColor: "#DC2626" }}
              >
                {isActioning ? "Deleting…" : "Yes, Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalDetailsTab({
  employee,
  onIdDocumentUpload,
  idDocUploading,
}: {
  employee: any;
  onIdDocumentUpload: (file: File) => void;
  idDocUploading: boolean;
}) {
  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Personal Information
          </h2>
          <div className="space-y-4">
            <InfoField label="Employee ID" value={employee.employeeId} />
            <InfoField label="Full Name" value={employee.fullName} />
            <InfoField
              label="Date of Birth"
              value={
                employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"
              }
            />
            <InfoField label="Gender" value={employee.gender} />
            <InfoField label="Nationality" value={employee.nationality} />
            <div>
              <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
                ID Document
              </p>
              {employee.idDocumentUrl ? (
                <a
                  href={employee.idDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: "var(--grey-100)",
                    color: "var(--brand-blue)",
                  }}
                >
                  <IdCard className="size-4" />
                  {employee.idDocumentFileName || "View document"}
                </a>
              ) : (
                <label
                  className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer"
                  style={{
                    backgroundColor: "var(--grey-100)",
                    color: "var(--grey-700)",
                  }}
                >
                  {idDocUploading ? "Uploading…" : "Upload ID document"}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onIdDocumentUpload(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Contact Information
          </h2>
          <div className="space-y-4">
            <InfoField label="Email" value={employee.email} />
            <InfoField label="Office Phone" value={employee.phone} />
            <InfoField label="Mobile Phone" value={employee.mobile} />
            <InfoField label="Address" value={employee.address} multiline />
          </div>
        </div>

        {/* Emergency Contact */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Emergency Contact
          </h2>
          <div className="space-y-4">
            <InfoField label="Contact Name" value={employee.emergencyContact} />
            <InfoField label="Relationship" value={employee.relationship} />
            <InfoField label="Phone Number" value={employee.emergencyPhone} />
          </div>
        </div>

        {/* Employment Details */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Employment Details
          </h2>
          <div className="space-y-4">
            <InfoField label="Job Title" value={employee.jobTitle} />
            <InfoField label="Site Location" value={employee.siteLocation} />
            <InfoField
              label="Reporting Manager"
              value={employee.reportingManager}
            />
            <InfoField
              label="Employment Type"
              value={employee.employmentType}
            />
          </div>
        </div>

        {/* Employment Timeline */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Employment Timeline
          </h2>
          <div className="space-y-4">
            <InfoField
              label="Start Date"
              value={
                employee.startDate
                  ? new Date(employee.startDate).toLocaleDateString("en-ZA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"
              }
            />
            <InfoField
              label="Contract End Date"
              value={employee.contractEndDate || "N/A - Permanent"}
            />
          </div>
        </div>

        {/* Compensation & Schedule */}
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
        >
          <h2 className="text-xl mb-6" style={{ color: "var(--grey-900)" }}>
            Compensation & Schedule
          </h2>
          <div className="space-y-4">
            <InfoField label="Salary Grade" value={employee.salaryGrade} />
            <InfoField
              label="Work Schedule"
              value={employee.workSchedule}
              multiline
            />
            <InfoField
              label="Length of Service"
              value={calculateServiceLength(employee.startDate)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-sm mb-1" style={{ color: "var(--grey-600)" }}>
        {label}
      </p>
      <p style={{ color: "var(--grey-900)" }}>{value || "N/A"}</p>
    </div>
  );
}

function PlaceholderTab({ title }: { title: string }) {
  return (
    <div
      className="rounded-lg border p-12"
      style={{ backgroundColor: "white", borderColor: "var(--grey-200)" }}
    >
      <div className="text-center">
        <FileText
          className="size-12 mx-auto mb-4"
          style={{ color: "var(--grey-400)" }}
        />
        <h2 className="text-2xl mb-2" style={{ color: "var(--grey-700)" }}>
          {title}
        </h2>
        <p style={{ color: "var(--grey-500)" }}>
          This section is under development
        </p>
      </div>
    </div>
  );
}
