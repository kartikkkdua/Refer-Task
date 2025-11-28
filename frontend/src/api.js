const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/api";

export async function registerUser(data) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function applyReferral(data) {
  const res = await fetch(`${API_BASE}/apply-referral`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}
