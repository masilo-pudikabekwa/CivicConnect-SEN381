import React, { useState } from "react";
import { apiRequest } from "../../shared/api/client";

export function AuthPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        const res = await apiRequest<{ token: string; user: any }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem("token", res.token);
        onLogin(res.user);
      } else {
        await apiRequest("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password, name })
        });
        setIsLogin(true);
        alert("Registration complete! You can now log in.");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h3>{isLogin ? "Sign In" : "Register Citizen Account (FR-07)"}</h3>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password (Min 8 characters, 1 uppercase, 1 number)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">{isLogin ? "Sign In" : "Register"}</button>
      </form>
      <button className="link-btn" onClick={() => setIsLogin(!isLogin)} style={{ marginTop: "12px" }}>
        {isLogin ? "Need an account? Register" : "Already registered? Sign In"}
      </button>
    </div>
  );
}