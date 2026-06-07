const API_BASE_URL = process.env.REACT_APP_API_URL ?? '/api';

export type FinDocUpload = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export type FinDocCitation = {
  chunkId: string;
  documentName: string;
  page: number;
  sectionLabel: string;
  snippet: string;
  box?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  } | null;
};

export type FinDocDocumentSummary = {
  documentId: string;
  name: string;
  type: string;
  supplierName: string;
  invoiceNumber: string;
  documentDate: string;
  totalAmount: string;
  currency: string;
  lineItemCount: number;
};

export type FinDocSessionPayload = {
  success: boolean;
  sessionId: string;
  createdAt: string;
  documents: FinDocDocumentSummary[];
  bankStatement: {
    fileName: string;
    rowCount: number;
    columns: string[];
  } | null;
};

export type FinDocAnswerPayload = {
  success: boolean;
  answer: string;
  grounded: boolean;
  confidence: number;
  citations: FinDocCitation[];
  bankReconciliation: Array<{
    documentName: string;
    supplierName: string;
    totalAmount: string;
    rowNumber: number;
    rowText: string;
  }> | null;
  documents: FinDocDocumentSummary[];
};

type HistoryItem = {
  role: 'user' | 'assistant';
  text: string;
};

async function requestJson<T>(path: string, init: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as (T & { success?: boolean; message?: string }) | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? 'Η κλήση προς το FinDoc AI απέτυχε.');
  }

  return payload as T;
}

export async function createFinDocSession(documents: FinDocUpload[], bankStatement?: FinDocUpload | null) {
  return requestJson<FinDocSessionPayload>('/findoc/sessions', {
    method: 'POST',
    body: JSON.stringify({
      documents,
      bankStatement: bankStatement ?? null,
    }),
  });
}

export async function askFinDocQuestion(sessionId: string, question: string, history: HistoryItem[]) {
  return requestJson<FinDocAnswerPayload>(`/findoc/sessions/${encodeURIComponent(sessionId)}/ask`, {
    method: 'POST',
    body: JSON.stringify({
      question,
      history: history.slice(-8),
    }),
  });
}
