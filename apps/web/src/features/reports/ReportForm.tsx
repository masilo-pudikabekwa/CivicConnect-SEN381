/**
 * ==============================================================================
 * Citizen Issue Report Form Component
 *
 * Traceability:
 *   - FR-01: Citizen submits a civic issue report
 *   - FR-02: Enforces minimum structured fields (category, location, description)
 *   - FR-03: Displays immediate on-screen confirmation with unique reference number
 *   - NFR-02: Simple 3-step submission flow unaided (Usability Driver)
 * ==============================================================================
 */

import React, { useState } from "react";
import { apiRequest } from "../../shared/api/client";

export function ReportForm() {
  const [category, setCategory] = useState("ROADS");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setReference(null);
    setLoading(true);

    try {
      // Calls POST /api/v1/reports
      const res = await apiRequest<{ reference: string }>("/reports", {
        method: "POST",
        body: JSON.stringify({ category, location, description })
      });
      setReference(res.reference);
      setLocation("");
      setDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Submit Community Report (FR-01, FR-02)</h3>
      {reference && (
        <div className="alert success">
          <strong>Submission Accepted! (FR-03)</strong>
          <p>Unique Tracking Reference: <code>{reference}</code></p>
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category (FR-02)</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ROADS">Roads & Potholes</option>
            <option value="WATER">Water & Sanitation</option>
            <option value="ELECTRICITY">Electricity & Lighting</option>
            <option value="WASTE">Waste Management</option>
            <option value="PARKS">Parks & Infrastructure</option>
            <option value="OTHER">Other Issues</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location (FR-02)</label>
          <input
            type="text"
            required
            placeholder="e.g. Corner of 5th Ave and Main St"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description (FR-02)</label>
          <textarea
            required
            rows={4}
            placeholder="Provide sufficient details for civic personnel to action..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}