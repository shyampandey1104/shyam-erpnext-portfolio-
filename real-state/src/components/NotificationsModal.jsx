import React, { useState } from "react";
import { Bell, X, PhoneCall, MessageSquare, CheckCheck, Trash2, Clock, Sparkles, PhoneIncoming, Calendar, Car, Flame } from "lucide-react";

export default function NotificationsModal({ notifications = [], onClose, onCallLead, onWhatsAppLead, onClearAll, onMarkRead }) {
  const [filterCategory, setFilterCategory] = useState("all"); // "all" | "inbound" | "followup" | "visit"
  const notifsList = Array.isArray(notifications) ? notifications : [];

  const formatNotifTime = (timeStr) => {
    if (!timeStr) return "Scheduled";
    if (typeof timeStr === "string" && timeStr.includes("T") && (timeStr.endsWith("Z") || timeStr.includes("+"))) {
      try {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        }
      } catch (e) {}
    }
    return timeStr;
  };

  const inboundCount = notifsList.filter(n => n.type === "inbound" || n.source?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("call")).length;
  const followupCount = notifsList.filter(n => n.type === "followup" || n.source?.toLowerCase().includes("followup")).length;
  const visitCount = notifsList.filter(n => n.type === "visit" || n.source?.toLowerCase().includes("visit")).length;

  const filteredNotifs = notifsList.filter(n => {
    if (filterCategory === "all") return true;
    if (filterCategory === "inbound") return n.type === "inbound" || n.source?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("call");
    if (filterCategory === "followup") return n.type === "followup" || n.source?.toLowerCase().includes("followup");
    if (filterCategory === "visit") return n.type === "visit" || n.source?.toLowerCase().includes("visit");
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="dialer-modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: "390px", width: "94%" }}
      >
        {/* Header */}
        <div className="dialer-header" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
          <div className="dialer-caller-info">
            <span className="dialer-caller-name" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={18} color="#38bdf8" /> Live Lead Notifications
            </span>
            <span className="dialer-caller-sub">
              {notifications.filter(n => !n.read).length} unread • {notifications.length} total alerts
            </span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Category Tabs */}
        <div style={{ display: "flex", gap: "0.35rem", padding: "0.5rem 0.75rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "all", label: `All (${notifications.length})` },
            { id: "inbound", label: `📞 Inbound Calls (${inboundCount})`, highlight: inboundCount > 0 },
            { id: "followup", label: `⏰ Follow-ups (${followupCount})` },
            { id: "visit", label: `🚗 Visits (${visitCount})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterCategory(t.id)}
              style={{
                background: filterCategory === t.id ? (t.highlight ? "#16a34a" : "#2563eb") : "#ffffff",
                color: filterCategory === t.id ? "#ffffff" : (t.highlight ? "#15803d" : "#64748b"),
                border: filterCategory === t.id ? "none" : (t.highlight ? "1px solid #86efac" : "1px solid #e2e8f0"),
                padding: "0.3rem 0.65rem",
                borderRadius: "9999px",
                fontSize: "0.71875rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="dialer-body" style={{ padding: "0.75rem", maxHeight: "420px", overflowY: "auto" }}>
          {filteredNotifs.map((n) => {
            const isVisit = n.type === "visit" || n.title?.toLowerCase().includes("visit");
            const isFollowup = n.type === "followup" || n.title?.toLowerCase().includes("follow") || n.source?.toLowerCase().includes("disposition");
            const isInbound = n.type === "inbound" || n.source?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("call");

            let badgeBg = "#eff6ff";
            let badgeColor = "#2563eb";
            let badgeIcon = <Calendar size={12} />;

            if (isVisit) {
              badgeBg = "#fef3c7";
              badgeColor = "#b45309";
              badgeIcon = <Car size={12} />;
            } else if (isFollowup) {
              badgeBg = "#fef2f2";
              badgeColor = "#dc2626";
              badgeIcon = <Clock size={12} />;
            } else if (isInbound) {
              badgeBg = "#ecfdf5";
              badgeColor = "#059669";
              badgeIcon = <Flame size={12} />;
            }

            return (
              <div
                key={n.id}
                style={{
                  background: n.read ? "#f8fafc" : "#ffffff",
                  border: n.read ? "1px solid #e2e8f0" : "1.5px solid #3b82f6",
                  borderRadius: "0.875rem",
                  padding: "0.875rem",
                  marginBottom: "0.625rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                  boxShadow: n.read ? "none" : "0 4px 12px rgba(37,99,235,0.08)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: badgeColor,
                    background: badgeBg,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    {badgeIcon} {n.source || "Scheduled Disposition"}
                  </span>
                  <span style={{ fontSize: "0.71875rem", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <Clock size={11} /> {formatNotifTime(n.timeAgo)}
                  </span>
                </div>

                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>
                  {n.title}
                </div>

                <div style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: "1.35" }}>
                  {n.message}
                </div>

                {/* Lead Contact Badges if Lead Object Exists */}
                {n.lead && (
                  <div style={{ fontSize: "0.71875rem", color: "#64748b", background: "#f1f5f9", padding: "0.35rem 0.5rem", borderRadius: "0.35rem", display: "flex", justifyContent: "space-between" }}>
                    <span>📞 {n.lead.phone}</span>
                    <span>📍 {n.lead.bhkType || "Property"} • {n.lead.location || "Mumbai"}</span>
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
                  {/* Call Now Button */}
                  {n.lead && (
                    <button
                      onClick={() => {
                        if (onMarkRead) onMarkRead(n.id);
                        if (onCallLead) onCallLead(n.lead);
                        onClose();
                      }}
                      style={{
                        flex: 1,
                        background: "#16a34a",
                        color: "#ffffff",
                        border: "none",
                        padding: "0.45rem 0.6rem",
                        borderRadius: "0.4rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <PhoneCall size={13} />
                      <span>Call Now</span>
                    </button>
                  )}

                  {/* WhatsApp Action Button */}
                  {n.lead && (
                    <button
                      onClick={() => {
                        if (onMarkRead) onMarkRead(n.id);
                        if (onWhatsAppLead) onWhatsAppLead(n.lead);
                        else {
                          const text = encodeURIComponent(`Hello ${n.lead.name}, regarding our scheduled follow-up on ${n.lead.bhkType || "property"} in ${n.lead.location}...`);
                          window.open(`https://api.whatsapp.com/send?phone=${n.lead.phone.replace(/[^0-9]/g, "")}&text=${text}`, '_blank');
                        }
                        onClose();
                      }}
                      style={{
                        flex: 1,
                        background: "#25d366",
                        color: "#ffffff",
                        border: "none",
                        padding: "0.45rem 0.6rem",
                        borderRadius: "0.4rem",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.3rem"
                      }}
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp</span>
                    </button>
                  )}

                  {/* Mark Read Checkmark Button */}
                  {!n.read && (
                    <button
                      onClick={() => onMarkRead && onMarkRead(n.id)}
                      title="Mark as Read"
                      style={{
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        padding: "0.45rem 0.65rem",
                        borderRadius: "0.4rem",
                        fontSize: "0.75rem",
                        cursor: "pointer"
                      }}
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#64748b" }}>
              <Bell size={28} color="#94a3b8" style={{ margin: "0 auto 0.5rem" }} />
              <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#334155" }}>No Scheduled Alerts</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                When you schedule follow-ups, site visits, or callback dispositions, reminders will appear here automatically!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="dialer-footer">
          <button
            onClick={onClearAll}
            style={{
              background: "#fee2e2",
              color: "#ef4444",
              border: "1px solid #fca5a5",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>

          <button
            onClick={onClose}
            className="save-call-btn"
            style={{ background: "#2563eb", padding: "0.5rem 1.25rem" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
