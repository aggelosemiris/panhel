const API_BASE_URL = process.env.REACT_APP_API_URL ?? '/api';

export type AuthUser = {
  id: string;
  contact: string;
  fullName: string;
  username: string;
  createdAt: string;
  verifiedAt?: string;
};

type ApiResponse<T> = T & {
  success: boolean;
  message?: string;
};

async function requestJson<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? 'Κάτι πήγε στραβά.');
  }

  return payload;
}

export async function startRegistrationRequest(contact: string) {
  return requestJson<{
    deliveryMethod?: string;
    previewCode?: string;
    previewMessage?: string;
  }>('/auth/register/start', { contact });
}

export async function completeRegistrationRequest(payload: {
  contact: string;
  code: string;
  password: string;
  fullName: string;
  username: string;
}) {
  return requestJson<{
    user: AuthUser;
  }>('/auth/register/complete', payload);
}

export async function loginRequest(payload: { contact: string; password: string }) {
  return requestJson<{
    user: AuthUser;
  }>('/auth/login', payload);
}

export async function forgotPasswordRequest(contact: string) {
  return requestJson<{
    deliveryMethod?: string;
    previewCode?: string;
    previewMessage?: string;
    successMessage?: string;
  }>('/auth/password/forgot', { contact });
}

export async function resetPasswordRequest(payload: {
  contact: string;
  code: string;
  newPassword: string;
}) {
  return requestJson<{
    user: AuthUser;
  }>('/auth/password/reset', payload);
}
