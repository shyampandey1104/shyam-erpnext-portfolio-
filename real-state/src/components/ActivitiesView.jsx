import React, { useState, useEffect } from "react";
import { 
  Calendar, CheckCircle2, Users, Award, Video, Clock, 
  MapPin, ChevronRight, UserCheck, Star, ShieldCheck, Zap,
  FileCheck, UserPlus, Play, PhoneCall, Filter, ExternalLink,
  FileUp, Download, Trash2, FileText, Eye, Edit3, Search, Plus, Sparkles
} from "lucide-react";
import { 
  fetchSiteVisitsApi, saveSiteVisitApi, deleteSiteVisitApi,
  fetchQualifiedLeadsApi, saveQualifiedLeadApi, deleteQualifiedLeadApi,
  fetchClaimedLeadsApi, saveClaimedLeadApi, deleteClaimedLeadApi,
  fetchUniqueLeadsApi, saveUniqueLeadApi, deleteUniqueLeadApi,
  fetchSiteVisitSchedulesApi, saveSiteVisitScheduleApi, deleteSiteVisitScheduleApi,
  fetchMeetingSchedulesApi, saveMeetingScheduleApi, deleteMeetingScheduleApi,
  fetchVideoCallSchedulesApi, saveVideoCallScheduleApi, deleteVideoCallScheduleApi,
  fetchTeamMembersApi, saveTeamMemberApi, deleteTeamMemberApi,
  fetchSpeedCallsApi, saveSpeedCallApi, deleteSpeedCallApi,
  fetchActivityDocumentsApi, saveActivityDocumentApi, deleteActivityDocumentApi
} from "../services/apiService";
import DocUploadModal from "./DocUploadModal";
import DocumentViewerModal from "./DocumentViewerModal";
import EditRecordModal from "./EditRecordModal";
import CustomAlertDialog from "./CustomAlertDialog";

