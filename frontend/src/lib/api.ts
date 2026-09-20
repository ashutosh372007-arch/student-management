const PRODUCTION_API = 'https://student-management-1-1ttu.onrender.com/api';
const LOCAL_API = 'http://localhost:5000/api';

class ApiClient {
  private getBaseUrl(): string {
    // 1. Environment variable takes highest priority
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // 2. In browser: check if running on localhost or on cloud (Vercel/etc)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return LOCAL_API;
      }
      // Running on Vercel or any cloud domain -> use production Render backend
      return PRODUCTION_API;
    }
    // 3. Server-side rendering (no window) -> use production URL
    return PRODUCTION_API;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return res.json();
  }
}

const api = new ApiClient();
export default api;

