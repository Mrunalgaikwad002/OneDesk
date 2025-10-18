export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://onedesk-backend.onrender.com';
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export async function apiPost(path, body, token) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error || 'Request failed';
      throw new Error(message);
    }
    return data;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to fetch - Network error');
    }
    throw error;
  }
}

export async function apiGet(path, token) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error || 'Request failed';
      throw new Error(message);
    }
    return data;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to fetch - Network error');
    }
    throw error;
  }
}

export async function apiPut(path, body, token) {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.error || 'Request failed';
      throw new Error(message);
    }
    return data;
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Failed to fetch - Network error');
    }
    throw error;
  }
}


