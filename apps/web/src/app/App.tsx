/**
 * ==============================================================================
 * Main Application Shell & Role-Aware Navigation
 *
 * Traceability:
 *   - FR-08: Renders navigation options tailored to user role (Citizen vs. Personnel)
 *   - ASR-06: Clean user experience separating citizen reporting from staff dashboard
 * ==============================================================================
 */

import { useState, useEffect } from "react";
import { ReportForm } from "../features/reports/ReportForm";
import { StatusLookup } from "../features/reports/StatusLookup";
import { StaffDashboard } from "../features/workflow/StaffDashboard";
import { AuthPage } from "../features/auth/AuthPage";
import { apiRequest } from "../shared/api/client";
import "./App.css";

export function App() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"submit" | "track" | "staff">("submit");

  // Restore session from token on initial page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      apiRequest<any>("/auth/me")
        .then((u) => setUser(u))
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h2>CivicConnect Portal</h2>
        {user ? (
          <div>
            <span>{user.email} (<strong>{user.role}</strong>)</span>
            <button className="link-btn" style={{ marginLeft: "12px" }} onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <span>Welcome, please sign in</span>
        )}
      </header>

      {!user ? (
        <AuthPage onLogin={(u) => setUser(u)} />
      ) : (
        <>
          {/* Navigation tabs conditioned on user authentication and role (FR-08) */}
          <nav className="nav-tabs">
            <button className={tab === "submit" ? "active" : ""} onClick={() => setTab("submit")}>
              Report Issue
            </button>
            <button className={tab === "track" ? "active" : ""} onClick={() => setTab("track")}>
              Track Status
            </button>
            {(user.role === "PERSONNEL" || user.role === "ADMIN") && (
              <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>
                Personnel Dashboard
              </button>
            )}
          </nav>

          <main style={{ marginTop: "20px" }}>
            {tab === "submit" && <ReportForm />}
            {tab === "track" && <StatusLookup />}
            {tab === "staff" && <StaffDashboard />}
          </main>
        </>
      )}
    </div>
  );
}