import React, { useEffect, useState } from "react";
import { registerUser, loginUser, applyReferral, getLeaderboard } from "./api";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [view, setView] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "", phone: "" });
  const [user, setUser] = useState(null);
  const [refCode, setRefCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("refer_user");
    if (raw) {
      setUser(JSON.parse(raw));
      setView("dashboard");
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("refer_user", JSON.stringify(user));
      loadLeaderboard();
    } else {
      localStorage.removeItem("refer_user");
    }
  }, [user]);

  async function loadLeaderboard() {
    const res = await getLeaderboard();
    if (!res.error) setLeaderboard(res);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");

    const res = await loginUser({ email: form.email, password: form.password });
    if (res.error) return setMsg(res.error);

    setUser(res);
    setView("dashboard");
    setMsg("Logged in successfully!");
  }

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("");

    const res = await registerUser(form);
    if (res.error) return setMsg(res.error);

    setUser(res);
    setView("dashboard");
    setMsg("Registered successfully!");
  }

  async function handleApply(e) {
    e.preventDefault();
    setMsg("");

    const code = e.target.refCode?.value?.trim().toUpperCase() || refCode.trim().toUpperCase();
    if (!code) return setMsg("Enter a code");
    if (code === user.referralCode) return setMsg("Cannot use your own code");
    if (user.appliedReferral) return setMsg("Already used a referral");

    setLoading(true);
    const res = await applyReferral({ userId: user.id, referralCode: code });
    setLoading(false);

    if (res.error) return setMsg(res.error);

    setUser({ ...user, coins: res.coins, appliedReferral: true, totalEarnings: user.totalEarnings + res.added });
    setMsg(`Success! Added ${res.added} coins. The referrer also got ${res.added} coins!`);
    setRefCode("");
    loadLeaderboard();
  }

  function handleLogout() {
    setUser(null);
    setView("login");
    setLeaderboard([]);
    setForm({ name: "", email: "", password: "", company: "", phone: "" });
    setMsg("Logged out successfully");
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(user.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Refer & Earn</h1>

        <div className="tabs">
          <button 
            className={view === "login" ? "tab active" : "tab"}
            onClick={() => setView("login")}
          >
            Login
          </button>
          <button 
            className={view === "register" ? "tab active" : "tab"}
            onClick={() => setView("register")}
          >
            Register
          </button>
        </div>

        {view === "login" ? (
          <form className="card" onSubmit={handleLogin}>
            <input 
              type="email"
              placeholder="Email" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} 
            />
            <button type="submit">Login</button>
          </form>
        ) : (
          <form className="card" onSubmit={handleRegister}>
            <input 
              placeholder="Full Name" 
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} 
              required
            />
            <input 
              type="email"
              placeholder="Email Address" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required
            />
            <input 
              placeholder="Company Name (Optional)" 
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })} 
            />
            <input 
              placeholder="Phone Number (Optional)" 
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required
            />
            <button type="submit">Create Account</button>
          </form>
        )}

        {msg && <div className="msg">{msg}</div>}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Refer & Earn</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tabs">
        <button 
          className={view === "dashboard" ? "tab active" : "tab"}
          onClick={() => setView("dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={view === "profile" ? "tab active" : "tab"}
          onClick={() => setView("profile")}
        >
          Profile
        </button>
        <button 
          className={view === "leaderboard" ? "tab active" : "tab"}
          onClick={() => setView("leaderboard")}
        >
          Leaderboard
        </button>
        {user.role === "admin" && (
          <button 
            className={view === "admin" ? "tab active" : "tab"}
            onClick={() => setView("admin")}
          >
            Admin
          </button>
        )}
      </div>

      {view === "dashboard" && (
        <Dashboard 
          user={user} 
          onApplyReferral={handleApply}
          onCopyCode={copyToClipboard}
          copied={copied}
        />
      )}

      {view === "profile" && (
        <Profile user={user} setUser={setUser} setMsg={setMsg} />
      )}

      {view === "leaderboard" && (
        <div className="card">
          <h3>Top Earners</h3>
          <div className="leaderboard">
            {leaderboard.map((u, i) => (
              <div key={u._id} className={`leaderboard-item ${u._id === user.id ? "highlight" : ""}`}>
                <span className="rank">#{i + 1}</span>
                <div className="leaderboard-user">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="leaderboard-avatar" />
                  ) : (
                    <div className="leaderboard-avatar-placeholder">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="name">{u.name}</div>
                    {u.company && <div className="company">{u.company}</div>}
                  </div>
                </div>
                <span className="coins">{u.coins} coins</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "admin" && user.role === "admin" && (
        <AdminPanel setMsg={setMsg} />
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}
