import React, { useEffect, useState } from "react";
import { getReferralStats, getAnalytics, getTransactions } from "../api";

export default function Dashboard({ user, onApplyReferral, onCopyCode, copied }) {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    
    const [statsData, analyticsData, transactionsData] = await Promise.all([
      getReferralStats(user.id),
      getAnalytics(user.id),
      getTransactions(user.id)
    ]);

    if (!statsData.error) setStats(statsData);
    if (!analyticsData.error) setAnalytics(analyticsData);
    if (!transactionsData.error) setTransactions(transactionsData);
  }

  return (
    <>
      <div className="stats-grid full-width">
        <div className="stat-card">
          <div className="stat-icon-text">Users</div>
          <div className="stat-content">
            <div className="stat-value">{user.referralCount || 0}</div>
            <div className="stat-label">Total Referrals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-text">Coins</div>
          <div className="stat-content">
            <div className="stat-value">{user.totalEarnings || 0}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-text">Balance</div>
          <div className="stat-content">
            <div className="stat-value">{user.coins}</div>
            <div className="stat-label">Current Balance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-text">Avg</div>
          <div className="stat-content">
            <div className="stat-value">
              {analytics?.averagePerReferral || 0}
            </div>
            <div className="stat-label">Avg per Referral</div>
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="card">
          <h3>Your Referral Code</h3>
          <div className="referral-code-box">
            <h2>{user.referralCode}</h2>
            <button className="copy-btn" onClick={onCopyCode}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="referral-hint">Share this code with your network to earn rewards!</p>
        </div>

        <div className="card">
          <h3>Apply Referral Code</h3>
          <form onSubmit={onApplyReferral}>
            <input
              name="refCode"
              placeholder="Enter referral code"
              disabled={user.appliedReferral}
            />
            <button type="submit" disabled={user.appliedReferral}>
              {user.appliedReferral ? "Already Applied" : "Apply Code"}
            </button>
          </form>
        </div>

        {analytics?.topReferrals && analytics.topReferrals.length > 0 && (
          <div className="card">
            <h3>Top Referrals</h3>
            <div className="referral-list">
              {analytics.topReferrals.map((ref, i) => (
                <div key={i} className="referral-item">
                  <div className="referral-info">
                    <span className="referral-name">{ref.name}</span>
                    <span className="referral-date">
                      {new Date(ref.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="referral-coins">{ref.coins} coins</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {transactions.length > 0 && (
          <div className="card">
            <h3>Recent Transactions</h3>
            <div className="transaction-list">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx._id} className="transaction-item">
                  <div className="transaction-info">
                    <span className="transaction-type">
                      <span className={`tx-badge ${tx.type === "referral_earned" ? "earned" : "applied"}`}>
                        {tx.type === "referral_earned" ? "Earned" : "Applied"}
                      </span>
                      {tx.description}
                    </span>
                    <span className="transaction-date">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`transaction-amount ${tx.type === "referral_earned" ? "positive" : ""}`}>
                    +{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
