import React, { useState } from "react";
import { Phone, Users, Flame, Calendar, TrendingUp, ArrowRight, Award, CheckCircle, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";
import FilterBar from "./FilterBar";

export default function PerformanceView({ metrics, userProfile, onStartCalling, onClaimLeads, onOpenColdDialer, leads = [], onCallLead }) {
  const [dateFilter, setDateFilter] = useState("This Month");
  const [orderFilter, setOrderFilter] = useState("Calls Made");
  const [priorityFilter, setPriorityFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [leadFlag, setLeadFlag] = useState(true);
  const [activeMetricFilter, setActiveMetricFilter] = useState("Qualified Leads");

  const greetingName = userProfile?.name ? userProfile.name.split(" ")[0] : "Shyam";

  // Dynamic Lead Metric Calculations based on live CRM state
  const qualifiedLeads = leads.filter(l => l.priority === "HOT" || l.status === "CLOSED" || (l.history && l.history.some(h => (h.outcome || '').includes("Interested") || (h.outcome || '').includes("Hot") || (h.outcome || '').includes("Closed"))));
  const myVisitsLeads = leads.filter(l => l.service === "Site Visit Booking" || (l.history && l.history.some(h => (h.outcome || '').includes("Visit"))));
  const leadsClaimed = leads.filter(l => l.assigned_to || (l.callCount && l.callCount > 0) || (l.history && l.history.length > 0));
  const siteVisitLeads = leads.filter(l => l.service === "Site Visit Booking" || (l.history && l.history.some(h => (h.outcome || '').includes("Visit"))));
  const meetingLeads = leads.filter(l => l.status === "FOLLOWUP_TODAY" || (l.history && l.history.some(h => (h.outcome || '').includes("Meeting"))));
  const videoCallLeads = leads.filter(l => (l.notes || "").toLowerCase().includes("video") || (l.notes || "").toLowerCase().includes("virtual") || l.service === "Home Buying");
  const threeMinCallLeads = leads.filter(l => (l.callCount && l.callCount >= 2) || l.priority === "HOT");

  // Dynamic Metric Totals
  const totalCallsCount = leads.reduce((sum, l) => sum + (l.callCount || (l.history?.length || 0)), 0);
  const displayCallsCount = metrics?.mtdCallsMade !== undefined ? metrics.mtdCallsMade : totalCallsCount;

  const followupsDoneCount = leads.filter(l => l.status === "FOLLOWUP_TODAY" || l.status === "FOLLOWUP" || l.callbackTime || (l.history && l.history.some(h => (h.outcome || '').includes("Follow") || (h.outcome || '').includes("Call Back")))).length;
  const displayFollowups = metrics?.followupsDone !== undefined ? metrics.followupsDone : followupsDoneCount;

  const displayHotLeads = metrics?.hotLeadsPassed !== undefined ? metrics.hotLeadsPassed : qualifiedLeads.length;
  const displayVisits = metrics?.visitsBooked !== undefined ? metrics.visitsBooked : siteVisitLeads.length;

  const closedDeals = leads.filter(l => l.status === "CLOSED" || (l.history && l.history.some(h => (h.outcome || '').includes("Closed") || (h.outcome || '').includes("Won"))));
  const closedCount = metrics?.conversionsCount !== undefined ? metrics.conversionsCount : closedDeals.length;
  const conversionAmountStr = metrics?.conversionsAmount || `₹${closedCount * 30}K`;

  const metricCategories = [
    { id: "My Visits", title: "My Visits", count: metrics?.myVisitsCount ?? myVisitsLeads.length, icon: "🚗", color: "#2563eb", bg: "#eff6ff", leads: myVisitsLeads },
    { id: "Qualified Leads", title: "Qualified Leads", count: metrics?.qualifiedLeadsCount ?? qualifiedLeads.length, icon: "🔥", color: "#dc2626", bg: "#fef2f2", leads: qualifiedLeads },
    { id: "Leads Claimed", title: "Leads Claimed", count: metrics?.leadsClaimedCount ?? leadsClaimed.length, icon: "🎯", color: "#16a34a", bg: "#f0fdf4", leads: leadsClaimed },
    { id: "Unique Leads Created", title: "Unique Leads Created", count: metrics?.uniqueLeadsCount ?? leads.length, icon: "✨", color: "#9333ea", bg: "#faf5ff", leads: leads },
    { id: "Site Visit Schedule", title: "Site Visit Schedule", count: metrics?.siteVisitScheduleCount ?? siteVisitLeads.length, icon: "📅", color: "#ea580c", bg: "#fff7ed", leads: siteVisitLeads },
    { id: "Meeting Schedule", title: "Meeting Schedule", count: metrics?.meetingScheduleCount ?? meetingLeads.length, icon: "🤝", color: "#0284c7", bg: "#f0f9ff", leads: meetingLeads },
    { id: "Video Call Schedule", title: "Video Call Schedule", count: metrics?.videoCallScheduleCount ?? videoCallLeads.length, icon: "🎥", color: "#4f46e5", bg: "#eef2ff", leads: videoCallLeads },
    { id: "My Team", title: "My Team", count: metrics?.myTeamCount ?? (metrics?.teamMembers?.length || 6), icon: "👥", color: "#0891b2", bg: "#ecfeff", leads: [] },
    { id: "Three Minute Calls", title: "Three Minute Calls", count: metrics?.threeMinCallsCount ?? threeMinCallLeads.length, icon: "⏱️", color: "#d97706", bg: "#fffbeb", leads: threeMinCallLeads }
  ];

  const activeCategoryObj = metricCategories.find(c => c.id === activeMetricFilter) || metricCategories[1];
  let activeDisplayLeads = (activeCategoryObj.leads || []).filter(l => {
    if (priorityFilter && l.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (l.name || l.lead_name || "").toLowerCase().includes(q);
      const matchPhone = (l.phone || "").includes(q);
      const matchLoc = (l.location || "").toLowerCase().includes(q);
      const matchBhk = (l.bhkType || l.bhk_type || "").toLowerCase().includes(q);
      const matchNotes = (l.notes || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchLoc || matchBhk || matchNotes;
    }
    return true;
  });

  return (
    <div className="view-container">
      {/* Unclaimed Fresh Leads Header Card */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem 1rem", marginBottom: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0f172a" }}>
            Unclaimed Fresh Leads ({metrics?.unclaimedCount ?? 5})
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Lead Flag is {leadFlag ? "On" : "Off"}</span>
            <input type="checkbox" checked={leadFlag} onChange={() => setLeadFlag(!leadFlag)} style={{ cursor: "pointer" }} />
          </div>
        </div>
        <button 
          onClick={onClaimLeads} 
          style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.45rem 0.85rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          Claim Leads Now &gt;&gt;
        </button>
      </div>

      {/* Reward Points Card */}
      <div className="reward-card-photo-exact">
        <div className="reward-top-row">
          <span className="reward-card-title">Reward Points</span>
          <div className="reward-coin-badge">
            <span className="coin-emoji">🪙</span>
            <span className="coin-value">{metrics?.rewardPoints ?? 2400}</span>
          </div>
        </div>

        <div className="reward-used-row">
          <div className="used-label">Used Points</div>
          <div className="used-val-row">
            <span className="coin-emoji-small">🪙</span>
            <span className="used-num">{metrics?.usedPoints ?? 0}</span>
          </div>
        </div>

        <div className="reward-bottom-action" onClick={onClaimLeads}>
          <span className="claim-text">Claim Leads Now.</span>
          <span className="arrow-text">&gt;&gt;</span>
        </div>
      </div>

      {/* Training Modules Card */}
      <div className="training-module-card">
        <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.4rem" }}>
          Training Modules ({metrics?.trainingCount ?? 1})
        </div>
        <div className="training-badge-bar">
          <Calendar size={18} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.78125rem", fontWeight: "700" }}>
              {metrics?.trainingTitle || "SY Circle - Cross-Referral Program"}
            </div>
            <div style={{ fontSize: "0.6875rem", opacity: 0.9 }}>
              Due Date : {metrics?.trainingDueDate || "30 Jun 2026"}
            </div>
          </div>
          <span style={{ fontSize: "0.6875rem", fontWeight: "700", background: "rgba(255,255,255,0.2)", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
            Completed
          </span>
        </div>
      </div>

      {/* Verify Banner */}
      <div className="verify-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div className="verify-badge-icon">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#1e293b" }}>
              Unverified Meetings ({metrics?.unverifiedCount ?? 1})
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Lead Id: {metrics?.unverifiedLeadId || "4230005"} | {metrics?.unverifiedLeadName || "Pravin Ladkat"}
            </div>
          </div>
        </div>
        <button className="verify-action-btn">
          Verify
        </button>
      </div>

      <div className="view-header">
        <h1 className="view-title">
          Good afternoon, {greetingName}! 👋
        </h1>
        <p className="view-subtitle">Click any performance card to filter lead details</p>
      </div>

      {/* 9 Interactive Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.65rem", marginBottom: "1.25rem" }}>
        {metricCategories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setActiveMetricFilter(cat.id)}
            style={{
              background: activeMetricFilter === cat.id ? cat.bg : "#ffffff",
              border: activeMetricFilter === cat.id ? `2px solid ${cat.color}` : "1px solid #cbd5e1",
              borderRadius: "0.875rem",
              padding: "0.75rem 0.6rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: activeMetricFilter === cat.id ? `0 4px 14px ${cat.color}25` : "0 2px 5px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1.125rem" }}>{cat.icon}</span>
              <span style={{ fontSize: "1.125rem", fontWeight: 800, color: cat.color }}>{cat.count}</span>
            </div>
            <div style={{ fontSize: "0.71875rem", fontWeight: 700, color: "#1e293b", marginTop: "0.4rem", lineHeight: "1.2" }}>
              {cat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Filtered Drilldown Leads List */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "1rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a" }}>
            {activeCategoryObj.icon} {activeCategoryObj.title} ({activeDisplayLeads.length})
          </h3>
          <span style={{ fontSize: "0.71875rem", color: activeCategoryObj.color, fontWeight: 700, background: activeCategoryObj.bg, padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
            Active Filter
          </span>
        </div>

        {activeCategoryObj.id === "My Team" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {(metrics?.teamMembers || [
              { name: "Priya Sharma", role: "Sales Manager", calls: "48 Calls Today", status: "Active" },
              { name: "Rajesh Kumar", role: "Senior Telecaller", calls: "62 Calls Today", status: "Active" },
              { name: "Sunil Kapoor", role: "Telecaller", calls: "35 Calls Today", status: "Active" },
              { name: "Shyam Pandey", role: "Sales Executive", calls: "54 Calls Today", status: "Active" }
            ]).map((t, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.75rem", background: "#f8fafc", borderRadius: "0.6rem", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>👤 {t.name}</div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>{t.role} • {t.calls}</div>
                </div>
                <span style={{ fontSize: "0.6875rem", color: "#16a34a", fontWeight: 700, background: "#dcfce7", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>{t.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {activeDisplayLeads.slice(0, 5).map(lead => (
              <div key={lead.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.75rem", background: "#f8fafc", borderRadius: "0.6rem", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: "0.84375rem", fontWeight: 700, color: "#0f172a" }}>{lead.name || lead.lead_name}</div>
                  <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>
                    📍 {lead.location} • 🏢 {lead.bhkType || lead.bhk_type || "2 BHK"} • 📞 {lead.phone}
                  </div>
                </div>
                <button
                  onClick={() => onCallLead && onCallLead(lead)}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    padding: "0.35rem 0.65rem",
                    borderRadius: "0.4rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <Phone size={13} /> Call
                </button>
              </div>
            ))}

            {activeDisplayLeads.length === 0 && (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "#64748b", fontSize: "0.8125rem" }}>
                No leads currently match this performance category.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Filter Toolbar */}
      <FilterBar
        dateFilter={dateFilter} setDateFilter={setDateFilter}
        orderFilter={orderFilter} setOrderFilter={setOrderFilter}
        search={search} setSearch={setSearch}
        showPriorityPills={true}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
      />

      {/* Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">MTD Calls Made</span>
            <Phone size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{displayCallsCount}</div>
          <div className="metric-trend">
            <TrendingUp size={14} /> +{metrics?.callsMomPercent || "16.4"}% MOM
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Follow-ups Done</span>
            <Users size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{displayFollowups}</div>
          <div className="metric-trend">
            <TrendingUp size={14} /> +{metrics?.followupsMomPercent || "10.5"}% MOM
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Hot Leads Passed</span>
            <Flame size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{displayHotLeads}</div>
          <div className="metric-trend">
            <TrendingUp size={14} /> +{metrics?.hotLeadsMomPercent || "28.5"}% MOM
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Visits Booked</span>
            <Calendar size={16} className="metric-icon" />
          </div>
          <div className="metric-value">{displayVisits}</div>
          <div className="metric-trend">
            <TrendingUp size={14} /> +{metrics?.visitsMomPercent || "33.3"}% MOM
          </div>
        </div>

        <div className="metric-card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", gridColumn: "span 2" }}>
          <div className="metric-card-top">
            <span className="metric-title" style={{ color: "#15803d" }}>Conversions</span>
            <TrendingUp size={18} style={{ color: "#16a34a" }} />
          </div>
          <div className="metric-value" style={{ color: "#15803d" }}>{conversionAmountStr}</div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, marginTop: "0.4rem" }}>
            {closedCount} deals closed | +{metrics?.conversionsMomPercent || "40"}% MOM
          </div>
        </div>
      </div>

      {/* Target Progress & MoM Chart Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title-row">
            <span className="chart-title">🌀 Monthly Call Target</span>
            <span className="chart-target-value">{displayCallsCount} / {metrics?.mtdCallsTarget || 80}</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.round((displayCallsCount / (metrics?.mtdCallsTarget || 80)) * 100))}%` }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>{Math.round((displayCallsCount / (metrics?.mtdCallsTarget || 80)) * 100)}% Achieved</span>
            <span>Projected: 100%</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title-row">
            <span className="chart-title">📊 Month-over-Month Comparison</span>
            <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem", fontWeight: 600 }}>
              <span style={{ color: "#2563eb" }}>■ This Month</span>
              <span style={{ color: "#94a3b8" }}>■ Last Month</span>
            </div>
          </div>

          <div className="mom-bar-chart">
            <div className="bar-group">
              <div className="bars-pair">
                <div className="bar this-month" style={{ height: `${Math.min(120, Math.max(30, displayCallsCount * 0.6))}px` }} title={`Calls: ${displayCallsCount}`}></div>
                <div className="bar last-month" style={{ height: "90px" }} title="Last Month: 120"></div>
              </div>
              <span className="bar-label">Calls</span>
            </div>

            <div className="bar-group">
              <div className="bars-pair">
                <div className="bar this-month" style={{ height: `${Math.min(120, Math.max(20, displayHotLeads * 3))}px` }} title={`Hot Leads: ${displayHotLeads}`}></div>
                <div className="bar last-month" style={{ height: "30px" }} title="Last Month: 14"></div>
              </div>
              <span className="bar-label">Hot Leads</span>
            </div>

            <div className="bar-group">
              <div className="bars-pair">
                <div className="bar this-month" style={{ height: `${Math.min(120, Math.max(20, displayVisits * 4))}px` }} title={`Visits: ${displayVisits}`}></div>
                <div className="bar last-month" style={{ height: "25px" }} title="Last Month: 9"></div>
              </div>
              <span className="bar-label">Visits</span>
            </div>

            <div className="bar-group">
              <div className="bars-pair">
                <div className="bar this-month" style={{ height: `${Math.min(120, Math.max(20, closedCount * 6))}px` }} title={`Conversions: ${closedCount}`}></div>
                <div className="bar last-month" style={{ height: "15px" }} title="Last Month: 5"></div>
              </div>
              <span className="bar-label">Conversions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Button Grid */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button className="start-calling-btn" style={{ flex: 1 }} onClick={onStartCalling}>
          <Phone size={18} />
          <span>Start Calling</span>
        </button>
        <button className="start-calling-btn" style={{ flex: 1, background: "linear-gradient(135deg, #059669, #10b981)" }} onClick={onOpenColdDialer}>
          <Sparkles size={18} />
          <span>Cold Meeting</span>
        </button>
      </div>
    </div>
  );
}
