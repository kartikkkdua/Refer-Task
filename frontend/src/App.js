import React, { useEffect, useState } from "react";
import { registerUser, applyReferral } from "./api";

export default function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [user, setUser] = useState(null);
  const [refCode, setRefCode] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("refer_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("refer_user", JSON.stringify(user));
    else localStorage.removeItem("refer_user");
  }, [user]);

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("");

    const res = await registerUser(form);
    if (res.error) return setMsg(res.error);

    setUser({
      id: res.id,
      name: res.name,
      email: res.email,
      referralCode: res.referralCode,
      coins: res.coins,
      appliedReferral: false
    });
    setMsg("Registered successfully!");
  }

  async function handleApply(e) {
    e.preventDefault();
    setMsg("");

    if (!user) return setMsg("Register first");
    const code = refCode.trim().toUpperCase();
    if (!code) return setMsg("Enter a code");
    if (code === user.referralCode) return setMsg("Cannot use your own code");
    if (user.appliedReferral) return setMsg("Already used a referral");

    setLoading(true);
    const res = await applyReferral({ userId: user.id, referralCode: code });
    setLoading(false);

    if (res.error) return setMsg(res.error);

    setUser({ ...user, coins: res.coins, appliedReferral: true });
    setMsg(`Success! Added ${res.added} coins.`);
  }

  return (
    <div className="container">
      <h1>Refer & Earn</h1>

      {!user ? (
        <form className="card" onSubmit={handleRegister}>
          <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
          <button type="submit">Register</button>
        </form>
      ) : (
        <>
          <div className="card">
            <p>Your referral code:</p>
            <h3>{user.referralCode}</h3>
          </div>

          <form className="card" onSubmit={handleApply}>
            <input
              placeholder="Enter referral code"
              value={refCode}
              onChange={e => setRefCode(e.target.value)}
            />
            <button type="submit" disabled={loading || user.appliedReferral}>
              {loading ? "Applying..." : "Apply"}
            </button>
          </form>

          <div className="card">
            <p>Coins: {user.coins}</p>
          </div>
        </>
      )}

      {msg && <div className="msg">{msg}</div>}
    </div>
  );
}
