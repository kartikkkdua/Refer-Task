import React, { useState } from "react";
import { updateProfile } from "../api";

export default function Profile({ user, setUser, setMsg }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    company: user.company || "",
    phone: user.phone || "",
    avatar: user.avatar || ""
  });

  async function handleSave(e) {
    e.preventDefault();
    const res = await updateProfile(user.id, form);
    
    if (res.error) {
      setMsg(res.error);
    } else {
      setUser({ ...user, ...res });
      setEditing(false);
      setMsg("Profile updated successfully!");
    }
  }

  return (
    <div className="card profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="avatar-placeholder">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <span className={`status-badge ${user.status}`}>{user.status}</span>
        </div>
      </div>

      {!editing ? (
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Company:</span>
            <span className="detail-value">{user.company || "Not specified"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone:</span>
            <span className="detail-value">{user.phone || "Not specified"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Referral Code:</span>
            <span className="detail-value code">{user.referralCode}</span>
          </div>
          <button className="edit-btn" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="profile-form">
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Company Name"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
          />
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Avatar URL"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
          />
          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
