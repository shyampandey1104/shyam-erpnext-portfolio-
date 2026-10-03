import React, { useState, useEffect } from "react";
import { 
  Building2, MapPin, Share2, Info, AlertTriangle, FileText, 
  Video, Layers, Calculator, ClipboardList, CheckCircle, Search, Filter,
  Phone, UserCheck, CheckSquare, Download, Play, Shield, Upload, Plus, Trash2, FileUp, Eye, Edit3, ArrowUpDown, Sparkles
} from "lucide-react";
import { 
  fetchCrmInventory, 
  uploadPropertyApi, 
  deletePropertyApi,
  fetchPropertyDocumentsApi, 
  uploadPropertyDocumentApi, 
  deletePropertyDocumentApi,
  fetchUnitPlansApi, 
  uploadUnitPlanApi, 
  deleteUnitPlanApi,
  fetchPropertyVideosApi, 
  uploadPropertyVideoApi, 
  deletePropertyVideoApi,
  fetchCmaAnalysesApi, 
  calculateCmaApi, 
  deleteCmaAnalysisApi,
  fetchProjectSurveysApi, 
  submitProjectSurvey, 
  deleteProjectSurveyApi,
  fetchPropertyListingsApi, 
  uploadPropertyListingApi, 
  deletePropertyListingApi 
} from "../services/apiService";
import UploadPropertyModal from "./UploadPropertyModal";
import UploadInventoryModal from "./UploadInventoryModal";
import DocUploadModal from "./DocUploadModal";
import DocumentViewerModal from "./DocumentViewerModal";
import VideoPlayerModal from "./VideoPlayerModal";
import EditRecordModal from "./EditRecordModal";
import CustomAlertDialog from "./CustomAlertDialog";

