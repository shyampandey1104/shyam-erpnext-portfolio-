import React, { useState } from "react";
import { Users, Shield, TrendingUp, PhoneCall, Award, Database, Search, CheckCircle } from "lucide-react";

export default function AdminManagerView({ userProfile, onSwitchToTelecaller }) {
  const [telecallers, setTelecallers] = useState([
    { id: 1, name: "Rahul Sharma", role: "Senior Telecaller", callsToday: 38, visitsBooked: 4, conversionRate: "28%", status: "On Call", statusColor: "#f97316" },
    { id: 2, name: "Priya Patel", role: "Telecaller", callsToday: 42, visitsBooked: 5, conversionRate: "32%", status: "Online", statusColor: "#16a34a" },
    { id: 3, name: "Amit Verma", role: "Telecaller", callsToday: 29, visitsBooked: 2, conversionRate: "18%", status: "Online", statusColor: "#16a34a" },
    { id: 4, name: "Sneha Reddy", role: "Junior Telecaller", callsToday: 19, visitsBooked: 1, conversionRate: "12%", status: "Offline", statusColor: "#94a3b8" }
  ]);

  const [search, setSearch] = useState("");

  const filteredTeam = telecallers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="view-container">
      {/* Admin Top Header Banner */}
      <div className="view-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="view-title">
            <Shield size={24} color="#2563eb" style={{ marginRight: 6 }} />
            Manager Portal - Hello {userProfile.name}! 👋
          </h1>
          <p className="view-subtitle">Team Performance & Lead Pipeline Control Center</p>
        </div>

        <button
          onClick={onSwitchToTelecaller}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "0.6rem 1.25rem",
            borderRadius: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
          }}
        >
          <PhoneCall size={16} />
          <span>Switch to Calling App View</span>
        </button>
      </div>

      {/* Admin KPI Stat Cards Grid */}
      <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: "1.5rem" }}>
        <div className="metric-card" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderColor: "#93c5fd" }}>
          <div className="metric-card-top">
            <span className="metric-title" style={{ color: "#1d4ed8" }}>Total Team Calls Today</span>
            <PhoneCall size={18} style={{ color: "#2563eb" }} />
          </div>
          <div className="metric-value" style={{ color: "#1e40af" }}>128 Calls</div>
          <div className="metric-trend" style={{ color: "#16a34a" }}>
            <TrendingUp size={14} /> +24% vs yesterday
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Active Telecallers</span>
            <Users size={18} className="metric-icon" />
          </div>
          <div className="metric-value">3 / 4</div>
          <div className="metric-trend" style={{ color: "#16a34a" }}>
            <CheckCircle size={14} /> 75% Active Now
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Total Visits Booked</span>
            <Award size={18} className="metric-icon" />
          </div>
          <div className="metric-value">12 Visits</div>
          <div className="metric-trend" style={{ color: "#16a34a" }}>
            <TrendingUp size={14} /> Target 10 (120%)
          </div>
        </div>

        <div className="metric-card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <div className="metric-card-top">
            <span className="metric-title" style={{ color: "#15803d" }}>Revenue Converted</span>
            <TrendingUp size={18} style={{ color: "#16a34a" }} />
          </div>
          <div className="metric-value" style={{ color: "#15803d" }}>₹890,000</div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, marginTop: "0.4rem" }}>
            14 Closed Deals this month
          </div>
        </div>
      </div>

      {/* Frappe Sync Status Card */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "0.75rem",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Database size={22} color="#16a34a" />
          <div>
            <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>
              CRM Backend REST Service Connected
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Webhooks active for Facebook Ads, Instagram Lead Forms & Website Calls
            </div>
          </div>
        </div>
        <span style={{
          background: "#dcfce7",
          color: "#15803d",
          fontSize: "0.75rem",
          fontWeight: 700,
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px"
        }}>
          ● Live Syncing
        </span>
      </div>

      {/* Telecallers Performance Leaderboard Table */}
      <div className="chart-card" style={{ padding: "1.25rem" }}>
        <div className="chart-title-row" style={{ marginBottom: "1rem" }}>
          <span className="chart-title" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Award size={18} color="#f97316" /> Team Performance Leaderboard
          </span>

          <div className="modern-search-wrapper" style={{ width: "200px" }}>
            <Search size={14} className="modern-search-icon" />
            <input
              type="text"
              className="modern-search-input"
              style={{ padding: "0.35rem 1rem 0.35rem 2rem", fontSize: "0.75rem" }}
              placeholder="Filter agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Agent Name</th>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Role</th>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Calls Today</th>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Visits Booked</th>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Conv. Rate</th>
                <th style={{ padding: "0.625rem", color: "#64748b" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map(agent => (
                <tr key={agent.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 0.625rem", fontWeight: 700, color: "#0f172a" }}>{agent.name}</td>
                  <td style={{ padding: "0.75rem 0.625rem", color: "#64748b" }}>{agent.role}</td>
                  <td style={{ padding: "0.75rem 0.625rem", fontWeight: 700 }}>{agent.callsToday}</td>
                  <td style={{ padding: "0.75rem 0.625rem", fontWeight: 700, color: "#16a34a" }}>{agent.visitsBooked}</td>
                  <td style={{ padding: "0.75rem 0.625rem", fontWeight: 700, color: "#2563eb" }}>{agent.conversionRate}</td>
                  <td style={{ padding: "0.75rem 0.625rem" }}>
                    <span style={{
                      color: agent.statusColor,
                      background: `${agent.statusColor}15`,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.6875rem",
                      fontWeight: 700
                    }}>
                      ● {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
