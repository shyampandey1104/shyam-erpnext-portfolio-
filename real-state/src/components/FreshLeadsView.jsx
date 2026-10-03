import React, { useState } from "react";
import { MapPin, User, Clock, Phone, MessageSquare, FileSpreadsheet, UserPlus, Edit3, Trash2, FileDown, FileUp } from "lucide-react";
import FilterBar from "./FilterBar";
import { exportLeadsToExcel } from "../utils/excelExport";
import AddLeadModal from "./AddLeadModal";
import ImportLeadsModal from "./ImportLeadsModal";
import { deleteLeadApi } from "../services/apiService";
import CustomAlertDialog from "./CustomAlertDialog";

export default function FreshLeadsView({ leads, onCallLead, onSendReport, onLeadCreated, onLeadUpdated, onLeadDeleted, onLeadsImported, showToast }) {
  const [dateFilter, setDateFilter] = useState("Today");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [bhkFilter, setBhkFilter] = useState("All BHK Types");
  const [orderFilter, setOrderFilter] = useState("Freshest First");
  const [search, setSearch] = useState("");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [alertConfig, setAlertConfig] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // Only leads that have NEVER been called (callCount === 0 and status is NEW)
  // Deduplicate by normalized 10-digit phone so duplicate leads never appear in Fresh
  const allFreshLeads = React.useMemo(() => {
    const rawFresh = leads.filter(l => (l.callCount === 0 || !l.callCount) && (l.status === "NEW" || !l.status));
    const seen = new Set();
    const result = [];
    for (const lead of rawFresh) {
      const cleanPhone = (lead.phone || "").replace(/\D/g, "").slice(-10);
      const key = cleanPhone || lead.id || lead.name;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(lead);
    }
    return result;
  }, [leads]);

  const filtered = allFreshLeads.filter(lead => {
    if (sourceFilter !== "All Sources" && lead.source !== sourceFilter) return false;
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
    if (editingLead) {
      if (onLeadUpdated) onLeadUpdated(savedLead);
      if (showToast) showToast(`✅ Lead '${savedLead.name}' updated successfully!`);
    } else {
      if (onLeadCreated) onLeadCreated(savedLead);
      if (showToast) showToast(`🎉 Fresh Lead '${savedLead.name}' created successfully!`);
    }
    setIsAddLeadOpen(false);
    setEditingLead(null);
  };

  const handleImportLeads = (newLeads) => {
    if (onLeadsImported) {
      onLeadsImported(newLeads);
    } else if (onLeadCreated) {
      newLeads.forEach(l => onLeadCreated(l));
    }
    if (showToast) showToast(`📥 Imported ${newLeads.length} leads into CRM Database!`);
  };

  const confirmDelete = (lead) => {
    setLeadToDelete(lead);
    setAlertConfig({
      title: "Delete Lead?",
      message: `Are you sure you want to delete lead '${lead.name}' (${lead.id}) from the database?`,
      type: "warning",
      showConfirm: true
    });
  };

  const executeDelete = async () => {
    if (!leadToDelete) return;
    const targetId = leadToDelete.id;
    const targetName = leadToDelete.name;
    setAlertConfig(null);
    setLeadToDelete(null);
    
    await deleteLeadApi(targetId);
    if (onLeadDeleted) {
      onLeadDeleted(targetId);
    }
    if (showToast) showToast(`🗑️ Lead '${targetName}' deleted successfully!`);
  };

  return (
    <div className="view-container">
      {/* Add / Edit Lead Modal */}
      {(isAddLeadOpen || editingLead) && (
        <AddLeadModal
          isOpen={isAddLeadOpen || !!editingLead}
          initialData={editingLead}
          onClose={() => {
            setIsAddLeadOpen(false);
            setEditingLead(null);
          }}
          existingLeads={leads}
          onLeadCreated={handleSaveLead}
        />
      )}

      {/* Import Leads from Excel Modal */}
      <ImportLeadsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        existingLeads={leads}
        onLeadsImported={handleImportLeads}
      />

      {/* Confirmation & Alert Dialog */}
      {alertConfig && (
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
              {alertConfig.title}
            </h3>
            <p style={{ fontSize: "0.84375rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.4 }}>
              {alertConfig.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { setAlertConfig(null); setLeadToDelete(null); }}
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

      {/* Header Toolbar */}
      <div className="view-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        <div>
          <h1 className="view-title">
            <span style={{ color: "#2563eb" }}>✨</span> Fresh Leads
          </h1>
          <p className="view-subtitle">{filtered.length} leads that have never been contacted</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {/* Create Lead */}
          <button
            onClick={() => { setEditingLead(null); setIsAddLeadOpen(true); }}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.78125rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            <UserPlus size={14} /> + Lead
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setIsImportOpen(true)}
            style={{
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.78125rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              boxShadow: "0 4px 12px rgba(2,132,199,0.3)",
              whiteSpace: "nowrap"
            }}
            title="Import leads from CSV or Excel file"
          >
            <FileUp size={14} /> Import Excel
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportLeadsToExcel(filtered, "Fresh_Leads_Report")}
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.45rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.78125rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
              whiteSpace: "nowrap"
            }}
            title="Export currently filtered fresh leads to Excel / CSV"
          >
            <FileDown size={14} /> Export ({filtered.length})
          </button>
        </div>
      </div>

      {/* Modern Filter Toolbar */}
      <FilterBar
        dateFilter={dateFilter} setDateFilter={setDateFilter}
        sourceFilter={sourceFilter} setSourceFilter={setSourceFilter}
        serviceFilter={serviceFilter} setServiceFilter={setServiceFilter}
        bhkFilter={bhkFilter} setBhkFilter={setBhkFilter}
        orderFilter={orderFilter} setOrderFilter={setOrderFilter}
        search={search} setSearch={setSearch}
      />

      {/* Cards List */}
      <div className="lead-cards-list">
        {filtered.map((lead) => (
          <div className="lead-card" key={lead.id} style={{ position: "relative" }}>
            <div className="lead-card-left" style={{ flex: 1 }}>
              <div className="lead-header-row" style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexWrap: "wrap" }}>
                <span className="tag-badge new">NEW</span>
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
            </div>

            {/* Actions: Edit, Delete, WhatsApp, Call */}
            <div className="lead-card-right" style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              
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
                onClick={() => confirmDelete(lead)}
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

              {/* WhatsApp Button */}
              <button 
                className="send-report-btn" 
                style={{ borderColor: "#22c55e", color: "#15803d", background: "#f0fdf4", padding: "0.4rem 0.65rem", fontSize: "0.78125rem" }} 
                onClick={() => onSendReport(lead)}
                title="Send WhatsApp Summary"
              >
                <MessageSquare size={14} color="#22c55e" />
                <span>WhatsApp</span>
              </button>

              {/* Call Button */}
              <button 
                className="call-now-btn" 
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
            No fresh leads match the selected BHK / Property filters.
          </div>
        )}
      </div>
    </div>
  );
}
