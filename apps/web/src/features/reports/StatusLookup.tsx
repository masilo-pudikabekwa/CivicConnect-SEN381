/**
 * ==============================================================================
 * Citizen Report Status Lookup Component
 *
 * Traceability:
 *   - FR-04: Citizen queries status and last-updated timestamp by reference
 *   - NFR-02: Fast, single-input feedback for citizens
 * ==============================================================================
 */

import React, { useState } from "react";
import { apiRequest } from "../../shared/api/client";

interface ReportDetail {
  reference: string;
  category: string;
  description: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function StatusLookup() {
  const [refInput, setRefInput] = useState("");
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Queries GET /api/v1/reports/:reference (FR-04)
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReport(null);

    try {
      const data = await apiRequest<ReportDetail>(`/reports/${refInput.trim()}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message || "Could not retrieve report");
    }
  };

  return (
    <div className="card">
      <h3>Track Report Status (FR-04)</h3>
      <form onSubmit={handleLookup} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          type="text"
          required
          placeholder="e.g. CC-20261006-1234"
          value={refInput}
          onChange={(e) => setRefInput(e.target.value)}
        />
        <button type="submit">Query</button>
      </form>

      {error && <div className="alert error">{error}</div>}

      {report && (
        <div className="status-box">
          <p><strong>Reference:</strong> {report.reference}</p>
          <p><strong>Category:</strong> {report.category}</p>
          <p><strong>Status:</strong> <span className={`badge ${report.status}`}>{report.status}</span></p>
          <p><strong>Location:</strong> {report.location}</p>
          <p><strong>Last Updated:</strong> {new Date(report.updatedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}