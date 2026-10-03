import React, { useState } from "react";
import { MapPin, User, Clock, Phone, FileSpreadsheet, Edit3, Trash2 } from "lucide-react";
import FilterBar from "./FilterBar";
import { exportLeadsToExcel } from "../utils/excelExport";
import AddLeadModal from "./AddLeadModal";
import { deleteLeadApi } from "../services/apiService";

export default function FollowUpsView({ leads, onCallLead, onLeadUpdated, onLeadDeleted, showToast }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [bhkFilter, setBhkFilter] = useState("All BHK Types");
  const [orderFilter, setOrderFilter] = useState("Freshest First");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [editingLead, setEditingLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Leads that have been called or marked for follow-up (excluding CLOSED and NOT_INTERESTED)
  const followUpLeads = React.useMemo(() => {
    return leads.filter(l => 
      (l.status === "FOLLOWUP_TODAY" || l.status === "FOLLOWUP" || l.status === "OVERDUE" || (l.callCount && l.callCount > 0)) &&
      l.status !== "CLOSED" &&
      l.status !== "NOT_INTERESTED"
    );
  }, [leads]);

  const filtered = followUpLeads.filter(lead => {
    if (priorityFilter !== "ALL" && lead.priority !== priorityFilter) return false;
    if (serviceFilter !== "All Services" && lead.service !== serviceFilter) return false;
    if (bhkFilter !== "All BHK Types" && lead.bhkType !== bhkFilter) return false;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const matchName = (lead.name || lead.lead_name || "").toLowerCase().includes(q);
      const matchId = (lead.id || "").toLowerCase().includes(q);
      const matchLoc = (lead.location || "").toLowerCase().includes(q);
      const matchBhk = lead.bhkType ? lead.bhkType.toLowerCase().includes(q) : false;
      if (!matchName && !matchId && !matchLoc && !matchBhk) return false;
    }
    return true;
  });

  const handleSaveLead = (savedLead) => {
    if (onLeadUpdated) onLeadUpdated(savedLead);
    if (showToast) showToast(`✅ Follow-up lead '${savedLead.name}' updated successfully!`);
    setEditingLead(null);
  };

  const executeDelete = async () => {
    if (!leadToDelete) return;
    const targetId = leadToDelete.id;
    const targetName = leadToDelete.name;
    setLeadToDelete(null);
    await deleteLeadApi(targetId);
    if (onLeadDeleted) {
      onLeadDeleted(targetId);
    }
    if (showToast) showToast(`🗑️ Lead '${targetName}' deleted successfully!`);
  };

  return (
    <div className="view-container">
      {/* Edit Lead Modal */}
      {editingLead && (
        <AddLeadModal
          isOpen={!!editingLead}
          initialData={editingLead}
          onClose={() => setEditingLead(null)}
          existingLeads={leads}
          onLeadCreated={handleSaveLead}
        />
      )}

      {/* Delete Confirmation Modal */}
      {leadToDelete && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "1rem",
            width: "100%",
            maxWidth: "360px",
            padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🗑️</div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              Delete Follow-up Lead?
            </h3>
            <p style={{ fontSize: "0.84375rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.4 }}>
              Are you sure you want to delete '{leadToDelete.name}' ({leadToDelete.id}) from the database?
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setLeadToDelete(null)}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  borderRadius: "0.5rem",
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                style={{
                  flex: 1,
                  padding: "0.65rem",
                  borderRadius: "0.5rem",
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="view-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <div>
          <h1 className="view-title">
            <span style={{ color: "#2563eb" }}>📞</span> Follow-ups Today
          </h1>
          <p className="view-subtitle">{filtered.length} leads requiring callback or follow-up discussion</p>
        </div>

        <button
          onClick={() => exportLeadsToExcel(filtered, "Followups_Report")}
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "#ffffff",
            border: "none",
            padding: "0.5rem 0.85rem",
            borderRadius: "0.5rem",
            fontSize: "0.8125rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
            transition: "all 0.2s ease"
          }}
          title="Export currently filtered follow-up leads to Excel / CSV"
        >
          <FileSpreadsheet size={15} /> Export Excel ({filtered.length})
        </button>
      </div>

      {/* Modern Filter Toolbar */}
      <FilterBar
        dateFilter={dateFilter} setDateFilter={setDateFilter}
        serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
        bhkFilter={bhkFilter} setBhkFilter={setBhkFilter}
        orderFilter={orderFilter} setOrderFilter={setOrderFilter}
        search={search} setSearch={setSearch}
        showPriorityPills={true}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
      />

      {/* Cards List */}
      <div className="lead-cards-list">
        {filtered.map((lead) => (
          <div className="lead-card" key={lead.id} style={{ position: "relative" }}>
            <div className="lead-card-left" style={{ flex: 1 }}>
              <div className="lead-header-row" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                <span className={`tag-badge ${lead.priority?.toLowerCase() || "hot"}`}>{lead.priority || "HOT"}</span>
                <span className="tag-badge service" style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                  🏢 {lead.bhkType || "2 BHK"}
                </span>
                <span className="tag-badge service">{lead.service}</span>
              </div>
              
              <div className="lead-customer-name" style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0.35rem 0 0.25rem" }}>
                {lead.lead_name || lead.name || "Real Estate Client"}
              </div>

              <div className="lead-details-row" style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", fontSize: "0.78125rem", color: "#64748b" }}>
                <span className="detail-item" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <MapPin size={13} color="#94a3b8" /> {lead.location}
                </span>
                <span className="detail-item" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <User size={13} color="#94a3b8" /> {lead.source}
                </span>
                <span className="detail-item" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Clock size={13} color="#94a3b8" /> {lead.timeAgo}
                </span>
              </div>
              
              {lead.notes && (
                <div style={{ fontSize: "0.75rem", color: "#475569", background: "#f8fafc", padding: "0.35rem 0.5rem", borderRadius: "0.375rem", marginTop: "0.4rem" }}>
                  📝 Note: {lead.notes}
                </div>
              )}
            </div>

            <div className="lead-card-right" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <div className="call-count-badge">
                <span className="call-count-number">{lead.callCount}</span>
                <span className="call-count-label">Calls</span>
              </div>

              {/* Edit Lead Button */}
              <button
                type="button"
                onClick={() => setEditingLead(lead)}
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#2563eb",
                  width: "32px",
                  height: "32px",
                  borderRadius: "0.45rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease"
                }}
                title="Edit Lead Details"
              >
                <Edit3 size={15} />
              </button>

              {/* Delete Lead Button */}
              <button
                type="button"
                onClick={() => setLeadToDelete(lead)}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  width: "32px",
                  height: "32px",
                  borderRadius: "0.45rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease"
                }}
                title="Delete Lead"
              >
                <Trash2 size={15} />
              </button>

              {/* Call Button */}
              <button
                className="call-btn-green"
                onClick={() => onCallLead(lead)}
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.8125rem" }}
              >
                <Phone size={15} />
                <span>Call</span>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
            No follow-ups match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
