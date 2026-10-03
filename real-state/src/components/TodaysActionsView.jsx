import React, { useState } from "react";
import { 
  Calendar, Phone, Users, Clock, AlertCircle, FileText, Heart, 
  MapPin, PhoneCall, PhoneMissed, Sparkles, BookOpen, Layers,
  ChevronRight, Award, CheckCircle2, UserCheck, Shield
} from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";

export default function TodaysActionsView({ leads, onSelectAction, onOpenColdDialer }) {
  const overdueCount = leads.filter(l => l.status === "OVERDUE").length || 78;
  const todaysCount = leads.filter(l => l.status === "FOLLOWUP_TODAY").length || 18;
  const [alertConfig, setAlertConfig] = useState(null);

  return (
    <div className="view-container" style={{ paddingBottom: "5rem", position: "relative" }}>
      {/* Referral Banner Matching Photo 2 */}
      <div className="referral-banner-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>Refer & Earn Now</div>
            <div style={{ fontSize: "0.9375rem", fontWeight: "800", color: "#ffffff", marginTop: "0.15rem" }}>
              Earn up to ₹10,000 on every successful closure
            </div>
            <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>*T&C apply</div>
          </div>
          <button 
            style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" }}
            onClick={() => setAlertConfig({ title: "Referral Link Copied! 📋", message: "Unique Referral Link copied to clipboard. Share with clients to earn rewards!", type: "success" })}
          >
            Refer Lead
          </button>
        </div>

        <div className="referral-tag-row">
          <span className="ref-brand-chip">■ square yards</span>
          <span className="ref-brand-chip">■ urban money</span>
          <span className="ref-brand-chip">■ INTERIOR COMPANY</span>
          <span className="ref-brand-chip">■ azuro</span>
        </div>
      </div>

      {/* 1. Interactions Section (2x4 Grid matching Photo 2) */}
      <div className="app-grid-section">
        <div className="grid-section-title">Interactions</div>
        <div className="icon-grid-4">
          {/* Upcoming */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <Calendar size={20} />
              <span className="grid-icon-badge">{todaysCount}</span>
            </div>
            <span className="grid-card-label">Upcoming</span>
          </div>

          {/* Missed */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#fef2f2", color: "#ef4444" }}>
              <PhoneMissed size={20} />
              <span className="grid-icon-badge">{overdueCount}</span>
            </div>
            <span className="grid-card-label">Missed</span>
          </div>

          {/* Overall */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Calendar size={20} />
            </div>
            <span className="grid-card-label">Overall</span>
          </div>

          {/* Notes */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#fef9c3", color: "#ca8a04" }}>
              <FileText size={20} />
            </div>
            <span className="grid-card-label">Notes</span>
          </div>

          {/* Pending Followups */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#e0f2fe", color: "#0284c7" }}>
              <Users size={20} />
            </div>
            <span className="grid-card-label">Pending Followups</span>
          </div>

          {/* Weak Followups */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#fae8ff", color: "#c084fc" }}>
              <Users size={20} />
            </div>
            <span className="grid-card-label">Weak Followups</span>
          </div>

          {/* Prime Site Visits */}
          <div className="grid-icon-card" onClick={() => onSelectAction("activities")}>
            <div className="grid-icon-box" style={{ background: "#ffedd5", color: "#ea580c" }}>
              <MapPin size={20} />
            </div>
            <span className="grid-card-label">Prime Site Visits</span>
          </div>

          {/* Favourite Leads */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#fff1f2", color: "#e11d48" }}>
              <Heart size={20} fill="#e11d48" />
            </div>
            <span className="grid-card-label">Favourite Leads</span>
          </div>
        </div>
      </div>

      {/* 2. Leads Section (1x3 Grid matching Photo 2) */}
      <div className="app-grid-section">
        <div className="grid-section-title">Leads</div>
        <div className="icon-grid-3">
          <div className="grid-icon-card" onClick={() => onSelectAction("fresh")}>
            <div className="grid-icon-box" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <Users size={20} />
            </div>
            <span className="grid-card-label">My Leads</span>
          </div>

          <div className="grid-icon-card" onClick={() => onSelectAction("activities")}>
            <div className="grid-icon-box" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <UserCheck size={20} />
            </div>
            <span className="grid-card-label">My RSVP's</span>
          </div>

          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#e0f2fe", color: "#0284c7" }}>
              <PhoneCall size={20} />
            </div>
            <span className="grid-card-label">Lead Call Logs</span>
          </div>
        </div>
      </div>

      {/* 3. Calling Section (2x2 Grid matching Photo 2) */}
      <div className="app-grid-section">
        <div className="grid-section-title">Calling</div>
        <div className="icon-grid-4">
          {/* Cold Call */}
          <div className="grid-icon-card" onClick={onOpenColdDialer}>
            <div className="grid-icon-box" style={{ background: "#dcfce7", color: "#15803d" }}>
              <PhoneCall size={20} />
            </div>
            <span className="grid-card-label">Cold Call</span>
          </div>

          {/* Cold Meeting */}
          <div className="grid-icon-card" onClick={onOpenColdDialer}>
            <div className="grid-icon-box" style={{ background: "#fef9c3", color: "#a16207" }}>
              <Users size={20} />
            </div>
            <span className="grid-card-label">Cold Meeting</span>
          </div>

          {/* Call Data */}
          <div className="grid-icon-card" onClick={() => onSelectAction("fresh")}>
            <div className="grid-icon-box" style={{ background: "#e0f2fe", color: "#0369a1" }}>
              <BookOpen size={20} />
            </div>
            <span className="grid-card-label">Call Data</span>
          </div>

          {/* Call Logs */}
          <div className="grid-icon-card" onClick={() => onSelectAction("followup")}>
            <div className="grid-icon-box" style={{ background: "#f1f5f9", color: "#475569" }}>
              <Layers size={20} />
            </div>
            <span className="grid-card-label">Call Logs</span>
          </div>
        </div>
      </div>

      {alertConfig && (
        <CustomAlertDialog
          isOpen={!!alertConfig}
          onClose={() => setAlertConfig(null)}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
        />
      )}
    </div>
  );
}
