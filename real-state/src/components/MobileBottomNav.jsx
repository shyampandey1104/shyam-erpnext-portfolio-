import React from "react";
import { BarChart3, PhoneCall, Calendar, Building2, Zap } from "lucide-react";

export default function MobileBottomNav({ currentTab, setTab }) {
  return (
    <nav className="mobile-bottom-nav">
      <button
        className={`mobile-nav-item ${currentTab === "dashboard" ? "active" : ""}`}
        onClick={() => setTab("dashboard")}
      >
        <BarChart3 size={19} />
        <span>Performance</span>
      </button>

      <button
        className={`mobile-nav-item ${currentTab === "fresh" ? "active" : ""}`}
        onClick={() => setTab("fresh")}
      >
        <PhoneCall size={19} />
        <span>Fresh Leads</span>
      </button>

      <button
        className={`mobile-nav-item ${currentTab === "followup" ? "active" : ""}`}
        onClick={() => setTab("followup")}
      >
        <Calendar size={19} />
        <span>Follow-ups</span>
      </button>

      <button
        className={`mobile-nav-item ${currentTab === "properties" ? "active" : ""}`}
        onClick={() => setTab("properties")}
      >
        <Building2 size={19} />
        <span>Properties</span>
      </button>

      <button
        className={`mobile-nav-item ${currentTab === "activities" ? "active" : ""}`}
        onClick={() => setTab("activities")}
      >
        <Zap size={19} />
        <span>Activities</span>
      </button>
    </nav>
  );
}
