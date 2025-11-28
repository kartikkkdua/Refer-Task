import React, { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus, getAdminDashboard } from "../api";

export default function AdminPanel({ setMsg }) {
  const [users, setUsers] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [usersData, dashboardData] = await Promise.all([
      getAllUsers(),
      getAdminDashboard()
    ]);

    if (!usersData.error) setUsers(usersData);
    if (!dashboardData.error) setDashboard(dashboardData);
  }

  async function handleStatusChange(userId, newStatus) {
    const res = await updateUserStatus(userId, newStatus);
    if (res.error) {
      setMsg(res.error);
    } else {
      setMsg(`User status updated to ${newStatus}`);
      loadData();
    }
  }

  const filteredUsers = users.filter(u => 
    filter === "all" || u.status === filter
  );

  return (
    <>
      {dashboard && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-text">Total</div>
            <div className="stat-content">
              <div className="stat-value">{dashboard.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-text">Active</div>
            <div className="stat-content">
              <div className="stat-value">{dashboard.activeUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-text">Coins</div>
            <div className="stat-content">
              <div className="stat-value">{dashboard.totalCoinsDistributed}</div>
              <div className="stat-label">Coins Distributed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-text">Txns</div>
            <div className="stat-content">
              <div className="stat-value">{dashboard.totalTransactions}</div>
              <div className="stat-label">Transactions</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="admin-header">
          <h3>User Management</h3>
          <div className="filter-tabs">
            <button 
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All ({users.length})
            </button>
            <button 
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button 
              className={filter === "inactive" ? "active" : ""}
              onClick={() => setFilter("inactive")}
            >
              Inactive
            </button>
            <button 
              className={filter === "suspended" ? "active" : ""}
              onClick={() => setFilter("suspended")}
            >
              Suspended
            </button>
          </div>
        </div>

        <div className="user-table">
          {filteredUsers.map(user => (
            <div key={user._id} className="user-row">
              <div className="user-info">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder-small">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                  {user.company && <div className="user-company">{user.company}</div>}
                </div>
              </div>

              <div className="user-stats">
                <span className="user-stat">
                  <strong>{user.referralCount}</strong> referrals
                </span>
                <span className="user-stat">
                  <strong>{user.totalEarnings}</strong> earned
                </span>
              </div>

              <div className="user-actions">
                <select
                  value={user.status}
                  onChange={(e) => handleStatusChange(user._id, e.target.value)}
                  className={`status-select ${user.status}`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {dashboard?.topEarners && (
        <div className="card">
          <h3>Top Earners</h3>
          <div className="top-earners">
            {dashboard.topEarners.map((user, i) => (
              <div key={user._id} className="earner-item">
                <span className="earner-rank">#{i + 1}</span>
                <div className="earner-info">
                  <div className="earner-name">{user.name}</div>
                  <div className="earner-email">{user.email}</div>
                </div>
                <div className="earner-stats">
                  <div>{user.totalEarnings} coins</div>
                  <div className="earner-referrals">{user.referralCount} referrals</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