export default function PropertiesView({ onShareProperty, showToast }) {
  const [activeMainTab, setActiveMainTab] = useState("properties");
  const [selectedSubTab, setSelectedSubTab] = useState("Focus Projects");
  
  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [localityFilter, setLocalityFilter] = useState("All Localities");
  const [bhkFilter, setBhkFilter] = useState("All BHK Types");
  const [sortOrder, setSortOrder] = useState("Newest First");

  // CMA State
  const [cmaLocation, setCmaLocation] = useState("");
  const [cmaArea, setCmaArea] = useState("");
  const [cmaResult, setCmaResult] = useState(null);
  const [cmaHistory, setCmaHistory] = useState([]);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editingType, setEditingType] = useState("");
  const [alertConfig, setAlertConfig] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);

  // Sub-tab Upload Modals State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState("unit_plan");
  const [itemListingCategory, setItemListingCategory] = useState("My Listing");

  // Editable lists synced with Frappe Backend
  const [propertiesList, setPropertiesList] = useState([]);
  const [documentsList, setDocumentsList] = useState([]);
  const [unitPlansList, setUnitPlansList] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [myListingData, setMyListingData] = useState([]);
  const [employeeListingData, setEmployeeListingData] = useState([]);
  const [ownerLeadsData, setOwnerLeadsData] = useState([]);
  const [cpListingData, setCpListingData] = useState([]);
  const [ownerListingData, setOwnerListingData] = useState([]);
  const [surveysList, setSurveysList] = useState([]);

  // Survey Form State
  const [surveyBuilder, setSurveyBuilder] = useState("");
  const [surveyLocation, setSurveyLocation] = useState("");
  const [surveyPrice, setSurveyPrice] = useState("");
  const [surveyRera, setSurveyRera] = useState("");
  const [surveyNotes, setSurveyNotes] = useState("");

  // Load backend data on component mount
  useEffect(() => {
    loadAllBackendData();
  }, []);

  const loadAllBackendData = async () => {
    try {
      // 1. Focus Projects
      const invRes = await fetchCrmInventory();
      if (invRes && invRes.data) {
        setPropertiesList(invRes.data);
      } else if (Array.isArray(invRes)) {
        setPropertiesList(invRes);
      }

      // 2. Documents
      const docRes = await fetchPropertyDocumentsApi();
      if (Array.isArray(docRes) && docRes.length > 0) {
        setDocumentsList(docRes);
      }

      // 3. Unit Plans
      const plansRes = await fetchUnitPlansApi();
      if (Array.isArray(plansRes) && plansRes.length > 0) {
        setUnitPlansList(plansRes);
      }

      // 4. Videos
      const vidRes = await fetchPropertyVideosApi();
      if (Array.isArray(vidRes) && vidRes.length > 0) {
        setVideosList(vidRes);
      }

      // 5. CMA History
      const cmaRes = await fetchCmaAnalysesApi();
      if (Array.isArray(cmaRes)) {
        setCmaHistory(cmaRes);
      }

      // 6. Surveys
      const survRes = await fetchProjectSurveysApi();
      if (Array.isArray(survRes)) {
        setSurveysList(survRes);
      }

      // 7. Property Listings
      const listRes = await fetchPropertyListingsApi();
      if (Array.isArray(listRes) && listRes.length > 0) {
        setMyListingData(listRes.filter(l => l.listing_type === "My Listing"));
        setEmployeeListingData(listRes.filter(l => l.listing_type === "Employee Listing"));
        setOwnerLeadsData(listRes.filter(l => l.listing_type === "Owner Lead"));
        setCpListingData(listRes.filter(l => l.listing_type === "CP Listing"));
        setOwnerListingData(listRes.filter(l => l.listing_type === "Owner Listing"));
      }
    } catch (err) {
      console.log("[PropertiesView Data Loading Error]", err);
    }
  };

  const handlePropertyUploaded = (newProp) => {
    const updated = [newProp, ...propertiesList];
    setPropertiesList(updated);
    try { localStorage.setItem("crm_focus_projects", JSON.stringify(updated)); } catch (e) {}
    if (showToast) showToast(`🏢 Property '${newProp.title}' uploaded successfully!`);
  };

  const handleDocumentUploaded = (newDoc) => {
    const updated = [newDoc, ...documentsList];
    setDocumentsList(updated);
    try { localStorage.setItem("crm_property_docs", JSON.stringify(updated)); } catch (e) {}
    setSelectedSubTab("Documents");
    if (showToast) showToast(`📁 Document '${newDoc.name || newDoc.document_name}' uploaded successfully!`);
  };

  const handleItemUploaded = (type, item) => {
    if (type === "unit_plan") {
      const updated = [{ id: `UP-${Date.now().toString().slice(-4)}`, ...item }, ...unitPlansList];
      setUnitPlansList(updated);
      try { localStorage.setItem("crm_unit_plans", JSON.stringify(updated)); } catch (e) {}
      if (showToast) showToast(`📐 Unit Plan added successfully!`);
    } else if (type === "document") {
      handleDocumentUploaded(item);
    } else if (type === "video") {
      const updated = [{ id: `VID-${Date.now().toString().slice(-4)}`, ...item }, ...videosList];
      setVideosList(updated);
      try { localStorage.setItem("crm_videos", JSON.stringify(updated)); } catch (e) {}
      if (showToast) showToast(`🎥 3D Video Tour added successfully!`);
    } else if (type === "listing") {
      if (item.listing_type === "My Listing") {
        setMyListingData(prev => [item, ...prev]);
      } else if (item.listing_type === "Employee Listing") {
        setEmployeeListingData(prev => [item, ...prev]);
      } else if (item.listing_type === "Owner Lead") {
        setOwnerLeadsData(prev => [item, ...prev]);
      } else if (item.listing_type === "CP Listing") {
        setCpListingData(prev => [item, ...prev]);
      } else if (item.listing_type === "Owner Listing") {
        setOwnerListingData(prev => [item, ...prev]);
      }
      if (showToast) showToast(`📋 Listing added successfully!`);
    }
  };

  // Universal Edit Record Handler
  const handleEditRecord = (record, type) => {
    setEditingRecord(record);
    setEditingType(type);
  };

  const handleSaveEditedRecord = async (updatedRecord) => {
    const itemName = updatedRecord.title || updatedRecord.name || updatedRecord.document_name || updatedRecord.property || updatedRecord.project || "Record";
    
    if (editingType === "Property") {
      setPropertiesList(prev => prev.map(p => (p.name === updatedRecord.name || p.id === updatedRecord.id || p.title === updatedRecord.title) ? updatedRecord : p));
      await uploadPropertyApi(updatedRecord);
    } else if (editingType === "Document") {
      setDocumentsList(prev => prev.map(d => (d.name === updatedRecord.name || d.id === updatedRecord.id) ? updatedRecord : d));
      await uploadPropertyDocumentApi({
        doc_id: updatedRecord.name || updatedRecord.id,
        document_name: updatedRecord.document_name || updatedRecord.name,
        category: updatedRecord.category,
        file_size: updatedRecord.file_size || updatedRecord.size,
        file_url: updatedRecord.file_url || updatedRecord.dataUrl
      });
    } else if (editingType === "Unit Plan") {
      setUnitPlansList(prev => prev.map(u => (u.name === updatedRecord.name || u.id === updatedRecord.id) ? updatedRecord : u));
      await uploadUnitPlanApi({
        plan_id: updatedRecord.name || updatedRecord.id,
        project: updatedRecord.project,
        bhk_type: updatedRecord.bhk_type || updatedRecord.bhk,
        area: updatedRecord.area,
        plan_img: updatedRecord.plan_img || updatedRecord.planImg
      });
    } else if (editingType === "Video") {
      setVideosList(prev => prev.map(v => (v.name === updatedRecord.name || v.id === updatedRecord.id) ? updatedRecord : v));
      await uploadPropertyVideoApi({
        video_id: updatedRecord.name || updatedRecord.id,
        title: updatedRecord.title,
        duration: updatedRecord.duration,
        video_url: updatedRecord.video_url || updatedRecord.url,
        thumbnail: updatedRecord.thumbnail || updatedRecord.img
      });
    } else if (editingType === "My Listing" || editingType === "Employee Listing" || editingType === "Owner Lead" || editingType === "CP Listing" || editingType === "Owner Listing") {
      if (editingType === "My Listing") setMyListingData(prev => prev.map(l => (l.name === updatedRecord.name || l.id === updatedRecord.id) ? updatedRecord : l));
      if (editingType === "Employee Listing") setEmployeeListingData(prev => prev.map(l => (l.name === updatedRecord.name || l.id === updatedRecord.id) ? updatedRecord : l));
      if (editingType === "Owner Lead") setOwnerLeadsData(prev => prev.map(l => (l.name === updatedRecord.name || l.id === updatedRecord.id) ? updatedRecord : l));
      if (editingType === "CP Listing") setCpListingData(prev => prev.map(l => (l.name === updatedRecord.name || l.id === updatedRecord.id) ? updatedRecord : l));
      if (editingType === "Owner Listing") setOwnerListingData(prev => prev.map(l => (l.name === updatedRecord.name || l.id === updatedRecord.id) ? updatedRecord : l));
      
      await uploadPropertyListingApi({
        listing_id: updatedRecord.name || updatedRecord.id,
        listing_type: updatedRecord.listing_type || editingType,
        title: updatedRecord.title || updatedRecord.property,
        locality: updatedRecord.locality,
        price: updatedRecord.price,
        owner_or_agent: updatedRecord.owner_or_agent || updatedRecord.owner || updatedRecord.agent || updatedRecord.broker,
        phone: updatedRecord.phone,
        status: updatedRecord.status,
        commission: updatedRecord.commission
      });
    }

    if (showToast) showToast(`✅ '${itemName}' updated successfully in CRM Database!`);
    setEditingRecord(null);
    setEditingType("");
  };

  // Universal Delete Handler connected to Backend APIs
  const confirmDeleteRecord = (item, type, onDeleteCallback) => {
    const itemName = item.title || item.name || item.document_name || item.property || item.project || item.builder || "this item";
    setDeleteAction(() => async () => {
      if (onDeleteCallback) onDeleteCallback();
      
      // Call backend delete API
      try {
        if (type === "Property") {
          await deletePropertyApi(item.name || item.title);
        } else if (type === "Document") {
          await deletePropertyDocumentApi(item.name || item.id);
        } else if (type === "Unit Plan") {
          await deleteUnitPlanApi(item.name || item.id);
        } else if (type === "Video") {
          await deletePropertyVideoApi(item.name || item.id);
        } else if (type === "CMA Analysis") {
          await deleteCmaAnalysisApi(item.name || item.id);
        } else if (type === "Project Survey") {
          await deleteProjectSurveyApi(item.name || item.id);
        } else if (type.includes("Listing") || type === "Owner Lead") {
          await deletePropertyListingApi(item.name || item.id);
        }
      } catch (err) {
        console.log(`[Delete error for ${type}]`, err);
      }

      if (showToast) showToast(`🗑️ '${itemName}' deleted from CRM Database!`);
    });

    setAlertConfig({
      title: `Delete ${type}?`,
      message: `Are you sure you want to permanently delete '${itemName}' from the database?`,
      type: "warning",
      showConfirm: true
    });
  };

  // CMA Calculation & DB Save
  const handleCalculateCMA = async (e) => {
    e.preventDefault();
    const res = await calculateCmaApi(cmaLocation, cmaArea);
    if (res) {
      setCmaResult(res);
      setCmaHistory(prev => [res, ...prev]);
      if (showToast) showToast(`📊 Market Valuation computed & saved to CRM DB!`);
    }
  };

  // Survey Submission & DB Save
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    if (!surveyBuilder.trim()) {
      setAlertConfig({ title: "Builder Name Required", message: "Please enter Builder / Developer Name", type: "warning" });
      return;
    }
    const res = await submitProjectSurvey({
      builder: surveyBuilder,
      location: surveyLocation,
      price_range: surveyPrice,
      rera_no: surveyRera,
      survey_notes: surveyNotes
    });
    const newSurvObj = {
      name: res?.survey_id || `SURV-${Date.now().toString().slice(-4)}`,
      builder: surveyBuilder,
      location: surveyLocation || "Mumbai",
      price_range: surveyPrice || "₹ 2.0 Cr+",
      rera_no: surveyRera,
      survey_notes: surveyNotes,
      creation: new Date().toISOString()
    };
    setSurveysList(prev => [newSurvObj, ...prev]);
    const successMsg = typeof res?.message === "string" ? res.message : `Field Survey for '${surveyBuilder}' submitted to CRM Database!`;
    setAlertConfig({ title: "Survey Submitted!", message: successMsg, type: "success" });
    setSurveyBuilder("");
    setSurveyLocation("");
    setSurveyPrice("");
    setSurveyRera("");
    setSurveyNotes("");
  };

  // Universal Filter Predicate
  const matchFilter = (item, fieldsToSearch = []) => {
    // 1. Search Query Match
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matched = fieldsToSearch.some(fieldVal => fieldVal && String(fieldVal).toLowerCase().includes(q));
      if (!matched) return false;
    }

    // 2. Locality Filter Match
    if (localityFilter !== "All Localities") {
      const locKey = (item.location || item.locality || item.project || item.name || "").toLowerCase();
      if (!locKey.includes(localityFilter.toLowerCase())) return false;
    }

    // 3. BHK Filter Match
    if (bhkFilter !== "All BHK Types") {
      const bhkKey = (item.bhk || item.bhk_type || item.bhkType || item.title || item.property || "").toLowerCase();
      if (!bhkKey.includes(bhkFilter.toLowerCase().replace(" types", ""))) return false;
    }

    return true;
  };

  // Filtered Lists
  const filteredProperties = propertiesList.filter(p => matchFilter(p, [p.title, p.builder, p.location, p.bhk, p.price_range, p.tag]));
  const filteredDocs = documentsList.filter(d => matchFilter(d, [d.name, d.document_name, d.project, d.category, d.file_type]));
  const filteredPlans = unitPlansList.filter(u => matchFilter(u, [u.project, u.bhk_type, u.area, u.notes]));
  const filteredVideos = videosList.filter(v => matchFilter(v, [v.title, v.project, v.duration]));
  const filteredMyListings = myListingData.filter(l => matchFilter(l, [l.title, l.property, l.locality, l.price, l.owner, l.owner_or_agent]));
  const filteredEmpListings = employeeListingData.filter(l => matchFilter(l, [l.title, l.property, l.locality, l.price, l.agent, l.owner_or_agent]));
  const filteredOwnerLeads = ownerLeadsData.filter(l => matchFilter(l, [l.name, l.title, l.property, l.locality, l.phone, l.owner_or_agent]));
  const filteredCpListings = cpListingData.filter(l => matchFilter(l, [l.broker, l.title, l.property, l.locality, l.commission, l.owner_or_agent]));
  const filteredOwnerListings = ownerListingData.filter(l => matchFilter(l, [l.title, l.property, l.locality, l.price, l.phone, l.owner_or_agent]));
  const filteredSurveys = surveysList.filter(s => matchFilter(s, [s.builder, s.location, s.price_range, s.rera_no, s.survey_notes]));
  const filteredCma = cmaHistory.filter(c => matchFilter(c, [c.locality, c.rate_per_sqft, c.estimated_price, c.confidence]));

  return (
    <div style={{ padding: "0.875rem 0.75rem", paddingBottom: "5rem" }}>
      <UploadPropertyModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPropertyUploaded={handlePropertyUploaded}
      />

      <DocUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
        categoryTitle="Property & Inventory Documents"
      />

      {/* In-App Document Viewer Dialog */}
      <DocumentViewerModal
        isOpen={!!selectedViewDoc}
        onClose={() => setSelectedViewDoc(null)}
        doc={selectedViewDoc}
      />

      {/* In-App Video Player Dialog */}
      <VideoPlayerModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
      />

      {/* In-App Universal Edit Record Modal */}
      <EditRecordModal
        isOpen={!!editingRecord}
        onClose={() => { setEditingRecord(null); setEditingType(""); }}
        record={editingRecord}
        recordType={editingType}
        onSave={handleSaveEditedRecord}
      />

      <UploadInventoryModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        mode={itemModalMode}
        defaultListingType={itemListingCategory}
        onItemUploaded={handleItemUploaded}
      />

      {/* Header Bar with Action Buttons */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>🏢 Property & Focus Inventory</h2>
          <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.1rem 0 0 0" }}>Manage inventory, floor plans, RERA brochures & valuation</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
          {/* Direct PDF / DOC Upload Button */}
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

          {/* Direct Video Tour Upload Button */}
          <button
            onClick={() => { setItemModalMode("video"); setIsItemModalOpen(true); }}
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
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
              boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            <Video size={15} /> + Upload Video
          </button>

          {/* Upload Property Button */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
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
            <Upload size={15} /> + Property
          </button>
        </div>
      </div>

      {/* Main Tab Toggle: Properties vs Listing */}
      <div style={{ display: "flex", background: "#f1f5f9", padding: "0.25rem", borderRadius: "0.75rem", marginBottom: "0.875rem" }}>
        <button
          className={`tab-btn ${activeMainTab === "properties" ? "active" : ""}`}
          onClick={() => { setActiveMainTab("properties"); setSelectedSubTab("Focus Projects"); }}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: "700", border: "none", cursor: "pointer", background: activeMainTab === "properties" ? "#2563eb" : "transparent", color: activeMainTab === "properties" ? "#fff" : "#64748b" }}
        >
          🏢 Properties & Focus
        </button>
        <button
          className={`tab-btn ${activeMainTab === "listing" ? "active" : ""}`}
          onClick={() => { setActiveMainTab("listing"); setSelectedSubTab("My Listing"); }}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", fontSize: "0.8125rem", fontWeight: "700", border: "none", cursor: "pointer", background: activeMainTab === "listing" ? "#2563eb" : "transparent", color: activeMainTab === "listing" ? "#fff" : "#64748b" }}
        >
          📋 Property Listings
        </button>
      </div>

      {/* Sub Tabs Scroll */}
      <div className="sub-tabs-scroll" style={{ marginBottom: "0.75rem" }}>
        {activeMainTab === "properties" ? (
          <>
            {["Focus Projects", "Documents", "Unit Plans", "CMA Analysis", "Project Survey", "Videos"].map(tab => (
              <button 
                key={tab}
                className={`sub-tab-chip ${selectedSubTab === tab ? "active" : ""}`}
                onClick={() => setSelectedSubTab(tab)}
              >
                {tab === "Focus Projects" && "⭐ "}
                {tab === "Documents" && "📁 "}
                {tab === "Unit Plans" && "📐 "}
                {tab === "CMA Analysis" && "📊 "}
                {tab === "Project Survey" && "📝 "}
                {tab === "Videos" && "🎥 "}
                {tab}
              </button>
            ))}
          </>
        ) : (
          <>
            {["My Listing", "Employee Listing", "Check Demand", "Owner Leads", "Owner Listing", "CP Listing"].map(tab => (
              <button 
                key={tab}
                className={`sub-tab-chip ${selectedSubTab === tab ? "active" : ""}`}
                onClick={() => setSelectedSubTab(tab)}
              >
                {tab}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Universal Responsive Search & Filter Bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.6rem 0.75rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* Search Input */}
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <Search size={15} color="#94a3b8" style={{ position: "absolute", left: "10px" }} />
          <input
            type="text"
            className="modern-search-input"
            placeholder={`Search in ${selectedSubTab} (Title, Location, Builder, BHK, Name)...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "32px", paddingRight: "30px", fontSize: "0.8125rem", height: "36px", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              style={{ position: "absolute", right: "8px", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 700, fontSize: "14px" }}
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Pills Row */}
        <div style={{ display: "flex", gap: "0.4rem", overflowX: "auto", paddingBottom: "2px" }} className="horizontal-filter-scroll">
          {/* Locality Filter */}
          <select
            value={localityFilter}
            onChange={e => setLocalityFilter(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "0.45rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: localityFilter !== "All Localities" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
              background: localityFilter !== "All Localities" ? "#eff6ff" : "#f8fafc",
              color: localityFilter !== "All Localities" ? "#1d4ed8" : "#475569",
              cursor: "pointer"
            }}
          >
            <option value="All Localities">📍 All Localities</option>
            <option value="Andheri">Andheri West</option>
            <option value="Bandra">Bandra West</option>
            <option value="Borivali">Borivali East</option>
            <option value="Wadala">Wadala</option>
            <option value="Bhandup">Bhandup West</option>
            <option value="Worli">Worli Sea Face</option>
            <option value="Lokhandwala">Lokhandwala</option>
            <option value="Khar">Khar West</option>
            <option value="Juhu">Juhu Scheme</option>
            <option value="Thane">Thane</option>
          </select>

          {/* BHK Filter */}
          <select
            value={bhkFilter}
            onChange={e => setBhkFilter(e.target.value)}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "0.45rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              border: bhkFilter !== "All BHK Types" ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
              background: bhkFilter !== "All BHK Types" ? "#eff6ff" : "#f8fafc",
              color: bhkFilter !== "All BHK Types" ? "#1d4ed8" : "#475569",
              cursor: "pointer"
            }}
          >
            <option value="All BHK Types">🏢 All BHK Types</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4 BHK">4 BHK</option>
            <option value="Penthouse">Penthouse / Villa</option>
          </select>

          {/* Reset Filters Button if any active */}
          {(localityFilter !== "All Localities" || bhkFilter !== "All BHK Types" || searchQuery !== "") && (
            <button
              onClick={() => { setLocalityFilter("All Localities"); setBhkFilter("All BHK Types"); setSearchQuery(""); }}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "0.45rem",
                fontSize: "0.71875rem",
                fontWeight: 700,
                border: "1px solid #fecaca",
                background: "#fef2f2",
                color: "#dc2626",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              Reset Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Content Rendering based on Selected SubTab */}
      {selectedSubTab === "Documents" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {/* Quick PDF/DOC Upload Banner */}
          <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "1px solid #bfdbfe", padding: "0.85rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "0.84375rem", fontWeight: 800, color: "#1e40af" }}>📁 Project Documents & PDF Brochures</div>
              <div style={{ fontSize: "0.71875rem", color: "#3b82f6" }}>Upload, view & share verified RERA PDFs, brochures, cost sheets (.pdf, .doc, .docx)</div>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.45rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}
            >
              <FileUp size={14} /> + Upload
            </button>
          </div>

          {filteredDocs.map((doc, idx) => (
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
                gap: "0.5rem",
                transition: "all 0.15s ease"
              }}
            >
              <div 
                onClick={() => setSelectedViewDoc(doc)}
                style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1, minWidth: 0, cursor: "pointer" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "0.5rem", background: (doc.file_type === "PDF" || (doc.document_name || doc.name || "").endsWith(".pdf")) ? "#fee2e2" : "#e0e7ff", color: (doc.file_type === "PDF" || (doc.document_name || doc.name || "").endsWith(".pdf")) ? "#dc2626" : "#4338ca", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.6875rem", flexShrink: 0 }}>
                  {doc.file_type || "PDF"}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {doc.document_name || doc.name}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    {doc.category || "Brochure"} • {doc.file_size || doc.size || "1.5 MB"} • {doc.upload_date || doc.date || "Today"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0 }}>
                {/* View Document Dialog Button */}
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
                  type="button"
                  onClick={() => handleEditRecord(doc, "Document")}
                  style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Edit Document Details"
                >
                  <Edit3 size={13} />
                </button>

                {/* Delete button */}
                <button 
                  style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} 
                  onClick={() => confirmDeleteRecord(doc, "Document", () => {
                    setDocumentsList(prev => prev.filter(d => (d.name || d.id) !== (doc.name || doc.id)));
                  })}
                  title="Delete Document"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No documents match your search filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "CMA Analysis" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* CMA Calculator Card */}
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", marginBottom: "0.3rem" }}>📊 Comparative Market Analysis (CMA)</h4>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>Calculate fair market value & price trends in Bandra, Andheri, Lokhandwala & Thane (Saved to Frappe DB).</p>

            <form onSubmit={handleCalculateCMA} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>Property Locality</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Lokhandwala, Andheri West" value={cmaLocation} onChange={e => setCmaLocation(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>Carpet Area (sq.ft)</label>
                <input type="number" className="modern-search-input" placeholder="e.g. 1150" value={cmaArea} onChange={e => setCmaArea(e.target.value)} required />
              </div>
              <button type="submit" className="admin-action-btn" style={{ justifyContent: "center" }}>
                Calculate Market Value & Save to DB
              </button>
            </form>

            {cmaResult && (
              <div style={{ marginTop: "1rem", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "0.875rem", borderRadius: "0.625rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#0369a1", fontWeight: "700" }}>CMA Estimation Result:</div>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0284c7", margin: "0.2rem 0" }}>Estimated Price: {cmaResult.estVal || cmaResult.estimated_price}</div>
                <div style={{ fontSize: "0.78125rem", color: "#475569" }}>Average Rate: <strong>{cmaResult.rate || cmaResult.rate_per_sqft}</strong></div>
                <div style={{ fontSize: "0.71875rem", color: "#16a34a", fontWeight: "700", marginTop: "0.3rem" }}>✓ {cmaResult.confidence}</div>
              </div>
            )}
          </div>

          {/* Saved CMA Analyses List */}
          {filteredCma.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>📑 Past CMA Reports ({filteredCma.length})</h4>
              {filteredCma.map((cma, idx) => (
                <div key={cma.name || idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.625rem", padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>📍 {cma.locality} ({cma.carpet_area || 1000} sq.ft)</div>
                    <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>{cma.estimated_price || cma.estVal} • Rate: {cma.rate_per_sqft || cma.rate}</div>
                  </div>
                  <button
                    onClick={() => confirmDeleteRecord(cma, "CMA Analysis", () => {
                      setCmaHistory(prev => prev.filter(c => c.name !== cma.name));
                    })}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Delete CMA Record"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : selectedSubTab === "Project Survey" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid #e2e8f0" }}>
            <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", marginBottom: "0.3rem" }}>📝 Builder Field Project Survey</h4>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>Submit survey report for new upcoming builder projects directly to Frappe MariaDB.</p>
            <form onSubmit={handleSurveySubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Builder / Developer Name (e.g. Oberoi Realty) *" 
                value={surveyBuilder}
                onChange={e => setSurveyBuilder(e.target.value)}
                required
              />
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Land Parcel Location (e.g. Goregaon East)" 
                value={surveyLocation}
                onChange={e => setSurveyLocation(e.target.value)}
              />
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="Expected Launch Price Range (e.g. ₹ 2.5 Cr+)" 
                value={surveyPrice}
                onChange={e => setSurveyPrice(e.target.value)}
              />
              <input 
                type="text" 
                className="modern-search-input" 
                placeholder="RERA Registration / Application No (Optional)" 
                value={surveyRera}
                onChange={e => setSurveyRera(e.target.value)}
              />
              <textarea
                className="modern-search-input"
                rows={2}
                placeholder="Survey Insights, Proposed Amenities & Landmark..."
                value={surveyNotes}
                onChange={e => setSurveyNotes(e.target.value)}
                style={{ resize: "vertical" }}
              />
              <button type="submit" className="admin-action-btn" style={{ justifyContent: "center" }}>
                Submit Survey Form to CRM Database
              </button>
            </form>
          </div>

          {/* List of Submitted Project Surveys */}
          {filteredSurveys.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>📋 Field Project Surveys ({filteredSurveys.length})</h4>
              {filteredSurveys.map((surv, idx) => (
                <div key={surv.name || idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.625rem", padding: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>🏗️ {surv.builder}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Location: {surv.location} • Price: <strong style={{ color: "#2563eb" }}>{surv.price_range}</strong></div>
                    {surv.survey_notes && <div style={{ fontSize: "0.71875rem", color: "#475569", marginTop: "2px" }}>{surv.survey_notes}</div>}
                  </div>
                  <button
                    onClick={() => confirmDeleteRecord(surv, "Project Survey", () => {
                      setSurveysList(prev => prev.filter(s => s.name !== surv.name));
                    })}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Delete Survey"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : selectedSubTab === "Unit Plans" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <button
            onClick={() => { setItemModalMode("unit_plan"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add Unit Floor Plan
          </button>
          {filteredPlans.map((plan, idx) => (
            <div key={plan.name || plan.id || idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <h4 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>📐 {plan.project}</h4>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    onClick={() => handleEditRecord(plan, "Unit Plan")}
                    style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem 0.45rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Edit Unit Plan"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => confirmDeleteRecord(plan, "Unit Plan", () => {
                      setUnitPlansList(prev => prev.filter(u => (u.name || u.id) !== (plan.name || plan.id)));
                    })}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem 0.45rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Delete Unit Plan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.5rem" }}>Area: {plan.area || "750 sq.ft Carpet"} {plan.bhk_type ? `• ${plan.bhk_type}` : ""}</p>
              <img 
                src={plan.plan_img || plan.planImg || "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80"} 
                alt={plan.project} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80";
                }}
                style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "0.5rem" }} 
              />
              <button style={{ width: "100%", marginTop: "0.6rem", background: "#2563eb", color: "#ffffff", border: "none", padding: "0.4rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }} onClick={() => setAlertConfig({ title: "Downloading Layout", message: `Downloading High-Res 2D/3D Floor Plan PDF for ${plan.project}...`, type: "info" })}>
                <Download size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Download Floor Layout PDF
              </button>
            </div>
          ))}

          {filteredPlans.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No unit floor plans match your search filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "Videos" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <button
            onClick={() => { setItemModalMode("video"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add 3D Virtual Video Tour
          </button>
          
          {filteredVideos.map((vid, idx) => (
            <div 
              key={vid.name || vid.id || idx} 
              style={{ 
                background: "#ffffff", 
                border: "1px solid #e2e8f0", 
                borderRadius: "0.75rem", 
                overflow: "hidden", 
                padding: "0.875rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div 
                onClick={() => setSelectedVideo(vid)}
                style={{ position: "relative", width: "100%", height: "150px", background: "#0f172a", borderRadius: "0.5rem", overflow: "hidden", cursor: "pointer" }}
              >
                <img 
                  src={vid.thumbnail || vid.img || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"} 
                  alt={vid.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                />
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.6)" }}>
                    <Play size={22} fill="#ffffff" style={{ marginLeft: "2px" }} />
                  </div>
                </div>
                <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.75)", color: "#ffffff", padding: "0.15rem 0.45rem", borderRadius: "4px", fontSize: "0.6875rem", fontWeight: 700 }}>
                  {vid.duration || "4K Tour"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.6rem" }}>
                <div>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>{vid.title}</h4>
                  <div style={{ fontSize: "0.71875rem", color: "#64748b", marginTop: "2px" }}>Duration: {vid.duration || "03:30"} • Tap to Play 3D Tour</div>
                </div>

                <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVideo(vid)}
                    style={{
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    <Play size={12} fill="#ffffff" /> Play
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditRecord(vid, "Video")}
                    style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Edit Video"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => confirmDeleteRecord(vid, "Video", () => {
                      setVideosList(prev => prev.filter(v => (v.name || v.id) !== (vid.name || vid.id)));
                    })}
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.35rem", borderRadius: "0.375rem", cursor: "pointer" }}
                    title="Delete Video"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVideos.length === 0 && (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No videos match your search filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "My Listing" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { setItemModalMode("listing"); setItemListingCategory("My Listing"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add My Listing
          </button>
          {filteredMyListings.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#2563eb" }}>{item.name || item.id}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.6875rem", background: "#dcfce7", color: "#15803d", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>{item.status || "Verified"}</span>
                  <button onClick={() => handleEditRecord(item, "My Listing")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "My Listing", () => {
                    setMyListingData(prev => prev.filter(l => (l.name || l.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0f172a", marginTop: "0.3rem" }}>{item.title || item.property}</h4>
              <div style={{ fontSize: "0.78125rem", color: "#64748b" }}>Location: {item.locality} | Price: <strong style={{ color: "#0f172a" }}>{item.price}</strong></div>
              <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "0.2rem" }}>Owner: {item.owner_or_agent || item.owner}</div>
            </div>
          ))}

          {filteredMyListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", color: "#64748b" }}>
              No listings found matching filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "Employee Listing" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { setItemModalMode("listing"); setItemListingCategory("Employee Listing"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add Employee Listing
          </button>
          {filteredEmpListings.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a" }}>Agent: {item.owner_or_agent || item.agent}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.6875rem", background: "#eff6ff", color: "#1d4ed8", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>{item.status || "Active"}</span>
                  <button onClick={() => handleEditRecord(item, "Employee Listing")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "Employee Listing", () => {
                    setEmployeeListingData(prev => prev.filter(l => (l.name || l.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a", marginTop: "0.3rem" }}>{item.title || item.property}</h4>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.locality} - {item.price}</div>
            </div>
          ))}

          {filteredEmpListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", color: "#64748b" }}>
              No employee listings found matching filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "Check Demand" ? (
        <div style={{ background: "#ffffff", padding: "1.25rem", borderRadius: "0.875rem", border: "1px solid #e2e8f0" }}>
          <h4 style={{ fontSize: "0.9375rem", fontWeight: "700", marginBottom: "0.3rem" }}>🔍 AI Buyer Demand Matcher</h4>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1rem" }}>Match active buyer requirements with verified listings across Andheri, Bandra & Lokhandwala.</p>
          <button className="admin-action-btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setAlertConfig({ title: "AI Search Complete", message: "AI Search Matched 18 High-Intent Buyers in Bandra & Andheri!", type: "success" })}>
            <Sparkles size={16} /> Run Buyer Demand Engine
          </button>
        </div>
      ) : selectedSubTab === "Owner Leads" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { setItemModalMode("listing"); setItemListingCategory("Owner Lead"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add Owner Lead
          </button>
          {filteredOwnerLeads.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>Owner: {item.owner_or_agent || item.name}</div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={() => handleEditRecord(item, "Owner Lead")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "Owner Lead", () => {
                    setOwnerLeadsData(prev => prev.filter(l => (l.name || l.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#2563eb", fontWeight: "600" }}>{item.title || item.property}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.locality} | {item.phone}</div>
            </div>
          ))}

          {filteredOwnerLeads.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", color: "#64748b" }}>
              No owner leads found matching filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "CP Listing" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { setItemModalMode("listing"); setItemListingCategory("CP Listing"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add CP Listing
          </button>
          {filteredCpListings.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>{item.owner_or_agent || item.broker}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ fontSize: "0.6875rem", background: "#fef9c3", color: "#854d0e", fontWeight: "700", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>{item.commission || "2.0% Split"}</span>
                  <button onClick={() => handleEditRecord(item, "CP Listing")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "CP Listing", () => {
                    setCpListingData(prev => prev.filter(l => (l.name || l.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#475569", marginTop: "0.3rem" }}>{item.title || item.property} ({item.locality})</div>
            </div>
          ))}

          {filteredCpListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", color: "#64748b" }}>
              No CP listings found matching filters.
            </div>
          )}
        </div>
      ) : selectedSubTab === "Owner Listing" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            onClick={() => { setItemModalMode("listing"); setItemListingCategory("Owner Listing"); setIsItemModalOpen(true); }}
            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "0.6rem 1rem", borderRadius: "0.6rem", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
          >
            <Plus size={16} /> + Add Owner Listing
          </button>
          {filteredOwnerListings.map(item => (
            <div key={item.name || item.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0f172a" }}>Owner: {item.owner_or_agent || item.owner}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <button onClick={() => handleEditRecord(item, "Owner Listing")} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Edit"><Edit3 size={12} /></button>
                  <button onClick={() => confirmDeleteRecord(item, "Owner Listing", () => {
                    setOwnerListingData(prev => prev.filter(l => (l.name || l.id) !== (item.name || item.id)));
                  })} style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem", borderRadius: "0.35rem", cursor: "pointer" }} title="Delete"><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ fontSize: "0.78125rem", color: "#2563eb", fontWeight: "600" }}>{item.title || item.property}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.locality} | {item.price}</div>
            </div>
          ))}

          {filteredOwnerListings.length === 0 && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", background: "#ffffff", borderRadius: "0.75rem", color: "#64748b" }}>
              No owner listings found matching filters.
            </div>
          )}
        </div>
      ) : (
        /* Focus Projects Listing Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {filteredProperties.map(prop => (
            <div key={prop.name || prop.id} className="property-card-modern">
              <div style={{ position: "relative" }}>
                <img 
                  src={prop.img || prop.image || prop.hero_img || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"} 
                  alt={prop.title} 
                  className="property-hero-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
                  }}
                />
                <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(15, 23, 42, 0.8)", color: "#ffffff", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: "700", backdropFilter: "blur(4px)" }}>
                  {prop.builder}
                </div>
                <div style={{ position: "absolute", top: "10px", right: "10px", background: "#2563eb", color: "#ffffff", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: "700" }}>
                  {prop.tag || "New Launch"}
                </div>
              </div>

              <div className="property-card-body">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>{prop.title}</h3>
                  <div style={{ display: "flex", gap: "0.3rem" }}>
                    <button
                      type="button"
                      onClick={() => handleEditRecord(prop, "Property")}
                      style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", cursor: "pointer" }}
                      title="Edit Property"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteRecord(prop, "Property", () => {
                        setPropertiesList(prev => prev.filter(p => (p.name || p.title) !== (prop.name || prop.title)));
                      })}
                      style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "0.25rem 0.45rem", borderRadius: "0.35rem", cursor: "pointer" }}
                      title="Delete Property"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78125rem", color: "#64748b", margin: "0.2rem 0 0.5rem 0" }}>
                  <MapPin size={13} color="#2563eb" />
                  {prop.location}
                </div>

                <div className="property-price-tag">{prop.price_range || prop.priceRange || prop.price || "Price on Request"}</div>

                {/* Highlights List */}
                <div style={{ margin: "0.6rem 0", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", color: "#475569" }}>
                  {typeof prop.highlights === "string" ? (
                    prop.highlights.split(",").map((point, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem", margin: "0.2rem 0" }}>
                        <span style={{ color: "#2563eb", fontWeight: "800" }}>•</span>
                        <span>{point.trim()}</span>
                      </div>
                    ))
                  ) : Array.isArray(prop.highlights) ? (
                    prop.highlights.map((point, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.35rem", margin: "0.2rem 0" }}>
                        <span style={{ color: "#2563eb", fontWeight: "800" }}>•</span>
                        <span>{point}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>Prime location, 50+ modern amenities, RERA approved</div>
                  )}
                </div>

                {/* Property Detail Action Buttons */}
                <div className="property-quick-actions">
                  <button className="prop-btn share" onClick={() => onShareProperty(prop)}>
                    <Share2 size={14} /> Share
                  </button>
                  <button className="prop-btn details" onClick={() => setAlertConfig({ title: prop.title, message: `BHK Configuration: ${prop.bhk}
Carpet Area: ${prop.carpet}
Price: ${prop.price_range || prop.priceRange || prop.price}`, type: "info" })}>
                    <Info size={14} /> Details
                  </button>
                  <button className="prop-btn details" style={{ flex: "0 0 auto", padding: "0.5rem" }} onClick={() => setAlertConfig({ title: "Report Logged", message: `Project Report & Feedback logged for ${prop.title}`, type: "warning" })}>
                    <AlertTriangle size={14} color="#ef4444" />
                  </button>
                </div>

                {/* Sub Features row */}
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.6rem", paddingTop: "0.6rem", borderTop: "1px solid #f1f5f9" }}>
                  <button style={{ flex: 1, border: "1px solid #e2e8f0", background: "#fff", padding: "0.35rem", borderRadius: "0.375rem", fontSize: "0.6875rem", color: "#475569", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }} onClick={() => setSelectedSubTab("Unit Plans")}>
                    <Layers size={11} /> Unit Plans
                  </button>
                  <button style={{ flex: 1, border: "1px solid #e2e8f0", background: "#fff", padding: "0.35rem", borderRadius: "0.375rem", fontSize: "0.6875rem", color: "#475569", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }} onClick={() => setSelectedSubTab("Documents")}>
                    <FileText size={11} /> Documents
                  </button>
                  <button style={{ flex: 1, border: "1px solid #e2e8f0", background: "#fff", padding: "0.35rem", borderRadius: "0.375rem", fontSize: "0.6875rem", color: "#475569", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }} onClick={() => setSelectedSubTab("Videos")}>
                    <Video size={11} /> Videos
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProperties.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem 1rem", background: "#ffffff", borderRadius: "0.75rem", border: "1px solid #e2e8f0", color: "#64748b" }}>
              No focus properties found matching your filter criteria.
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
