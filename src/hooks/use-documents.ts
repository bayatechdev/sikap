import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Document {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  documentType: string;
  uploadedAt: string;
}

interface DocumentsResponse {
  documents: Document[];
}

interface UploadDocumentData {
  file: File;
  applicationId: string;
  documentType: string;
}

interface UploadDocumentResponse {
  success: boolean;
  document: Document;
  message: string;
}

async function uploadDocument(data: UploadDocumentData): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('applicationId', data.applicationId);
  formData.append('documentType', data.documentType);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'File upload failed');
  }

  return response.json();
}

async function fetchDocuments(applicationId: string): Promise<DocumentsResponse> {
  const response = await fetch(`/api/documents/upload?applicationId=${applicationId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }

  return response.json();
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDocument,
    onSuccess: (data) => {
      // Invalidate documents list to refresh data
      queryClient.invalidateQueries({
        queryKey: ['documents', data.document.id]
      });
    },
  });
}

export function useDocuments(applicationId: string) {
  return useQuery({
    queryKey: ['documents', applicationId],
    queryFn: () => fetchDocuments(applicationId),
    enabled: !!applicationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function generateDownloadUrl(documentId: string, token?: string): string {
  const baseUrl = `/api/documents/${documentId}/download`;
  return token ? `${baseUrl}?token=${token}` : baseUrl;
}