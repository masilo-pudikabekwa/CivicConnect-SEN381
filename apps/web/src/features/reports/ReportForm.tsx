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
          <p>Unique Reference: <code>{reference}</code></p>
        </div>
      )}
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="ROADS">Roads & Potholes</option>
            <option value="WATER">Water & Sanitation</option>
            <option value="ELECTRICITY">Electricity & Outages</option>
            <option value="WASTE">Waste Collection</option>
            <option value="PARKS">Parks & Infrastructure</option>
            <option value="OTHER">Other Issue</option>
          </select>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            required
            placeholder="e.g. Cnr Main St & 3rd Ave"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            required
            rows={4}
            placeholder="Detailed description of the issue..."
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