export default function ActivitiesView({ showToast }) {
  const [selectedTab, setSelectedTab] = useState("My Visits");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingType, setEditingType] = useState("");
  const [alertConfig, setAlertConfig] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);

  // Quick Add Item Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newExtra, setNewExtra] = useState("");

  // States for each category
  const [visitsData, setVisitsData] = useState([]);
  const [qualifiedLeadsData, setQualifiedLeadsData] = useState([]);
  const [claimedLeadsData, setClaimedLeadsData] = useState([]);
  const [uniqueLeadsData, setUniqueLeadsData] = useState([]);
  const [siteVisitScheduleData, setSiteVisitScheduleData] = useState([]);
  const [meetingScheduleData, setMeetingScheduleData] = useState([]);
  const [videoCallScheduleData, setVideoCallScheduleData] = useState([]);
  const [teamMembersData, setTeamMembersData] = useState([]);
  const [threeMinCallsData, setThreeMinCallsData] = useState([]);
  const [uploadedActivityDocs, setUploadedActivityDocs] = useState([]);

  // Load from backend on mount
  useEffect(() => {
    loadAllActivitiesData();
  }, []);

  const loadAllActivitiesData = async () => {
    try {
      const [
        visits, qLeads, cLeads, uLeads, 
        svSchedules, meetings, vCalls, 
        team, speedCalls, actDocs
      ] = await Promise.all([
        fetchSiteVisitsApi(),
        fetchQualifiedLeadsApi(),
        fetchClaimedLeadsApi(),
        fetchUniqueLeadsApi(),
        fetchSiteVisitSchedulesApi(),
        fetchMeetingSchedulesApi(),
        fetchVideoCallSchedulesApi(),
        fetchTeamMembersApi(),
        fetchSpeedCallsApi(),
        fetchActivityDocumentsApi()
      ]);

      if (Array.isArray(visits)) setVisitsData(visits);
      if (Array.isArray(qLeads)) setQualifiedLeadsData(qLeads);
      if (Array.isArray(cLeads)) setClaimedLeadsData(cLeads);
      if (Array.isArray(uLeads)) setUniqueLeadsData(uLeads);
      if (Array.isArray(svSchedules)) setSiteVisitScheduleData(svSchedules);
      if (Array.isArray(meetings)) setMeetingScheduleData(meetings);
      if (Array.isArray(vCalls)) setVideoCallScheduleData(vCalls);
      if (Array.isArray(team)) setTeamMembersData(team);
      if (Array.isArray(speedCalls)) setThreeMinCallsData(speedCalls);
      if (Array.isArray(actDocs)) setUploadedActivityDocs(actDocs);
    } catch (e) {
      console.log("[ActivitiesView Data Load Error]", e);
    }
  };

  const handleDocumentUploaded = async (newDoc) => {
    const updated = [newDoc, ...uploadedActivityDocs];
    setUploadedActivityDocs(updated);
    try {
      await saveActivityDocumentApi({
        name_doc: newDoc.name || newDoc.document_name,
        category: newDoc.category,
        file_type: newDoc.fileType || newDoc.file_type || "PDF",
        file_size: newDoc.size || newDoc.file_size || "1.5 MB",
        upload_date: newDoc.date || newDoc.upload_date,
        file_url: newDoc.file_url || newDoc.dataUrl,
        data_url: newDoc.dataUrl
      });
    } catch (e) {}
    if (showToast) showToast(`📁 Document '${newDoc.name}' saved to CRM Database!`);
  };

  const handleStartVisit = (clientName) => {
    setAlertConfig({
      title: "Site Visit Event Started! 🚗",
      message: `Starting GPS Site Visit Navigation & Logging for ${clientName}...`,
      type: "info"
    });
    if (showToast) showToast(`🚗 Site Visit started for ${clientName}!`);
  };

  // Quick Add Item Handler
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!newClient && !newTitle) {
      setAlertConfig({ title: "Required", message: "Please fill in client / item name", type: "warning" });
      return;
    }

    if (selectedTab === "My Visits") {
      const payload = {
        title: newTitle || `Site Visit: ${newLocation || "Mumbai"}`,
        client: newClient,
        phone: newPhone || "+91 98200...",
        location: newLocation || "Mumbai",
        date: "Today, 4:00 PM",
        status: "Confirmed"
      };
      const res = await saveSiteVisitApi(payload);
      setVisitsData(prev => [{ name: res?.visit_id, ...payload }, ...prev]);
    } else if (selectedTab === "Qualified Leads") {
      const payload = {
        name_client: newClient || newTitle,
        score: "94% Hot Match",
        budget: newExtra || "₹ 2.50 Cr",
        bhk: "3 BHK",
        location: newLocation || "Andheri West",
        interest: newTitle || "Luxury Apartment",
        phone: newPhone
      };
      const res = await saveQualifiedLeadApi(payload);
      setQualifiedLeadsData(prev => [{ name: res?.ql_id, ...payload }, ...prev]);
    } else if (selectedTab === "Site Visit Schedule") {
      const payload = {
        client: newClient,
        project: newTitle || "Kalpataru Vian",
        slot: newExtra || "Tomorrow, 3:00 PM",
        cab: newLocation || "Cab Assigned",
        status: "Confirmed"
      };
      const res = await saveSiteVisitScheduleApi(payload);
      setSiteVisitScheduleData(prev => [{ name: res?.sch_id, ...payload }, ...prev]);
    } else if (selectedTab === "Meeting Schedule") {
      const payload = {
        client: newClient,
        venue: newLocation || "BKC Sales Office",
        agenda: newTitle || "Price & Booking Discussion",
        time: newExtra || "Tomorrow, 4:00 PM",
        status: "Scheduled"
      };
      const res = await saveMeetingScheduleApi(payload);
      setMeetingScheduleData(prev => [{ name: res?.mtg_id, ...payload }, ...prev]);
    } else if (selectedTab === "Video Call Schedule") {
      const payload = {
        client: newClient,
        project: newTitle || "3D Virtual Tour",
        platform: "Zoom HD Tour",
        link: newExtra || "https://zoom.us/j/9820591823",
        time: "Today, 6:00 PM",
        status: "Scheduled"
      };
      const res = await saveVideoCallScheduleApi(payload);
      setVideoCallScheduleData(prev => [{ name: res?.vcs_id, ...payload }, ...prev]);
    } else if (selectedTab === "Three Minute Calls") {
      const payload = {
        client: newClient,
        duration: "03:45 mins",
        topic: newTitle || "Amenities & Cost Sheet Discussion",
        qualityScore: "9.5/10 Pitch Score"
      };
      const res = await saveSpeedCallApi(payload);
      setThreeMinCallsData(prev => [{ name: res?.call_id, ...payload }, ...prev]);
    }

    setIsQuickAddOpen(false);
    setNewTitle("");
    setNewClient("");
    setNewPhone("");
    setNewLocation("");
    setNewExtra("");
    if (showToast) showToast(`✅ Record saved to CRM Database!`);
  };

  // Edit record
  const handleEditRecord = (record, type) => {
    setEditingRecord(record);
    setEditingType(type);
  };

  const handleSaveEditedRecord = async (updatedRecord) => {
    const itemName = updatedRecord.title || updatedRecord.name || updatedRecord.name_client || updatedRecord.name_lead || updatedRecord.client || updatedRecord.name_member || "Record";
    
    if (editingType === "Visit") {
      setVisitsData(prev => prev.map(v => (v.name === updatedRecord.name || v.id === updatedRecord.id) ? updatedRecord : v));
      await saveSiteVisitApi({
        visit_id: updatedRecord.name || updatedRecord.id,
        title: updatedRecord.title,
        client: updatedRecord.client,
        phone: updatedRecord.phone,
        location: updatedRecord.location,
        status: updatedRecord.status
      });
    } else if (editingType === "SQL Lead") {
      setQualifiedLeadsData(prev => prev.map(q => (q.name === updatedRecord.name || q.id === updatedRecord.id) ? updatedRecord : q));
      await saveQualifiedLeadApi({
        lead_id: updatedRecord.name || updatedRecord.id,
        name_client: updatedRecord.name_client || updatedRecord.name,
        score: updatedRecord.score,
        budget: updatedRecord.budget,
        bhk: updatedRecord.bhk,
        location: updatedRecord.location,
        interest: updatedRecord.interest
      });
    } else if (editingType === "Claimed Lead") {
      setClaimedLeadsData(prev => prev.map(c => (c.name === updatedRecord.name || c.id === updatedRecord.id) ? updatedRecord : c));
      await saveClaimedLeadApi({
        claim_id: updatedRecord.name || updatedRecord.id,
        lead_name: updatedRecord.lead_name || updatedRecord.name,
        points: updatedRecord.points,
        source: updatedRecord.source,
        status: updatedRecord.status
      });
    } else if (editingType === "Unique Lead") {
      setUniqueLeadsData(prev => prev.map(u => (u.name === updatedRecord.name || u.id === updatedRecord.id) ? updatedRecord : u));
      await saveUniqueLeadApi({
        lead_id: updatedRecord.name || updatedRecord.id,
        name_lead: updatedRecord.name_lead || updatedRecord.name,
        source: updatedRecord.source,
        phone: updatedRecord.phone,
        bhk: updatedRecord.bhk
      });
    } else if (editingType === "Site Visit Schedule") {
      setSiteVisitScheduleData(prev => prev.map(s => (s.name === updatedRecord.name || s.id === updatedRecord.id) ? updatedRecord : s));
      await saveSiteVisitScheduleApi({
        sch_id: updatedRecord.name || updatedRecord.id,
        client: updatedRecord.client,
        project: updatedRecord.project,
        slot: updatedRecord.slot,
        cab: updatedRecord.cab,
        status: updatedRecord.status
      });
    } else if (editingType === "Meeting") {
      setMeetingScheduleData(prev => prev.map(m => (m.name === updatedRecord.name || m.id === updatedRecord.id) ? updatedRecord : m));
      await saveMeetingScheduleApi({
        mtg_id: updatedRecord.name || updatedRecord.id,
        client: updatedRecord.client,
        venue: updatedRecord.venue,
        agenda: updatedRecord.agenda,
        time: updatedRecord.time,
        status: updatedRecord.status
      });
    } else if (editingType === "Video Call") {
      setVideoCallScheduleData(prev => prev.map(v => (v.name === updatedRecord.name || v.id === updatedRecord.id) ? updatedRecord : v));
      await saveVideoCallScheduleApi({
        vcs_id: updatedRecord.name || updatedRecord.id,
        client: updatedRecord.client,
        project: updatedRecord.project,
        platform: updatedRecord.platform,
        link: updatedRecord.link,
        time: updatedRecord.time,
        status: updatedRecord.status
      });
    } else if (editingType === "Call Log") {
      setThreeMinCallsData(prev => prev.map(c => (c.name === updatedRecord.name || c.id === updatedRecord.id) ? updatedRecord : c));
      await saveSpeedCallApi({
        call_id: updatedRecord.name || updatedRecord.id,
        client: updatedRecord.client,
        duration: updatedRecord.duration,
        topic: updatedRecord.topic,
        quality_score: updatedRecord.quality_score || updatedRecord.qualityScore
      });
    } else if (editingType === "Activity Document") {
      setUploadedActivityDocs(prev => prev.map(d => (d.name === updatedRecord.name || d.id === updatedRecord.id) ? updatedRecord : d));
      await saveActivityDocumentApi({
        doc_id: updatedRecord.name || updatedRecord.id,
        name_doc: updatedRecord.name_doc || updatedRecord.name,
        category: updatedRecord.category,
        file_size: updatedRecord.file_size || updatedRecord.size,
        file_url: updatedRecord.file_url || updatedRecord.dataUrl
      });
    }

    if (showToast) showToast(`✅ '${itemName}' updated in CRM Database!`);
    setEditingRecord(null);
    setEditingType("");
  };

  const confirmDeleteRecord = (item, type, onDeleteCallback) => {
    const itemName = item.title || item.name || item.name_client || item.name_lead || item.lead_name || item.client || item.project || item.name_member || "this record";
    setDeleteAction(() => async () => {
      if (onDeleteCallback) onDeleteCallback();

      try {
        const id = item.name || item.id;
        if (type === "Visit") await deleteSiteVisitApi(id);
        else if (type === "SQL Lead") await deleteQualifiedLeadApi(id);
        else if (type === "Claimed Lead") await deleteClaimedLeadApi(id);
        else if (type === "Unique Lead") await deleteUniqueLeadApi(id);
        else if (type === "Site Visit Schedule") await deleteSiteVisitScheduleApi(id);
        else if (type === "Meeting") await deleteMeetingScheduleApi(id);
        else if (type === "Video Call") await deleteVideoCallScheduleApi(id);
        else if (type === "Team Member") await deleteTeamMemberApi(id);
        else if (type === "Call Log") await deleteSpeedCallApi(id);
        else if (type === "Activity Document") await deleteActivityDocumentApi(id);
      } catch (err) {}

      if (showToast) showToast(`🗑️ '${itemName}' deleted from CRM Database!`);
    });

    setAlertConfig({
      title: `Delete ${type}?`,
      message: `Are you sure you want to delete '${itemName}'? This action will permanently remove it from the database.`,
      type: "warning",
      showConfirm: true
    });
  };

  const activitiesTabs = [
    "My Visits",
    "Qualified Leads",
    "Leads Claimed",
    "Unique Leads Created",
    "Site Visit Schedule",
    "Meeting Schedule",
    "Video Call Schedule",
    "My Team",
    "Three Minute Calls",
    "Activity Documents"
  ];

  // Search Filter Helper
  const filterList = (items, keys) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => keys.some(k => item[k] && String(item[k]).toLowerCase().includes(q)));
  };

  const filteredVisits = filterList(visitsData, ["title", "client", "phone", "location", "status"]);
  const filteredQLeads = filterList(qualifiedLeadsData, ["name", "name_client", "score", "budget", "bhk", "location", "interest"]);
  const filteredCLeads = filterList(claimedLeadsData, ["name", "lead_name", "points", "source", "status", "claimed_by"]);
  const filteredULeads = filterList(uniqueLeadsData, ["name", "name_lead", "source", "phone", "bhk"]);
  const filteredSVSchedules = filterList(siteVisitScheduleData, ["project", "client", "slot", "cab", "status"]);
  const filteredMeetings = filterList(meetingScheduleData, ["client", "venue", "agenda", "time", "status"]);
  const filteredVCalls = filterList(videoCallScheduleData, ["client", "project", "platform", "time", "status"]);
  const filteredTeam = filterList(teamMembersData, ["name_member", "name", "role", "email"]);
  const filtered3MinCalls = filterList(threeMinCallsData, ["client", "duration", "topic", "qualityScore", "quality_score"]);
  const filteredActDocs = filterList(uploadedActivityDocs, ["name", "name_doc", "category", "fileType", "file_type"]);

  return (
    <div style={{ padding: "0.875rem 0.75rem", paddingBottom: "5rem" }}>
      <DocUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
        categoryTitle="Activity & Schedule Documents"
      />

      {/* In-App Document Viewer Dialog */}
      <DocumentViewerModal
        isOpen={!!selectedViewDoc}
        onClose={() => setSelectedViewDoc(null)}
        doc={selectedViewDoc}
      />

      {/* In-App Universal Edit Record Modal */}
      <EditRecordModal
        isOpen={!!editingRecord}
        onClose={() => { setEditingRecord(null); setEditingType(""); }}
        record={editingRecord}
        recordType={editingType}
        onSave={handleSaveEditedRecord}
      />

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
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
            maxWidth: "380px",
            padding: "1.25rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
              + Add {selectedTab}
            </h3>
            <form onSubmit={handleQuickAdd} style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <input
                type="text"
                className="modern-search-input"
                placeholder="Client / Person Name *"
                value={newClient}
                onChange={e => setNewClient(e.target.value)}
                required
              />
              <input
                type="text"
                className="modern-search-input"
                placeholder="Title / Project / Agenda"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
              <input
                type="text"
                className="modern-search-input"
                placeholder="Phone Number (Optional)"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
              />
              <input
                type="text"
                className="modern-search-input"
                placeholder="Location / Venue / Cab"
                value={newLocation}
                onChange={e => setNewLocation(e.target.value)}
              />
              <input
                type="text"
                className="modern-search-input"
                placeholder="Slot / Budget / Extra Info"
                value={newExtra}
                onChange={e => setNewExtra(e.target.value)}
              />

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "0.5rem", background: "#f1f5f9", color: "#475569", border: "none", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1.5, padding: "0.6rem", borderRadius: "0.5rem", background: "#2563eb", color: "#ffffff", border: "none", fontWeight: 800, cursor: "pointer" }}
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>⚡ Activity & Schedules</h2>
          <p style={{ fontSize: "0.78125rem", color: "#64748b", margin: "0.1rem 0 0 0" }}>Track client visits, qualified SQLs & schedule reports</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsDocModalOpen(true)}
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
              gap: "0.35rem",
              boxShadow: "0 4px 12px rgba(2,132,199,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            <FileUp size={15} /> + Upload PDF / DOC
          </button>

          {selectedTab !== "Activity Documents" && selectedTab !== "My Team" && (
            <button
              onClick={() => setIsQuickAddOpen(true)}
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
                gap: "0.35rem",
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                whiteSpace: "nowrap"
              }}
            >
              <Plus size={15} /> + {selectedTab.split(" ")[0]}
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Sub Tabs */}
      <div className="sub-tabs-scroll" style={{ marginBottom: "0.75rem" }}>
        {activitiesTabs.map(tab => (
          <button 
            key={tab}
            className={`sub-tab-chip ${selectedTab === tab ? "active" : ""}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab === "Activity Documents" && "📁 "}
            {tab === "My Visits" && "🚗 "}
            {tab === "Qualified Leads" && "⭐ "}
            {tab === "Leads Claimed" && "🏆 "}
            {tab === "Site Visit Schedule" && "⏰ "}
            {tab === "Meeting Schedule" && "📅 "}
            {tab === "Video Call Schedule" && "🎥 "}
            {tab === "My Team" && "👥 "}
            {tab === "Three Minute Calls" && "⏱️ "}
            {tab}
          </button>
        ))}
      </div>

      {/* Modern Search Bar */}
      <div style={{ position: "relative", marginBottom: "0.875rem" }}>
        <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "11px" }} />
        <input
          type="text"
          className="modern-search-input"
          placeholder={`Search in ${selectedTab} by Client, Project, Location...`}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", height: "36px", fontSize: "0.8125rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "10px", top: "8px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 700 }}>×</button>
        )}
      </div>

      {/* Dynamic View rendering per selected sub-tab */}
      {selectedTab === "Activity Documents" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {/* Quick PDF/DOC Upload Banner */}
          <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe", padding: "0.85rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "0.84375rem", fontWeight: 800, color: "#1e40af" }}>📁 Activity & Schedule PDF / DOC Reports</div>
              <div style={{ fontSize: "0.71875rem", color: "#3b82f6" }}>Upload, view & share visit summaries, itineraries, scripts & schedule docs (.pdf, .doc, .docx)</div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.45rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}
            >
              <FileUp size={14} /> + Upload
            </button>
          </div>

          {filteredActDocs.map((doc, idx) => (
            <div 
              key={doc.name || doc.id || idx} 
              style={{ 
                background: "#ffffff", 
                border: "1px solid #e2e8f0", 
                borderRadius: "0.625rem", 
                padding: "0.75rem", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                gap: "0.5rem" 
              }}
            >
              <div 
                onClick={() => setSelectedViewDoc(doc)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0, cursor: "pointer" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", background: (doc.file_type === "PDF" || (doc.name_doc || doc.name || "").endsWith(".pdf")) ? "#fee2e2" : "#e0e7ff", color: (doc.file_type === "PDF" || (doc.name_doc || doc.name || "").endsWith(".pdf")) ? "#dc2626" : "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.6875rem", flexShrink: 0 }}>
                  {doc.file_type || doc.fileType || "PDF"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.name_doc || doc.name}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    {doc.category || "Report"} • {doc.file_size || doc.size || "1.2 MB"} • {doc.upload_date || doc.date || "Today"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                {/* View Document Button */}
                <button 
                  style={{ 
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", 
                    color: "#ffffff", 
                    border: "none", 
                    padding: "0.35rem 0.65rem", 
                    borderRadius: "0.375rem", 
                    fontSize: "0.75rem", 
                    fontWeight: "700", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.25rem",
                    boxShadow: "0 2px 6px rgba(37,99,235,0.25)"
                  }} 
                  onClick={() => setSelectedViewDoc(doc)}
                  title="View Document Details & Preview"
                >
                  <Eye size={13} /> View
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleEditRecord(doc, "Activity Document")}
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer" }}
                  title="Edit Document"
                >
                  <Edit3 size={13} />
                </button>

                {/* Delete Button */}
                <button 
                  style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
                  onClick={() => confirmDeleteRecord(doc, "Activity Document", () => {
                    setUploadedActivityDocs(prev => prev.filter(d => (d.name || d.id) !== (doc.name || doc.id)));
                  })}
                  title="Delete Document"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {filteredActDocs.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No activity documents match your search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "My Visits" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredVisits.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.6875rem", fontWeight: "700", color: "#2563eb", background: "#eff6ff", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                  📍 {item.location}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "#16a34a" }}>● {item.status || "Confirmed"}</span>
                  <button onClick={() => handleEditRecord(item, "Visit")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "Visit", () => {
                    setVisitsData(prev => prev.filter(v => (v.name || v.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0f172a", margin: "0.4rem 0 0.2rem 0" }}>{item.title}</h4>
              <p style={{ fontSize: "0.78125rem", color: "#64748b" }}>Client: {item.client} {item.phone ? `(${item.phone})` : ""}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Calendar size={13} color="#2563eb" /> {item.date}</div>
                <button style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.35rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.6875rem", fontWeight: "700", cursor: "pointer" }} onClick={() => handleStartVisit(item.client)}>
                  Start Visit Event
                </button>
              </div>
            </div>
          ))}

          {filteredVisits.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No site visits found matching your search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Qualified Leads" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredQLeads.map(lead => (
            <div key={lead.name || lead.id} style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#15803d", background: "#dcfce7", padding: "0.15rem 0.55rem", borderRadius: "9999px" }}>
                  ⭐ {lead.score || "92% Hot Match"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button onClick={() => handleEditRecord(lead, "SQL Lead")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(lead, "SQL Lead", () => {
                    setQualifiedLeadsData(prev => prev.filter(q => (q.name || q.id) !== (lead.name || lead.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0f172a", margin: "0.3rem 0" }}>{lead.name_client || lead.name}</h4>
              <div style={{ fontSize: "0.78125rem", color: "#475569" }}>Interested: {lead.interest || lead.bhk || "2/3 BHK Apartment"}</div>
              <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: "600", marginTop: "0.2rem" }}>Target: {lead.budget} • {lead.location}</div>
            </div>
          ))}

          {filteredQLeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No qualified leads found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Leads Claimed" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredCLeads.map(lead => (
            <div key={lead.name || lead.id} style={{ background: "#ffffff", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{lead.lead_name || lead.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.6875rem", background: "#fef3c7", color: "#d97706", fontWeight: "700", padding: "0.15rem 0.45rem", borderRadius: "9999px" }}>
                    🏆 {lead.points || "50 Points"}
                  </span>
                  <button onClick={() => handleEditRecord(lead, "Claimed Lead")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(lead, "Claimed Lead", () => {
                    setClaimedLeadsData(prev => prev.filter(c => (c.name || c.id) !== (lead.name || lead.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#64748b", margin: "0.2rem 0" }}>Source: {lead.source || "Campaign"}</div>
              <div style={{ fontSize: "0.71875rem", color: "#94a3b8" }}>Claimed: {lead.claimed_time || "Recently"}</div>
            </div>
          ))}

          {filteredCLeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No claimed leads found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Unique Leads Created" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredULeads.map(lead => (
            <div key={lead.name || lead.id} style={{ background: "#ffffff", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{lead.name_lead || lead.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                    {lead.bhk || "2 BHK"}
                  </span>
                  <button onClick={() => handleEditRecord(lead, "Unique Lead")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(lead, "Unique Lead", () => {
                    setUniqueLeadsData(prev => prev.filter(u => (u.name || u.id) !== (lead.name || lead.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#64748b", marginTop: "0.2rem" }}>Source: {lead.source || "Self Referral"} {lead.phone ? `• ${lead.phone}` : ""}</div>
              <div style={{ fontSize: "0.71875rem", color: "#94a3b8", marginTop: "0.2rem" }}>Created: {lead.date_created || "Today"}</div>
            </div>
          ))}

          {filteredULeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No unique leads found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Site Visit Schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredSVSchedules.map(sch => (
            <div key={sch.name || sch.id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{sch.project}</div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={() => handleEditRecord(sch, "Site Visit Schedule")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(sch, "Site Visit Schedule", () => {
                    setSiteVisitScheduleData(prev => prev.filter(s => (s.name || s.id) !== (sch.name || sch.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#475569", margin: "0.2rem 0" }}>Client: {sch.client}</div>
              <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: "600" }}>⏰ Slot: {sch.slot}</div>
              <div style={{ fontSize: "0.71875rem", color: "#64748b", marginTop: "0.3rem", background: "#f8fafc", padding: "0.3rem", borderRadius: "0.375rem" }}>
                🚗 Cab Logistics: {sch.cab}
              </div>
            </div>
          ))}

          {filteredSVSchedules.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No visit schedules found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Meeting Schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredMeetings.map(mtg => (
            <div key={mtg.name || mtg.id} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>Client: {mtg.client}</div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={() => handleEditRecord(mtg, "Meeting")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(mtg, "Meeting", () => {
                    setMeetingScheduleData(prev => prev.filter(m => (m.name || m.id) !== (mtg.name || mtg.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#2563eb", fontWeight: "600", margin: "0.2rem 0" }}>📍 Venue: {mtg.venue}</div>
              <div style={{ fontSize: "0.75rem", color: "#475569" }}>Agenda: {mtg.agenda}</div>
              <div style={{ fontSize: "0.71875rem", color: "#16a34a", fontWeight: "700", marginTop: "0.3rem" }}>⏰ Scheduled: {mtg.time}</div>
            </div>
          ))}

          {filteredMeetings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No meetings found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "Video Call Schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filteredVCalls.map(vid => (
            <div key={vid.name || vid.id} style={{ background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{vid.project}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <span style={{ fontSize: "0.6875rem", background: "#dbeafe", color: "#1d4ed8", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                    🎥 {vid.platform || "Zoom HD Tour"}
                  </span>
                  <button onClick={() => handleEditRecord(vid, "Video Call")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(vid, "Video Call", () => {
                    setVideoCallScheduleData(prev => prev.filter(v => (v.name || v.id) !== (vid.name || vid.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#475569", margin: "0.3rem 0" }}>Client: {vid.client} | {vid.time}</div>
              <button 
                style={{ width: "100%", background: "#2563eb", color: "#ffffff", border: "none", padding: "0.4rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem" }}
                onClick={() => window.open(vid.link || "https://zoom.us", '_blank')}
              >
                <Video size={14} /> Join Video Tour Link
              </button>
            </div>
          ))}

          {filteredVCalls.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No video tours found matching search.
            </div>
          )}
        </div>
      )}

      {selectedTab === "My Team" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ background: "#ffffff", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.5rem" }}>👥 Sales Team Leaderboard ({filteredTeam.length})</h4>
            {filteredTeam.map((member, idx) => (
              <div key={member.name || idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: idx < filteredTeam.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", fontWeight: "700", fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.84375rem", fontWeight: "700", color: "#0f172a" }}>{member.name_member || member.name}</div>
                    <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>{member.role || "Telecaller"}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.78125rem" }}>
                  <div style={{ fontWeight: "700", color: "#16a34a" }}>{member.visits_count || 0} Visits</div>
                  <div style={{ color: "#64748b", fontSize: "0.71875rem" }}>{member.calls_count || 0} Calls ({member.score || "90%"})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === "Three Minute Calls" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered3MinCalls.map(call => (
            <div key={call.name || call.id} style={{ background: "#ffffff", padding: "0.875rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{call.client}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0284c7", background: "#e0f2fe", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                    ⏱️ {call.duration || "03:00 mins"}
                  </span>
                  <button onClick={() => handleEditRecord(call, "Call Log")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(call, "Call Log", () => {
                    setThreeMinCallsData(prev => prev.filter(c => (c.name || c.id) !== (call.name || call.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#475569", margin: "0.3rem 0" }}>Topic: {call.topic}</div>
              <div style={{ fontSize: "0.71875rem", color: "#16a34a", fontWeight: "700" }}>⭐ {call.quality_score || call.qualityScore || "9.5/10"}</div>
            </div>
          ))}

          {filtered3MinCalls.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No call logs found matching search.
            </div>
          )}
        </div>
      )}

      {/* Universal Confirmation & Alert Modal */}
      {alertConfig && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(6px)",
          zIndex: 999999,
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
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              {alertConfig.showConfirm ? "🗑️" : (alertConfig.type === "success" ? "✅" : "ℹ️")}
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
              {alertConfig.title}
            </h3>
            <p style={{ fontSize: "0.84375rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: 1.4, whiteSpace: "pre-line" }}>
              {alertConfig.message}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {alertConfig.showConfirm ? (
                <>
                  <button
                    onClick={() => { setAlertConfig(null); setDeleteAction(null); }}
                    style={{ flex: 1, padding: "0.65rem", borderRadius: "0.5rem", background: "#f1f5f9", color: "#475569", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (deleteAction) deleteAction();
                      setAlertConfig(null);
                      setDeleteAction(null);
                    }}
                    style={{ flex: 1, padding: "0.65rem", borderRadius: "0.5rem", background: "#ef4444", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)" }}
                  >
                    Yes, Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAlertConfig(null)}
                  style={{ width: "100%", padding: "0.65rem", borderRadius: "0.5rem", background: "#2563eb", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
