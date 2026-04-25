const API_URL = '/api';

export const fetchApi = async (endpoint: string, options: any = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // If it's a FormData object, let the browser set the content type
  if (options.body instanceof FormData) {
    if (headers['Content-Type']) {
      delete headers['Content-Type'];
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const downloadFile = async (noteId: number, fileName: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/notes/${noteId}/download`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) throw new Error('Download failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
