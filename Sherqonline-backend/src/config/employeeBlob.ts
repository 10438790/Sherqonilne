import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

import { DefaultAzureCredential } from "@azure/identity";

import crypto from "crypto";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

const idDocumentsContainerName =
  process.env.AZURE_STORAGE_EMPLOYEE_ID_DOCS_CONTAINER ||
  "employee-id-documents";

const profilePicturesContainerName =
  process.env.AZURE_STORAGE_EMPLOYEE_PROFILE_PICTURES_CONTAINER ||
  "employee-profile-pictures";

if (!accountName) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME environment variable is required",
  );
}

const credential = new DefaultAzureCredential();

const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  credential,
);

const idDocumentsContainerClient = blobServiceClient.getContainerClient(
  idDocumentsContainerName,
);

const profilePicturesContainerClient = blobServiceClient.getContainerClient(
  profilePicturesContainerName,
);

function buildSasUrl(
  containerClient: ReturnType<BlobServiceClient["getContainerClient"]>,
  containerName: string,
  blobName: string,
): string {
  const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

  if (!storageAccountKey) {
    throw new Error(
      "AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs",
    );
  }

  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName!,
    storageAccountKey,
  );

  const expiresOn = new Date(Date.now() + 10 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 60 * 1000),
      expiresOn,
    },
    sharedKeyCredential,
  ).toString();

  return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}

/* ------------------------------------------------------------------ */
/* ID DOCUMENTS                                                        */
/* ------------------------------------------------------------------ */

export async function uploadEmployeeIdDocument(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  employeeId: number,
) {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const blobName = `employee-${employeeId}/${crypto.randomUUID()}${extension}`;

  const blockBlobClient =
    idDocumentsContainerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobContentDisposition: "inline",
    },
  });

  return {
    blobName,
    fileName: originalName,
    mimeType,
    fileSize: buffer.length,
  };
}

export function getEmployeeIdDocumentSasUrl(blobName: string): string {
  return buildSasUrl(
    idDocumentsContainerClient,
    idDocumentsContainerName,
    blobName,
  );
}

export async function deleteEmployeeIdDocument(blobName: string) {
  await idDocumentsContainerClient.getBlobClient(blobName).deleteIfExists();
}

/* ------------------------------------------------------------------ */
/* PROFILE PICTURES                                                    */
/* ------------------------------------------------------------------ */

export async function uploadEmployeeProfilePicture(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  employeeId: number,
) {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const blobName = `employee-${employeeId}/${crypto.randomUUID()}${extension}`;

  const blockBlobClient =
    profilePicturesContainerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
      blobContentDisposition: "inline",
    },
  });

  return {
    blobName,
    fileName: originalName,
    mimeType,
    fileSize: buffer.length,
  };
}

export function getEmployeeProfilePictureSasUrl(blobName: string): string {
  return buildSasUrl(
    profilePicturesContainerClient,
    profilePicturesContainerName,
    blobName,
  );
}

export async function deleteEmployeeProfilePicture(blobName: string) {
  await profilePicturesContainerClient
    .getBlobClient(blobName)
    .deleteIfExists();
}