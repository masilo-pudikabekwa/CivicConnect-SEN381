import React, { useState } from "react";
import { apiRequest } from "../../shared/api/client";

export function StatusLookup() {
  const [refInput, setRefInput] = useState("");
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReport(null);

    try {
      const data = await apiRequest<any>(`/reports/${refInput.trim()}`);
      setReport(data);
    } catch (err: any) {
      setError(err.message);
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