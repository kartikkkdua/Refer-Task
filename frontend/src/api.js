const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001/api";

export async function registerUser(data) {
  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_BASE}/login`, {
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

export async function getReferralStats(userId) {
  const res = await fetch(`${API_BASE}/stats/${userId}`);
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard`);
  return res.json();
}

export async function getProfile(userId) {
  const res = await fetch(`${API_BASE}/profile/${userId}`);
  return res.json();
}

export async function updateProfile(userId, data) {
  const res = await fetch(`${API_BASE}/profile/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getTransactions(userId) {
  const res = await fetch(`${API_BASE}/transactions/${userId}`);
  return res.json();
}

export async function getAnalytics(userId) {
  const res = await fetch(`${API_BASE}/analytics/${userId}`);
  return res.json();
}

export async function getAllUsers() {
  const res = await fetch(`${API_BASE}/admin/users`);
  return res.json();
}

export async function updateUserStatus(userId, status) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function getAdminDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`);
  return res.json();
}
