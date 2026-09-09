"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEmployeeIdDocument = uploadEmployeeIdDocument;
exports.getEmployeeIdDocumentSasUrl = getEmployeeIdDocumentSasUrl;
exports.deleteEmployeeIdDocument = deleteEmployeeIdDocument;
exports.uploadEmployeeProfilePicture = uploadEmployeeProfilePicture;
exports.getEmployeeProfilePictureSasUrl = getEmployeeProfilePictureSasUrl;
exports.deleteEmployeeProfilePicture = deleteEmployeeProfilePicture;
const storage_blob_1 = require("@azure/storage-blob");
const crypto_1 = __importDefault(require("crypto"));
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const idDocumentsContainerName = process.env.AZURE_STORAGE_EMPLOYEE_ID_DOCS_CONTAINER ||
    "employee-id-documents";
const profilePicturesContainerName = process.env.AZURE_STORAGE_EMPLOYEE_PROFILE_PICTURES_CONTAINER ||
    "employee-profile-pictures";
if (!accountName || !accountKey) {
    throw new Error("AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY environment variables are required");
}
const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new storage_blob_1.BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);
const idDocumentsContainerClient = blobServiceClient.getContainerClient(idDocumentsContainerName);
const profilePicturesContainerClient = blobServiceClient.getContainerClient(profilePicturesContainerName);
function buildSasUrl(containerClient, containerName, blobName) {
    const storageAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    if (!storageAccountKey) {
        throw new Error("AZURE_STORAGE_ACCOUNT_KEY is required to generate SAS URLs");
    }
    const sharedKeyCredential = new storage_blob_1.StorageSharedKeyCredential(accountName, storageAccountKey);
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000);
    const sasToken = (0, storage_blob_1.generateBlobSASQueryParameters)({
        containerName,
        blobName,
        permissions: storage_blob_1.BlobSASPermissions.parse("r"),
        startsOn: new Date(Date.now() - 60 * 1000),
        expiresOn,
    }, sharedKeyCredential).toString();
    return `${containerClient.getBlobClient(blobName).url}?${sasToken}`;
}
/* ------------------------------------------------------------------ */
/* ID DOCUMENTS                                                        */
/* ------------------------------------------------------------------ */
async function uploadEmployeeIdDocument(buffer, originalName, mimeType, employeeId) {
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const blobName = `employee-${employeeId}/${crypto_1.default.randomUUID()}${extension}`;
    const blockBlobClient = idDocumentsContainerClient.getBlockBlobClient(blobName);
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
function getEmployeeIdDocumentSasUrl(blobName) {
    return buildSasUrl(idDocumentsContainerClient, idDocumentsContainerName, blobName);
}
async function deleteEmployeeIdDocument(blobName) {
    await idDocumentsContainerClient.getBlobClient(blobName).deleteIfExists();
}
/* ------------------------------------------------------------------ */
/* PROFILE PICTURES                                                    */
/* ------------------------------------------------------------------ */
async function uploadEmployeeProfilePicture(buffer, originalName, mimeType, employeeId) {
    const extension = originalName.includes(".")
        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
        : "";
    const blobName = `employee-${employeeId}/${crypto_1.default.randomUUID()}${extension}`;
    const blockBlobClient = profilePicturesContainerClient.getBlockBlobClient(blobName);
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
function getEmployeeProfilePictureSasUrl(blobName) {
    return buildSasUrl(profilePicturesContainerClient, profilePicturesContainerName, blobName);
}
async function deleteEmployeeProfilePicture(blobName) {
    await profilePicturesContainerClient
        .getBlobClient(blobName)
        .deleteIfExists();
}
