export interface Employee {
  id?: number;
  employeeNumber?: string;

  // Personal
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;

  // Contact
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;

  // Employment
  reportingManager?: string;
  jobTitle?: string;
  siteLocation?: string;
  employmentType?: string;

  // Timeline
  startDate?: string;
  contractEndDate?: string;

  // Compensation
  salaryGrade?: string;
  workSchedule?: string;

  // Compliance / status
  complianceStatus?: "compliant" | "review" | "action";
  status?: string;

  // Emergency contact
  emergencyContact?: string;
  relationship?: string;
  emergencyPhone?: string;

  // ID document (Azure Blob)
  idDocumentBlobName?: string;
  idDocumentFileName?: string;
  idDocumentSize?: number;
  idDocumentMimeType?: string;

  // Profile picture (Azure Blob)
  profilePictureBlobName?: string;
  profilePictureFileName?: string;
  profilePictureSize?: number;
  profilePictureMimeType?: string;
}