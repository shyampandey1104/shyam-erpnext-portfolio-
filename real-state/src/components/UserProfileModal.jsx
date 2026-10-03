import React from "react";
import { User, Mail, Phone, ShieldCheck, Award, LogOut, X, CheckCircle } from "lucide-react";

export default function UserProfileModal({ userProfile, onClose, onLogout }) {
  if (!userProfile) return null;

  const empIdText = userProfile.employee_id || (userProfile.id && typeof userProfile.id === 'string' ? userProfile.id : `EMP-${(userProfile.email || 'USER').split('@')[0].toUpperCase()}`);
  const closedCount = userProfile.closed_deals || 0;
  const callsMade = userProfile.calls_made || 156;
  const targetPct = userProfile.target_achieved || (closedCount > 0 ? 100 : 92);

  const badgeTitle = userProfile.badge_title || (closedCount > 0 ? "🏆 Top Closed Deals Leader" : "🔥 Active Sales Telecaller");
  const metricText = userProfile.metric_text || (closedCount > 0 
    ? `${closedCount} Closed Deals • ${callsMade} Calls Made • ${targetPct}% Target` 
    : `${callsMade} Calls Logged • ${targetPct}% Target Achieved`);

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        borderRadius: "inherit",
        paddingTop: "2.75rem",
        paddingBottom: "1rem"
      }}
    >
      <div 
        className="dialer-modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: "380px",
          width: "92%",
          background: "#ffffff",
          borderRadius: "1.5rem",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          animation: "scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Profile Modal Header */}
        <div className="dialer-header" style={{ background: "linear-gradient(135deg, #0284c7, #2563eb)", padding: "1rem 1.25rem" }}>
          <div className="dialer-caller-info">
            <span className="dialer-caller-name" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ffffff", fontSize: "1rem", fontWeight: 800 }}>
              <User size={18} /> Employee Profile
            </span>
            <span className="dialer-caller-sub" style={{ color: "#bfdbfe", fontSize: "0.6875rem" }}>LeadCall CRM Sales Portal</span>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#ffffff", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="dialer-body" style={{ padding: "1.25rem", gap: "1rem", display: "flex", flexDirection: "column" }}>
          {/* Company Brand Logo Hero */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <img 
              src="/dreamhomes_gold_logo.jpg" 
              alt="Dream Homes Gold Logo" 
              style={{ 
                width: "68px", 
                height: "68px", 
                objectFit: "contain",
                filter: "drop-shadow(0 3px 8px rgba(217, 119, 6, 0.25))",
                flexShrink: 0
              }} 
            />

            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.2, margin: 0 }}>
                {userProfile.name}
              </h2>
              <span style={{
                display: "inline-block",
                background: "#dbeafe",
                color: "#2563eb",
                fontSize: "0.72rem",
                fontWeight: 800,
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
                marginTop: "0.3rem"
              }}>
                {userProfile.role || "Senior Sales Consultant"}
              </span>
            </div>
          </div>

          {/* Details Table from Frappe User DocType */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.875rem", padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: "0.8125rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                <ShieldCheck size={15} color="#2563eb" /> Employee ID / Name:
              </span>
              <strong style={{ color: "#0f172a", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "-0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile.employee_id || userProfile.full_name || userProfile.name || empIdText}
              </strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                <Mail size={15} color="#2563eb" /> Email:
              </span>
              <strong style={{ color: "#0f172a", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {userProfile.email}
              </strong>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                <Phone size={15} color="#2563eb" /> Mobile:
              </span>
              <strong style={{ color: "#0f172a", marginLeft: "auto", fontSize: "0.78125rem", fontWeight: 800 }}>
                {userProfile.mobile_no || userProfile.phone || "9867778229"}
              </strong>
            </div>

            {/* MahaRERA No - Only rendered if exists in User DocType */}
            {userProfile.rera_no && String(userProfile.rera_no).trim() !== "" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
                <span style={{ color: "#b45309", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem", fontWeight: 700 }}>
                  📜 MahaRERA No:
                </span>
                <strong style={{ color: "#b45309", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 800, background: "#fef3c7", padding: "0.1rem 0.4rem", borderRadius: "4px", border: "1px solid #fde68a" }}>
                  {userProfile.rera_no}
                </strong>
              </div>
            )}

            {/* Instagram ID - Only rendered if exists in User DocType */}
            {userProfile.instagram_id && String(userProfile.instagram_id).trim() !== "" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
                <span style={{ color: "#be185d", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                  📸 Instagram:
                </span>
                <strong style={{ color: "#be185d", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>
                  @{String(userProfile.instagram_id).replace(/^@/, '')}
                </strong>
              </div>
            )}

            {/* Facebook ID - Only rendered if exists in User DocType */}
            {userProfile.facebook_id && String(userProfile.facebook_id).trim() !== "" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
                <span style={{ color: "#1d4ed8", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                  👥 Facebook:
                </span>
                <strong style={{ color: "#1d4ed8", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>
                  {userProfile.facebook_id}
                </strong>
              </div>
            )}

            {/* YouTube ID - Only rendered if exists in User DocType */}
            {userProfile.youtube_id && String(userProfile.youtube_id).trim() !== "" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
                <span style={{ color: "#dc2626", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                  ▶️ YouTube:
                </span>
                <strong style={{ color: "#dc2626", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>
                  {userProfile.youtube_id}
                </strong>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.4rem", width: "100%" }}>
              <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, fontSize: "0.78125rem" }}>
                <Award size={15} color="#d97706" /> Department:
              </span>
              <strong style={{ color: "#0f172a", marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700 }}>
                Real Estate Sales & PDI
              </strong>
            </div>
          </div>

          {/* Performance Highlights Badges */}
          <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #bbf7d0", borderRadius: "0.875rem", padding: "0.75rem 0.875rem", display: "flex", alignItems: "center", gap: "0.65rem" }}>
            <Award size={22} color="#16a34a" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#15803d" }}>
                {badgeTitle}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600, marginTop: "0.1rem" }}>
                {metricText}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.65rem", marginTop: "0.25rem" }}>
            <button
              onClick={onLogout}
              style={{
                flex: 1,
                background: "#fef2f2",
                color: "#dc2626",
                border: "1px solid #fecaca",
                padding: "0.65rem",
                borderRadius: "0.625rem",
                fontSize: "0.78125rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem"
              }}
            >
              <LogOut size={15} /> Logout Account
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                padding: "0.65rem",
                borderRadius: "0.625rem",
                fontSize: "0.78125rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
              }}
            >
              <CheckCircle size={15} /> Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
