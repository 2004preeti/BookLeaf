// client/src/utils/api.js
// Safe HTTP Fetch & JSON handling utility

export async function safeJson(res) {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return {};
    return JSON.parse(text);
  } catch (err) {
    console.warn('Failed to parse JSON response:', err);
    return {};
  }
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('bookleaf_token');
  const headers = {
    ...(options.headers || {})
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}
