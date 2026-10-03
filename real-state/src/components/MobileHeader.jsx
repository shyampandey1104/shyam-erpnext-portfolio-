import React from "react";
import { Phone, Bell, Zap, Menu } from "lucide-react";

export default function MobileHeader({ unreadCount, onDirectCall, onOpenNotifications, userProfile, onOpenProfile, onOpenSidebar, onOpenIntegrations, orgProfile, onSimulateInbound }) {
  const companyName = orgProfile?.company_name || "Dream Homes";
  const userInitials = (userProfile?.name || "Shyam Pandey").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div 
      className="mobile-app-header" 
      style={{ 
        height: "56px", 
        padding: "0 0.85rem", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between",
        background: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
      }}
    >
      {/* Left Branding Group */}
      <div className="mobile-header-left" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        <button 
          onClick={onOpenSidebar} 
          style={{
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            color: "#2563eb",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.35rem",
            borderRadius: "0.5rem",
            flexShrink: 0
          }}
          title="Open Menu"
        >
          <Menu size={18} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} onClick={onOpenProfile}>
          <img
            src={orgProfile?.logo_url || "/assets/real_state_crm/frontend/dreamhomes_gold_logo.jpg"}
            alt="Dream Homes Logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/dreamhomes_gold_logo.jpg";
            }}
            style={{
              width: "32px",
              height: "32px",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 4px rgba(217, 119, 6, 0.25))",
              flexShrink: 0,
              borderRadius: "6px"
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{
              fontWeight: 900,
              fontSize: "0.95rem",
              color: "#0f172a",
              whiteSpace: "nowrap",
              lineHeight: 1.15,
              letterSpacing: "-0.01em"
            }}>
              {companyName}
            </span>
            <span style={{ fontSize: "0.625rem", color: "#16a34a", fontWeight: 800, lineHeight: 1.1, whiteSpace: "nowrap" }}>
              {orgProfile?.company_tagline || "CRM Sales Portal"}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Group */}
      <div className="mobile-header-right" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
        {/* Quick Direct Call Button */}
        <button
          onClick={onDirectCall}
          title="Direct Call Next Lead"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "#ffffff",
            border: "none",
            padding: "0.35rem 0.55rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
          }}
        >
          <Phone size={13} fill="#ffffff" />
          <span>Call</span>
        </button>

        {/* Compact Inbound Test Icon Button */}
        {onSimulateInbound && (
          <button
            onClick={onSimulateInbound}
            title="Simulate Inbound Call from Direct Client"
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#2563eb",
              width: "30px",
              height: "30px",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(37, 99, 235, 0.15)",
              flexShrink: 0
            }}
          >
            <Zap size={15} fill="#2563eb" color="#2563eb" />
          </button>
        )}

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            color: "#475569",
            padding: "0.35rem",
            borderRadius: "0.5rem",
            position: "relative",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Notifications"
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-3px",
              right: "-3px",
              background: "#ef4444",
              color: "#ffffff",
              fontSize: "0.625rem",
              fontWeight: 800,
              width: "15px",
              height: "15px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar Pill */}
        <button
          onClick={onOpenProfile}
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "#ffffff",
            border: "none",
            borderRadius: "9999px",
            width: "30px",
            height: "30px",
            fontSize: "0.75rem",
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)"
          }}
          title="User Profile"
        >
          {userInitials}
        </button>
      </div>
    </div>
  );
}
