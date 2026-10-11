/**
 * ==============================================================================
 * Frontend API Transport Wrapper
 *
 * Traceability:
 *   - PED v2.0 Section 7.5: Centralized API client boundary
 *   - FR-07: Automatically attaches Bearer token from localStorage
 *
 * Design Intent:
 *   Encapsulates base URLs, headers, and error handling so individual UI components
 *   remain decoupled from HTTP transport mechanics.
 * ==============================================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>)
  };

  // Inject authentication header when session token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || `HTTP error ${response.status}`);
  }

  return result.data as T;
}