/**
 * ==============================================================================
 * Civic Personnel Management Dashboard Component
 *
 * Traceability:
 *   - FR-05: Performs valid status transitions (Review -> In Progress -> Resolve)
 *   - FR-06: Filters and sorts reports by status for personnel review
 *   - FR-08: Restricted to users with PERSONNEL or ADMIN roles
 * ==============================================================================
 */

import { useEffect, useState } from "react";
import { apiRequest } from "../../shared/api/client";

export function StaffDashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Queries GET /api/v1/reports with optional status query parameter (FR-06)
  const loadReports = async () => {
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      const data = await apiRequest<any[]>(`/reports${q}`);
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  // Triggers PATCH /api/v1/reports/:reference/status (FR-05)
  const advanceStatus = async (reference: string, nextStatus: string) => {
    try {
      await apiRequest(`/reports/${reference}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      });
      loadReports(); // Refresh view upon successful state change
    } catch (err: any) {
      alert(`Transition rejected by state machine: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h3>Civic Personnel Dashboard (FR-05, FR-06)</h3>
      {error && <div className="alert error">{error}</div>}

      <div style={{ marginBottom: "16px" }}>
        <label>Filter by Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Reports</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Category</th>
            <th>Location</th>
            <th>Status</th>
            <th>Allowed Transitions (FR-05)</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td><code>{r.reference}</code></td>
              <td>{r.category}</td>
              <td>{r.location}</td>
              <td><span className={`badge ${r.status}`}>{r.status}</span></td>
              <td>
                {r.status === "SUBMITTED" && (
                  <button onClick={() => advanceStatus(r.reference, "UNDER_REVIEW")}>Review</button>
                )}
                {r.status === "UNDER_REVIEW" && (
                  <button onClick={() => advanceStatus(r.reference, "IN_PROGRESS")}>In Progress</button>
                )}
                {r.status === "IN_PROGRESS" && (
                  <button onClick={() => advanceStatus(r.reference, "RESOLVED")}>Resolve</button>
                )}
                {r.status === "RESOLVED" && <span>Resolved</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}