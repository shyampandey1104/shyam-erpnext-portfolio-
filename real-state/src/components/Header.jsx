import React, { useState, useEffect } from "react";
import { Phone, Bell, Zap, Download, Smartphone, Monitor, X, CheckCircle, LogOut } from "lucide-react";

export default function Header({
  currentTab, setTab, unreadCount, onSimulateInbound,
  isMobileView, onToggleMobileView, onOpenNotifications,
  userProfile, onLogout, onOpenProfile, onOpenIntegrations, orgProfile
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    } else {
      setShowInstallModal(true);
    }
  };

  const companyName = orgProfile?.company_name || "DreamHome";
  const logoUrl = orgProfile?.logo_url || "/dreamhomes_gold_logo.jpg";

  return (
    <>
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo" style={{ background: "transparent", width: "auto", height: "auto" }}>
            <img src={logoUrl} alt={companyName} style={{ width: "38px", height: "38px", objectFit: "contain", borderRadius: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }} />
          </div>
          <div>
            <span className="brand-title" style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1e293b" }}>{companyName}</span>
            <span style={{ display: "block", fontSize: "0.6875rem", color: "#16a34a", fontWeight: 700 }}>
              {isMobileView ? "📱 MOBILE FRAME ACTIVE" : "REAL ESTATE CRM"}
            </span>
          </div>
        </div>

        {!isMobileView && (
          <nav className="nav-pills">
            <button
              className={`nav-pill ${currentTab === "dashboard" ? "active" : ""}`}
              onClick={() => setTab("dashboard")}
            >
              <span style={{ fontSize: "1.1rem" }}>📊</span> Performance
            </button>
            <button
              className={`nav-pill ${currentTab === "actions" ? "active" : ""}`}
              onClick={() => setTab("actions")}
            >
              <span style={{ fontSize: "1.1rem" }}>⚡</span> Today's Actions
            </button>
            <button
              className={`nav-pill ${currentTab === "fresh" ? "active" : ""}`}
              onClick={() => setTab("fresh")}
            >
              <span style={{ fontSize: "1.1rem" }}>📞</span> Fresh Leads
            </button>
            <button
              className={`nav-pill ${currentTab === "followup" ? "active" : ""}`}
              onClick={() => setTab("followup")}
            >
              <span style={{ fontSize: "1.1rem" }}>📅</span> Follow-ups
            </button>
          </nav>
        )}

        <div className="header-actions">
          <button
            onClick={onOpenIntegrations}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.55rem 0.875rem",
              borderRadius: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
            }}
            title="Configure Website, Instagram, Facebook & YouTube Lead Webhooks"
          >
            <Zap size={15} />
            <span>🔌 Integrations</span>
          </button>

          {/* Mobile Frame Simulator Toggle Button */}
          <button
            onClick={onToggleMobileView}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: isMobileView ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#f1f5f9",
              color: isMobileView ? "#ffffff" : "#0f172a",
              border: isMobileView ? "none" : "1px solid #cbd5e1",
              padding: "0.55rem 0.875rem",
              borderRadius: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="Toggle Laptop Mobile Phone Frame Simulator"
          >
            {isMobileView ? <Monitor size={16} /> : <Smartphone size={16} />}
            <span>{isMobileView ? "Desktop View" : "📱 Mobile Frame"}</span>
          </button>

          <button
            onClick={handleInstallClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "#16a34a",
              color: "#ffffff",
              border: "none",
              padding: "0.58rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)"
            }}
            title="Install App on Phone"
          >
            <Download size={15} />
            <span>Install App</span>
          </button>

          <button className="simulate-lead-btn" onClick={onSimulateInbound}>
            <Zap size={16} />
            <span>Simulate Social Call</span>
          </button>

          <button className="icon-btn-badge" title="Notifications" onClick={onOpenNotifications}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </button>

          <div className="user-profile-chip" onClick={onOpenProfile} style={{ cursor: "pointer" }} title="Click to view Employee Profile & Assigned Areas">
            <div className="avatar-circle">
              {userProfile?.initials || (userProfile?.name ? userProfile.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "SP")}
            </div>
            <div className="user-info">
              <span className="user-name">{userProfile?.name || "Shyam Pandey"}</span>
              <span className="user-role" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                {userProfile?.role || "Telecaller"} • <strong style={{ color: "#2563eb" }}>📍 {userProfile?.areas ? userProfile.areas.join(", ") : "Andheri, Bandra"}</strong>
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                padding: "0.2rem",
                marginLeft: "0.2rem"
              }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Styled Mobile App Installation Instructions Modal */}
      {showInstallModal && (
        <div className="modal-overlay">
          <div className="dialer-modal-content" style={{ maxWidth: "390px", width: "94%" }}>
            <div className="dialer-header" style={{ background: "linear-gradient(135deg, #0284c7, #2563eb)" }}>
              <div className="dialer-caller-info">
                <span className="dialer-caller-name" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Smartphone size={20} /> Install Mobile App
                </span>
                <span className="dialer-caller-sub">Add LeadCall CRM to your phone home screen</span>
              </div>
              <button
                onClick={() => setShowInstallModal(false)}
                style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="dialer-body" style={{ padding: "1.5rem", gap: "1rem" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1rem", borderRadius: "0.5rem" }}>
                <h4 style={{ color: "#15803d", fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  📱 For Android Phones:
                </h4>
                <ol style={{ fontSize: "0.875rem", color: "#334155", paddingLeft: "1.25rem", lineHeight: "1.6" }}>
                  <li>Open <strong>Chrome</strong> on your phone.</li>
                  <li>Tap the browser menu <strong>(⋮)</strong> at top-right.</li>
                  <li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
                </ol>
              </div>

              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem", borderRadius: "0.5rem" }}>
                <h4 style={{ color: "#1d4ed8", fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  🍎 For iPhones (iOS):
                </h4>
                <ol style={{ fontSize: "0.875rem", color: "#334155", paddingLeft: "1.25rem", lineHeight: "1.6" }}>
                  <li>Open <strong>Safari</strong> on your iPhone.</li>
                  <li>Tap the <strong>Share</strong> button at bottom.</li>
                  <li>Scroll & tap <strong>"Add to Home Screen"</strong>.</li>
                </ol>
              </div>
            </div>

            <div className="dialer-footer">
              <button
                className="save-call-btn"
                onClick={() => setShowInstallModal(false)}
                style={{ width: "100%", background: "#2563eb", justifyContent: "center" }}
              >
                <CheckCircle size={16} style={{ marginRight: 6 }} />
                <span>Got It!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
