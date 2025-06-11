// src/lib/api.ts

export async function createLead(data: {
  name: string;
  company?: string;
  document?: string;
  email?: string;
  phone?: string;
  origin?: string;
  market?: string;
  stage: string;
  userId: string;
}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token = localStorage.getItem('access_token');

  if (!API_URL) {
    throw new Error('API URL não configurada.');
  }

  if (!token) {
    throw new Error('Usuário não autenticado.');
  }

  const res = await fetch(`${API_URL}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Erro ao criar lead.');
  }

  return res.json();
}
