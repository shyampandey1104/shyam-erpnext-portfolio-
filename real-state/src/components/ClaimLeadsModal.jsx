import React, { useState } from "react";
import { Sparkles, CheckCircle2, ShieldAlert, Award, X, ChevronRight, UserCheck } from "lucide-react";

export default function ClaimLeadsModal({ isOpen, onClose, onConfirmClaim, availablePoints = 2400 }) {
  const [selectedLeads, setSelectedLeads] = useState([1, 2, 3, 4, 5]);

  if (!isOpen) return null;

  const poolLeads = [
    { id: 1, name: "Kiran Bhat (Fresh)", bhk: "2 BHK", location: "Andheri West", points: 50, time: "10 mins ago" },
    { id: 2, name: "Siddharth Malhotra", bhk: "3 BHK", location: "Lokhandwala", points: 50, time: "25 mins ago" },
    { id: 3, name: "Ananya Panday", bhk: "2 BHK", location: "Bandra Sea View", points: 50, time: "1 hour ago" },
    { id: 4, name: "Vikramaditya Roy", bhk: "4 BHK", location: "Worli Sea Face", points: 50, time: "2 hours ago" },
    { id: 5, name: "Radhika Merchant", bhk: "3 BHK Luxury", location: "Thane West", points: 50, time: "3 hours ago" }
  ];

  const totalPointsRequired = selectedLeads.length * 50;

  const toggleLead = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(l => l !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleClaim = () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least 1 lead to claim!");
      return;
    }
    const selectedObjs = poolLeads.filter(l => selectedLeads.includes(l.id));
    onConfirmClaim(selectedObjs, totalPointsRequired);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: "380px", width: "92%", padding: "1.25rem", borderRadius: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#fef9c3", color: "#ca8a04", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              🎁
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>Claim Fresh Leads</h3>
              <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>Assign unallocated leads to your queue</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={16} color="#64748b" />
          </button>
        </div>

        {/* Balance Header */}
        <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", color: "#ffffff", padding: "0.75rem 1rem", borderRadius: "0.75rem", marginBottom: "0.875rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.71875rem", color: "#94a3b8" }}>Available Reward Balance</div>
            <div style={{ fontSize: "1.125rem", fontWeight: "800", color: "#fef08a" }}>🪙 {availablePoints} Points</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.71875rem", color: "#94a3b8" }}>Cost per Lead</div>
            <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#38bdf8" }}>50 Pts / Lead</div>
          </div>
        </div>

        {/* Leads Checklist */}
        <div style={{ fontSize: "0.78125rem", fontWeight: "700", color: "#334155", marginBottom: "0.5rem" }}>
          Select Unclaimed Fresh Leads ({selectedLeads.length} selected):
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
          {poolLeads.map(lead => {
            const isSelected = selectedLeads.includes(lead.id);
            return (
              <div
                key={lead.id}
                onClick={() => toggleLead(lead.id)}
                style={{
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  border: isSelected ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                  borderRadius: "0.625rem",
                  padding: "0.6rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <input type="checkbox" checked={isSelected} onChange={() => {}} style={{ cursor: "pointer" }} />
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#0f172a" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>{lead.bhk} • {lead.location}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#ca8a04" }}>🪙 50 Pts</div>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>{lead.time}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleClaim}
          style={{
            width: "100%",
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "0.75rem",
            borderRadius: "0.625rem",
            fontSize: "0.875rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.4rem",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
          }}
        >
          <Sparkles size={16} />
          <span>Claim {selectedLeads.length} Leads ({totalPointsRequired} Points)</span>
        </button>
      </div>
    </div>
  );
}
