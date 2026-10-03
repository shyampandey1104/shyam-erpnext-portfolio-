import React from "react";
import { 
  X, User, Share2, Clock, MapPin, Sparkles, FileText, List, 
  PlusCircle, Megaphone, Settings, ChevronRight, ShieldCheck, HelpCircle, Bot, Calculator, Smartphone, PhoneIncoming, Zap
} from "lucide-react";

export default function SidebarDrawer({ 
  isOpen, 
  onClose, 
  currentUser, 
  onNavigate, 
  onOpenProfile,
  onOpenAttendance,
  onOpenBusinessCard,
  onOpenTCF,
  onOpenMCF,
  onOpenGpt,
  onOpenLocation,
  onOpenStories,
  onOpenCalculator,
  onOpenInstallApp,
  onSimulateInbound
}) {
  if (!isOpen) return null;

  return (
    <div className="sidebar-drawer-overlay" onClick={onClose}>
      <div className="sidebar-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Luxury User Profile Header */}
        <div 
          onClick={() => { onClose(); onOpenProfile(); }}
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            color: "#ffffff",
            padding: "1.1rem 1rem",
            paddingTop: "2.75rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            position: "relative",
            cursor: "pointer"
          }}
        >
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
            flexShrink: 0
          }}>
            <User size={22} color="#ffffff" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "1rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.01em" }}>
              {currentUser?.name || "Shyam Pandey"}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#facc15", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.1rem" }}>
              👑 Senior Sales Consultant
            </div>
            <div style={{ fontSize: "0.725rem", color: "#94a3b8", fontWeight: "600", marginTop: "0.15rem" }}>
              {currentUser?.mobile_no || currentUser?.phone || "9867778229"}
            </div>
          </div>

          <ChevronRight size={18} color="#94a3b8" style={{ marginLeft: "auto" }} />

          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            style={{ 
              position: "absolute", 
              top: "2.5rem", 
              right: "12px", 
              background: "rgba(255, 255, 255, 0.15)", 
              border: "none", 
              color: "#cbd5e1", 
              cursor: "pointer",
              borderRadius: "50%",
              padding: "0.3rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Menu Items List */}
        <div className="sidebar-menu-list">
          {/* Featured ChatGPT AI Assistant Button */}
          <button
            className="sidebar-menu-item"
            onClick={() => { onClose(); if (onOpenGpt) onOpenGpt(); }}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              borderRadius: "0.625rem",
              margin: "0.25rem 0 0.5rem 0",
              fontWeight: 700
            }}
          >
            <Bot size={18} color="#ffffff" className="sidebar-menu-icon" />
            <span>ChatGPT AI Copilot</span>
            <span style={{ marginLeft: "auto", fontSize: "0.65rem", background: "rgba(255,255,255,0.25)", color: "#ffffff", padding: "0.15rem 0.45rem", borderRadius: "9999px", fontWeight: 800 }}>
              AI 4.0
            </span>
          </button>
          <button className="sidebar-menu-item" onClick={() => { onClose(); if (onOpenGpt) onOpenGpt(); }}>
            <HelpCircle className="sidebar-menu-icon" />
            Take a Tour
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onOpenBusinessCard(); }}>
            <Share2 className="sidebar-menu-icon" />
            Share Business Card
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onOpenAttendance(); }}>
            <Clock className="sidebar-menu-icon" />
            Work Attendance
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#16a34a", fontWeight: "700" }}>● Present</span>
          </button>

          {onSimulateInbound && (
            <button 
              className="sidebar-menu-item" 
              onClick={() => { onClose(); onSimulateInbound(); }}
              style={{ background: "#eff6ff", color: "#1d4ed8", fontWeight: 700 }}
            >
              <PhoneIncoming className="sidebar-menu-icon" style={{ color: "#2563eb" }} />
              Test Incoming Direct Call
              <span className="sidebar-badge" style={{ background: "#2563eb" }}>LIVE</span>
            </button>
          )}

          <button className="sidebar-menu-item" onClick={() => { onClose(); if (onOpenLocation) onOpenLocation(); else onNavigate("meeting-location"); }}>
            <MapPin className="sidebar-menu-icon" />
            Meeting Location & Live Radar
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); if (onOpenStories) onOpenStories(); else onNavigate("stories"); }}>
            <Sparkles className="sidebar-menu-icon" />
            Stories & Highlights
            <span className="sidebar-badge">NEW</span>
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); if (onOpenCalculator) onOpenCalculator(); else onNavigate("calculator"); }}>
            <Calculator className="sidebar-menu-icon" style={{ color: "#d97706" }} />
            Real Estate Calculator (EMI/ROI)
            <span className="sidebar-badge" style={{ background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" }}>PRO</span>
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); if (onOpenInstallApp) onOpenInstallApp(); }}>
            <Smartphone className="sidebar-menu-icon" style={{ color: "#16a34a" }} />
            Install App on Phone (iOS/Android)
            <span className="sidebar-badge" style={{ background: "#16a34a" }}>INSTALL</span>
          </button>

          <div style={{ height: "1px", background: "#f1f5f9", margin: "0.4rem 0" }} />

          <button className="sidebar-menu-item" onClick={() => { onClose(); onOpenTCF(); }}>
            <PlusCircle className="sidebar-menu-icon" />
            Add TCF (Call Feedback)
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onNavigate("tcf-list"); }}>
            <FileText className="sidebar-menu-icon" />
            TCF List
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onOpenMCF(); }}>
            <PlusCircle className="sidebar-menu-icon" />
            Add MCF (Meeting Feedback)
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onNavigate("mcf-list"); }}>
            <List className="sidebar-menu-icon" />
            MCF List
          </button>

          <div style={{ height: "1px", background: "#f1f5f9", margin: "0.4rem 0" }} />

          <button className="sidebar-menu-item" onClick={() => { onClose(); onNavigate("announcements"); }}>
            <Megaphone className="sidebar-menu-icon" />
            Announcements
            <span className="sidebar-badge" style={{ background: "#2563eb" }}>3</span>
          </button>

          <button className="sidebar-menu-item" onClick={() => { onClose(); onNavigate("settings"); }}>
            <Settings className="sidebar-menu-icon" />
            Settings
          </button>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <ShieldCheck size={14} color="#16a34a" />
            <span>Dream Homes CRM Secure</span>
          </div>
          <span style={{ fontWeight: "700", color: "#64748b" }}>v3.6.2</span>
        </div>
      </div>
    </div>
  );
}
