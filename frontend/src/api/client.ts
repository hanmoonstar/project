const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    // Try to get error details from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.detail || `API error: ${response.status}`);
    } catch (e) {
      throw new Error(`API error: ${response.status}`);
    }
  }
  
  return response.json();
}

// Workflow API
export const workflowAPI = {
  list: () => fetchAPI('/workflows/'),
  create: (data: any) => fetchAPI('/workflows/', { method: 'POST', body: JSON.stringify(data) }),
  execute: (id: number) => fetchAPI(`/workflows/${id}/execute`, { method: 'POST' }),
  history: (id: number) => fetchAPI(`/workflows/${id}/history`),
};

// Inbox API
export const inboxAPI = {
  getEmails: () => fetchAPI('/inbox/emails'),
  getSummary: () => fetchAPI('/inbox/summary'),
  markAsRead: (id: string) => fetchAPI(`/inbox/emails/${id}/mark-read`, { method: 'POST' }),
  connectEmail: (email: string, password: string, provider: string) => fetchAPI('/inbox/connect/email', { 
    method: 'POST', 
    body: JSON.stringify({ email, password, provider }) 
  }),
};

// NLP API
export const nlpAPI = {
  parse: (text: string) => fetchAPI('/nlp/parse', { method: 'POST', body: JSON.stringify({ text }) }),
  preview: (text: string) => fetchAPI('/nlp/preview', { method: 'POST', body: JSON.stringify({ text }) }),
  createWorkflow: (text: string) => fetchAPI('/nlp/create-workflow', { method: 'POST', body: JSON.stringify({ text }) }),
};
