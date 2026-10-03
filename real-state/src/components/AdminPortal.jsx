import React, { useState } from "react";
import {
  Users, Shield, PhoneCall, Tag, DollarSign, FileText, Upload,
  RefreshCw, Layers, Building, MessageSquare, Share2, FileCheck
} from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";

export default function AdminPortal({ userProfile, onSwitchToCallingApp }) {
  // Tab order: dashboard -> users -> import -> sources -> whatsapp -> pricing -> dispositions -> reports
  const [adminTab, setAdminTab] = useState("dashboard");

  // User Management State
  const [usersList] = useState([
    { id: 1, name: "Rajesh Kumar", email: "rajesh@saarva.com", role: "Telecaller", status: "Active", areas: ["Andheri", "Bandra"], leadCap: 50 },
    { id: 2, name: "Priya Sharma", email: "priya@saarva.com", role: "Telecaller", status: "Active", areas: ["Powai", "Thane"], leadCap: 45 },
    { id: 3, name: "Amit Patel", email: "amit@saarva.com", role: "Mining Caller", status: "Active", areas: ["Navi Mumbai"], leadCap: 30 },
    { id: 4, name: "Sneha Desai", email: "sneha@saarva.com", role: "Team Leader", status: "Active", areas: ["All"], leadCap: 100 },
    { id: 5, name: "Vikram Singh", email: "vikram@saarva.com", role: "Telecaller", status: "Inactive", areas: ["Goregaon"], leadCap: 40 }
  ]);

  // Lead Sources State
  const [leadSources] = useState([
    { id: 1, name: "Google Ads - 3BHK Campaign", platform: "Paid Ads", defaultService: "Home Buying", tag: "#google_3bhk", dailyAvg: 42, status: "Active" },
    { id: 2, name: "Instagram Real Estate Lead Ads", platform: "Paid Ads", defaultService: "PDI Inspection", tag: "#meta_insta", dailyAvg: 28, status: "Active" },
    { id: 3, name: "Website Direct Inquiry Form", platform: "Website", defaultService: "Auto-detect", tag: "#organic", dailyAvg: 19, status: "Active" },
    { id: 4, name: "Thane Property Landing Page", platform: "Website", defaultService: "Home Buying", tag: "#lp_thane", dailyAvg: 16, status: "Paused" }
  ]);

  // Disposition Codes State
  const [dispositionsList] = useState([
    { id: 1, code: "Interested - Visit Scheduled", type: "Interested", priority: "HOT", autoFollowup: "Yes", target: "Mining Team" },
    { id: 2, code: "Callback Requested", type: "Callback", priority: "WARM", autoFollowup: "No", target: "Follow-up Queue" },
    { id: 3, code: "Needs More Info", type: "Interested", priority: "WARM", autoFollowup: "Yes", target: "Follow-up Queue" },
    { id: 4, code: "Not Interested - Budget", type: "Not Interested", priority: "COLD", autoFollowup: "No", target: "Closed Queue" },
    { id: 5, code: "Wrong Number", type: "Closed", priority: "COLD", autoFollowup: "No", target: "Closed Queue" },
    { id: 6, code: "Converted - Booked", type: "Closed", priority: "HOT", autoFollowup: "Yes", target: "Mining Team" }
  ]);

  // Real Estate Builder Property Inventory & Pricing List
  const [propertyPricingList] = useState([
    {
      id: 1,
      builder: "Lodha Group",
      projectName: "Lodha Woods",
      location: "Kandivali East",
      bhk: "3 BHK",
      carpetArea: "1,150 sq ft",
      launchPrice: "₹ 2.15 Cr",
      discountOffer: "5% Festive Off + Stamp Duty Free",
      bookingToken: "₹ 2.00 Lakh"
    },
    {
      id: 2,
      builder: "Godrej Properties",
      projectName: "Godrej Emerald",
      location: "Thane West",
      bhk: "2 BHK",
      carpetArea: "780 sq ft",
      launchPrice: "₹ 1.28 Cr",
      discountOffer: "Spot Discount ₹ 3.5 Lakhs",
      bookingToken: "₹ 1.00 Lakh"
    },
    {
      id: 3,
      builder: "Oberoi Realty",
      projectName: "Oberoi Sky City",
      location: "Borivali East",
      bhk: "4 BHK Luxury",
      carpetArea: "1,920 sq ft",
      launchPrice: "₹ 4.85 Cr",
      discountOffer: "Zero Maintenance for 2 Years",
      bookingToken: "₹ 5.00 Lakh"
    }
  ]);

  // WhatsApp Templates State
  const [whatsappTemplates] = useState([
    { id: 1, name: "Sample Property Inspection Report", tag: "sample report", queue: "fresh", status: "Active", stats: "850 / 820 / 650" },
    { id: 2, name: "Site Visit Confirmation & Reminder", tag: "visit reminder", queue: "mining", status: "Active", stats: "320 / 310 / 290" },
    { id: 3, name: "Token Payment Link & Invoice", tag: "payment link", queue: "all", status: "Active", stats: "450 / 440 / 380" }
  ]);

  // Sample Reports State
  const [sampleReports] = useState([
    { id: 1, service: "PDI Inspection", fileName: "PDI_Sample_Report_v2.pdf", status: "Active", uploadedDate: "01/10/2026" },
    { id: 2, service: "Home Buying Valuation", fileName: "HomeBuying_Valuation_Report.pdf", status: "Active", uploadedDate: "15/09/2026" },
    { id: 3, service: "Seepage & Dampness Audit", fileName: "Seepage_Inspection_Sample.pdf", status: "Active", uploadedDate: "01/11/2026" }
  ]);

  const [excelUploaded, setExcelUploaded] = useState(false);

  const handleFileUpload = (e) => {
    e.preventDefault();
    setExcelUploaded(true);
    setTimeout(() => {
      setExcelUploaded(false);
      setAlertConfig({ title: "Leads Imported!", message: "✅ 150 Real Estate Leads imported successfully from Excel into MariaDB!", type: "success" });
    }, 1500);
  };

  return (
    <div className="admin-portal-container">
      {alertConfig && (
        <CustomAlertDialog
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig(null)}
        />
      )}
      {/* Top Admin Header Bar */}
      <div className="admin-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.4rem" }}>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Shield size={18} color="#2563eb" /> Saarva Admin Control
          </h2>
          <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Admin: {userProfile?.name || "Ibrahim"}</span>
        </div>

        <button
          onClick={onSwitchToCallingApp}
          style={{
            background: "#2563eb",
            color: "#ffffff",
            border: "none",
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <PhoneCall size={13} />
          <span>Calling App</span>
        </button>
      </div>

      {/* Admin Mobile Horizontal Scrollable Pills - SEQUENCED AS REQUESTED */}
      <div className="horizontal-filter-scroll" style={{ marginBottom: "1rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.4rem" }}>
        {/* 1. Dashboard */}
        <button className={`admin-tab-btn ${adminTab === "dashboard" ? "active" : ""}`} onClick={() => setAdminTab("dashboard")}>
          <Layers size={13} /> Dashboard
        </button>

        {/* 2. User Roles (Right next to Dashboard) */}
        <button className={`admin-tab-btn ${adminTab === "users" ? "active" : ""}`} onClick={() => setAdminTab("users")}>
          <Users size={13} /> User Roles
        </button>

        {/* 3. Lead Import */}
        <button className={`admin-tab-btn ${adminTab === "import" ? "active" : ""}`} onClick={() => setAdminTab("import")}>
          <Upload size={13} /> Lead Import
        </button>

        {/* 4. Lead Sources */}
        <button className={`admin-tab-btn ${adminTab === "sources" ? "active" : ""}`} onClick={() => setAdminTab("sources")}>
          <Share2 size={13} /> Lead Sources
        </button>

        {/* 5. WhatsApp Templates */}
        <button className={`admin-tab-btn ${adminTab === "whatsapp" ? "active" : ""}`} onClick={() => setAdminTab("whatsapp")}>
          <MessageSquare size={13} /> WhatsApp Templates
        </button>

        {/* 6. Property Pricing */}
        <button className={`admin-tab-btn ${adminTab === "pricing" ? "active" : ""}`} onClick={() => setAdminTab("pricing")}>
          <Building size={13} /> Property Pricing
        </button>

        {/* 7. Dispositions */}
        <button className={`admin-tab-btn ${adminTab === "dispositions" ? "active" : ""}`} onClick={() => setAdminTab("dispositions")}>
          <Tag size={13} /> Dispositions
        </button>

        {/* 8. Sample Reports */}
        <button className={`admin-tab-btn ${adminTab === "reports" ? "active" : ""}`} onClick={() => setAdminTab("reports")}>
          <FileCheck size={13} /> Sample Reports
        </button>
      </div>

      {/* 1. ADMIN DASHBOARD SCREEN */}
      {adminTab === "dashboard" && (
        <div>
          {/* Stat Cards Grid */}
          <div className="metrics-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
            <div className="metric-card" style={{ padding: "0.75rem" }}>
              <span className="metric-title" style={{ fontSize: "0.6875rem" }}>Total Leads Today</span>
              <div className="metric-value" style={{ fontSize: "1.25rem", color: "#2563eb" }}>156</div>
            </div>
            <div className="metric-card" style={{ padding: "0.75rem" }}>
              <span className="metric-title" style={{ fontSize: "0.6875rem" }}>Fresh Assigned</span>
              <div className="metric-value" style={{ fontSize: "1.25rem", color: "#0f172a" }}>89</div>
            </div>
            <div className="metric-card" style={{ padding: "0.75rem" }}>
              <span className="metric-title" style={{ fontSize: "0.6875rem" }}>Hot Leads</span>
              <div className="metric-value" style={{ fontSize: "1.25rem", color: "#ef4444" }}>23</div>
            </div>
            <div className="metric-card" style={{ padding: "0.75rem" }}>
              <span className="metric-title" style={{ fontSize: "0.6875rem" }}>Visits Scheduled</span>
              <div className="metric-value" style={{ fontSize: "1.25rem", color: "#f97316" }}>12</div>
            </div>
          </div>

          {/* Quick Actions */}
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "0.5rem", color: "#0f172a" }}>Quick Admin Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <button className="admin-action-btn" onClick={() => setAdminTab("users")}>
              <Users size={15} /> Manage Telecallers & User Roles
            </button>
            <button className="admin-action-btn" onClick={() => setAdminTab("import")}>
              <Upload size={15} /> Lead Import (Upload Excel / CSV)
            </button>
            <button className="admin-action-btn" onClick={() => setAdminTab("sources")}>
              <Share2 size={15} /> Configure Lead Sources
            </button>
            <button className="admin-action-btn" onClick={() => setAdminTab("whatsapp")}>
              <MessageSquare size={15} /> Edit WhatsApp Templates
            </button>
            <button className="admin-action-btn" onClick={() => setAdminTab("pricing")}>
              <Building size={15} /> Builder Property Pricing Inventory
            </button>
          </div>
        </div>
      )}

      {/* 2. USER ROLES & MANAGEMENT */}
      {adminTab === "users" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>👥 Telecallers & User Roles ({usersList.length})</span>
            <button style={{ background: "#2563eb", color: "#ffffff", border: "none", padding: "0.35rem 0.65rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
              + Add User
            </button>
          </div>
          {usersList.map((u) => (
            <div key={u.id} className="lead-card" style={{ padding: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9375rem" }}>{u.name}</div>
                <span style={{ background: u.status === "Active" ? "#dcfce7" : "#fee2e2", color: u.status === "Active" ? "#15803d" : "#dc2626", padding: "0.1rem 0.4rem", borderRadius: "4px", fontSize: "0.6875rem", fontWeight: 700 }}>{u.status}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Email: {u.email} • Role: <strong style={{ color: "#2563eb" }}>{u.role}</strong></div>
              <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: "0.25rem" }}>Lead Cap: {u.leadCap} leads/day</div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LEAD IMPORT SCREEN */}
      {adminTab === "import" && (
        <div className="chart-card" style={{ padding: "1rem" }}>
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
            📥 Lead Import
          </h3>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>Upload Excel / CSV files to import real estate leads</p>

          <div style={{
            border: "2px dashed #cbd5e1",
            borderRadius: "0.75rem",
            padding: "1.5rem 1rem",
            textAlign: "center",
            background: "#f8fafc",
            marginBottom: "1rem"
          }}>
            <FileText size={36} color="#94a3b8" style={{ marginBottom: "0.5rem" }} />
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#0f172a" }}>Drag & Drop Excel File</div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.75rem" }}>or click to browse from device</div>

            <label style={{
              background: "#2563eb",
              color: "#ffffff",
              padding: "0.45rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}>
              <Upload size={14} />
              <span>Upload File</span>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", fontSize: "0.6875rem" }}>
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.5rem", borderRadius: "0.5rem" }}>
              <strong>1. Upload File</strong>
              <div style={{ color: "#64748b" }}>CSV / Excel</div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.5rem", borderRadius: "0.5rem" }}>
              <strong>2. Map Columns</strong>
              <div style={{ color: "#64748b" }}>CRM Fields</div>
            </div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.5rem", borderRadius: "0.5rem" }}>
              <strong>3. Assign Leads</strong>
              <div style={{ color: "#64748b" }}>By Area</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. LEAD SOURCES */}
      {adminTab === "sources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>🌐 Lead Sources ({leadSources.length})</span>
          </div>
          {leadSources.map((ls) => (
            <div key={ls.id} className="lead-card" style={{ padding: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{ls.name}</div>
                <span style={{ fontSize: "0.6875rem", background: "#dcfce7", color: "#15803d", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{ls.status}</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                Platform: {ls.platform} • Tag: {ls.tag} • Daily Avg: <strong>{ls.dailyAvg} leads</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. WHATSAPP TEMPLATES */}
      {adminTab === "whatsapp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>💬 WhatsApp Message Templates</span>
          </div>
          {whatsappTemplates.map((wt) => (
            <div key={wt.id} className="lead-card" style={{ padding: "0.875rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "#0f172a" }}>{wt.name}</div>
                <span style={{ background: "#dcfce7", color: "#15803d", padding: "0.15rem 0.4rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: 700 }}>
                  ● {wt.status}
                </span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                tag: {wt.tag} • Queue: {wt.queue} • Stats: {wt.stats}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. PROPERTY PRICING */}
      {adminTab === "pricing" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>🏢 Builder Property Pricing</span>
          </div>
          {propertyPricingList.map((item) => (
            <div key={item.id} className="lead-card" style={{ padding: "0.875rem", borderLeft: "4px solid #2563eb" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "#0f172a" }}>{item.projectName}</div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>🏗️ {item.builder}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#15803d" }}>{item.launchPrice}</div>
                  <span style={{ fontSize: "0.6875rem", color: "#2563eb", fontWeight: 700 }}>{item.bhk}</span>
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#475569" }}>Offer: 🎁 {item.discountOffer}</div>
            </div>
          ))}
        </div>
      )}

      {/* 7. DISPOSITIONS */}
      {adminTab === "dispositions" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>🏷️ Disposition Codes</span>
          </div>
          {dispositionsList.map((d) => (
            <div key={d.id} className="lead-card" style={{ padding: "0.875rem" }}>
              <div style={{ fontWeight: 800, color: "#0f172a" }}>{d.code}</div>
              <div style={{ fontSize: "0.75rem", color: "#475569" }}>Priority: {d.priority} • Target: {d.target}</div>
            </div>
          ))}
        </div>
      )}

      {/* 8. SAMPLE REPORTS */}
      {adminTab === "reports" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div className="chart-title-row" style={{ marginBottom: "0.25rem" }}>
            <span className="chart-title" style={{ fontSize: "0.875rem" }}>📄 Sample Reports</span>
          </div>
          {sampleReports.map((sr) => (
            <div key={sr.id} className="lead-card" style={{ padding: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{sr.service}</div>
                <span style={{ fontSize: "0.6875rem", color: "#2563eb", background: "#eff6ff", padding: "0.15rem 0.4rem", borderRadius: "4px" }}>PDF Document</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                File: 📄 {sr.fileName} • Uploaded: {sr.uploadedDate}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
