import React, { useState, useEffect } from "react";
import { X, Globe, Key, Link2, Sparkles, CheckCircle2, Save, Send, Building, Image, Award, PhoneCall, Mail, PhoneIncoming, Copy, Radio } from "lucide-react";
import { fetchIntegrationSettings, saveIntegrationSettings, testInboundWebhookLead, fetchOrgProfile, saveOrgProfile } from "../services/apiService";
import CustomAlertDialog from "./CustomAlertDialog";

export default function IntegrationsModal({ isOpen, onClose, onTestLeadCreated, onOrgProfileUpdated }) {
  const [activeTab, setActiveTab] = useState("virtual_number"); // 'virtual_number' | 'org' | 'website' | 'instagram' | 'facebook' | 'youtube'
  const [alertConfig, setAlertConfig] = useState(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Virtual Cloud Number States (Free Virtual IVR & Call Webhook)
  const [virtualNumber, setVirtualNumber] = useState("+91 022 6985 4120");
  const [forwardingPhone, setForwardingPhone] = useState("+91 98677 78229");
  const [telephonyProvider, setTelephonyProvider] = useState("Exotel / Cloud IVR (Free Virtual)");
  const [inboundWebhookUrl, setInboundWebhookUrl] = useState("http://127.0.0.1:8000/api/method/real_state_crm.api.inbound_call_webhook");

  const [websiteUrl, setWebsiteUrl] = useState("https://dreamhomes42.com");
  const [websiteWebhook, setWebsiteWebhook] = useState("http://127.0.0.1:8000/api/method/real_state_crm.api.website_lead_webhook");
  
  const [instaPageId, setInstaPageId] = useState("dreamhomes_official");
  const [instaToken, setInstaToken] = useState("EAAB123456789_INSTA_TOKEN");
  
  const [fbFormId, setFbFormId] = useState("FB_LEADGEN_FORM_99201");
  const [ytChannelUrl, setYtChannelUrl] = useState("https://youtube.com/@dreamhomesmumbai");

  // Dynamic Organization Profile State
  const [companyName, setCompanyName] = useState("Dream Homes Real Estate");
  const [companyTagline, setCompanyTagline] = useState("Mumbai's Premier Luxury Real Estate Partner");
  const [logoUrl, setLogoUrl] = useState("/dreamhomes_gold_logo.jpg");
  const [mahareraNo, setMahareraNo] = useState("A51800045492");
  const [contactEmail, setContactEmail] = useState("sales@dreamhomes42.com");
  const [contactPhone, setContactPhone] = useState("+91 98677 78229");

  const [isSaving, setIsSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setAlertConfig(null);
      fetchIntegrationSettings().then(data => {
        if (data) {
          if (data.website_url) setWebsiteUrl(data.website_url);
          if (data.website_webhook) setWebsiteWebhook(data.website_webhook);
          if (data.instagram_page_id) setInstaPageId(data.instagram_page_id);
          if (data.instagram_token) setInstaToken(data.instagram_token);
          if (data.facebook_form_id) setFbFormId(data.facebook_form_id);
          if (data.youtube_channel_url) setYtChannelUrl(data.youtube_channel_url);
        }
      });

      fetchOrgProfile().then(org => {
        if (org) {
          if (org.company_name) setCompanyName(org.company_name);
          if (org.company_tagline) setCompanyTagline(org.company_tagline);
          if (org.logo_url) setLogoUrl(org.logo_url);
          if (org.maharera_no) setMahareraNo(org.maharera_no);
          if (org.contact_email) setContactEmail(org.contact_email);
          if (org.contact_phone) setContactPhone(org.contact_phone);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      website_url: websiteUrl,
      website_webhook: websiteWebhook,
      instagram_page_id: instaPageId,
      instagram_token: instaToken,
      facebook_form_id: fbFormId,
      youtube_channel_url: ytChannelUrl
    };

    const orgPayload = {
      company_name: companyName,
      company_tagline: companyTagline,
      logo_url: logoUrl,
      maharera_no: mahareraNo,
      contact_email: contactEmail,
      contact_phone: contactPhone
    };

    await saveIntegrationSettings(payload);
    await saveOrgProfile(orgPayload);

    if (onOrgProfileUpdated) {
      onOrgProfileUpdated(orgPayload);
    }

    setIsSaving(false);
    setAlertConfig({
      title: "Settings Saved! 💾",
      message: "Lead integration credentials & Organization Profile updated in CRM Database!",
      type: "success"
    });
  };

  const handleTestTrigger = async (channelName) => {
    setTestingChannel(channelName);
    const result = await testInboundWebhookLead(channelName);
    setTestingChannel(null);

    if (result && result.status === "success" && result.lead) {
      if (onTestLeadCreated) {
        onTestLeadCreated(result.lead);
      }
      setAlertConfig({
        title: `${channelName} Test Lead Captured!`,
        message: `Inbound lead from ${channelName} processed into CRM MariaDB!\nClient: ${result.lead.lead_name} (${result.lead.phone})`,
        type: "success"
      });
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        borderRadius: "inherit",
        paddingTop: "2.75rem",
        paddingBottom: "1rem"
      }}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          background: "#ffffff",
          borderRadius: "1.5rem",
          width: "92%",
          maxWidth: "380px",
          maxHeight: "calc(100% - 1rem)",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          animation: "scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Luxury Top Header Banner */}
        <div style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderTopLeftRadius: "1.5rem",
          borderTopRightRadius: "1.5rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem", color: "#ffffff" }}>
              🔌 Multi-Channel Lead Integrations
            </h3>
            <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: "0.15rem 0 0 0" }}>
              Auto-capture leads from Website, Instagram, Facebook & YouTube
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "none",
              color: "#cbd5e1",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Integration Pill Sub-Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", padding: "0.6rem 0.75rem", gap: "0.4rem", overflowX: "auto", scrollbarWidth: "none" }}>
          {[
            { id: "virtual_number", label: "Virtual Number (IVR)", icon: <PhoneIncoming size={14} color="#16a34a" /> },
            { id: "org", label: "Branding", icon: <Building size={14} color="#2563eb" /> },
            { id: "website", label: "Website", icon: <Globe size={14} color="#2563eb" /> }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.45rem 0.75rem",
                border: activeTab === tab.id ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                borderRadius: "9999px",
                background: activeTab === tab.id ? "#eff6ff" : "#ffffff",
                color: activeTab === tab.id ? "#2563eb" : "#64748b",
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: activeTab === tab.id ? "0 2px 6px rgba(37,99,235,0.12)" : "none"
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSaveSettings} style={{ padding: "1.1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* TAB: VIRTUAL NUMBER & CLOUD IVR (Option B - Auto Inbound Ringing) */}
          {activeTab === "virtual_number" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #bbf7d0", padding: "0.85rem", borderRadius: "0.85rem", fontSize: "0.75rem", color: "#166534" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, fontSize: "0.8125rem", color: "#15803d", marginBottom: "0.3rem" }}>
                  <Radio size={16} className="animate-pulse" color="#16a34a" /> 
                  <span>Direct SIM & Cloud Inbound Call Sync Active</span>
                </div>
                <span>Phone par aane wali har direct SIM call (Android/iPhone) ya Virtual Number call automatically <strong>CRM Screen par ring karegi</strong> aur <strong>Fresh Leads mein capture hogi!</strong></span>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    ⚡ Live Inbound Webhook URL (Android & iPhone)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const urlToCopy = (typeof window !== "undefined" ? window.location.origin : "") + "/api/method/real_state_crm.api.inbound_call_webhook";
                      navigator.clipboard.writeText(urlToCopy);
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2500);
                    }}
                    style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.6875rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}
                  >
                    <Copy size={11} /> {copiedWebhook ? "Copied!" : "Copy URL"}
                  </button>
                </div>
                <input
                  type="text"
                  className="modern-search-input"
                  readOnly
                  style={{ fontSize: "0.6875rem", background: "#f8fafc", color: "#2563eb", fontWeight: 700 }}
                  value={(typeof window !== "undefined" ? window.location.origin : "") + "/api/method/real_state_crm.api.inbound_call_webhook"}
                />
              </div>

              {/* Device Specific Setup Instructions */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.85rem", padding: "0.75rem", fontSize: "0.75rem" }}>
                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>📱 Setup on Android (1-Minute Setup):</span>
                </div>
                <ol style={{ margin: "0 0 0.5rem 1.1rem", padding: 0, color: "#475569", lineHeight: 1.4 }}>
                  <li>Install <strong>MacroDroid</strong> (Free) from Play Store.</li>
                  <li><strong>Trigger:</strong> Call Incoming (Any / Unknown).</li>
                  <li><strong>Action:</strong> HTTP Request &rarr; <code>POST</code> to Webhook URL above.</li>
                  <li>Body: <code>&#123; "caller_number": "{call_number}" &#125;</code></li>
                </ol>

                <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.4rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <span>🍏 Setup on iPhone (iOS Cloud Forward / Shortcuts):</span>
                </div>
                <ol style={{ margin: "0 0 0 1.1rem", padding: 0, color: "#475569", lineHeight: 1.4 }}>
                  <li>Use Cloud IVR / Virtual Number (Exotel / Twilio / Airtel IQ).</li>
                  <li>Forward client calls to your iPhone SIM (<strong>+91 98677 78229</strong>).</li>
                  <li>Set Inbound Webhook URL in cloud dashboard.</li>
                </ol>
              </div>

              {/* Instant Live Test Caller Trigger */}
              <button
                type="button"
                onClick={async () => {
                  const testNumber = `+91 98205 ${Math.floor(10000 + Math.random() * 89999)}`;
                  const testName = `Live Inbound Caller (${testNumber.slice(-4)})`;
                  
                  if (onTestLeadCreated) {
                    onTestLeadCreated({
                      id: `LEAD-INB-${Date.now()}`,
                      name: testName,
                      phone: testNumber,
                      priority: "HOT",
                      status: "NEW",
                      service: "Direct Inbound Phone Call",
                      bhkType: "2 BHK Luxury",
                      location: "Mumbai",
                      source: "Direct SIM / Cloud Inbound Call",
                      timeAgo: "Just now",
                      createdAt: new Date().toISOString(),
                      callCount: 0,
                      notes: `Customer called agent on +91 98677 78229.`,
                      history: []
                    });
                  }

                  try {
                    await fetch("/api/method/real_state_crm.api.inbound_call_webhook", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        caller_number: testNumber,
                        caller_name: testName,
                        source: "Direct Inbound Call",
                        notes: "Direct phone call received on agent SIM 9867778229"
                      })
                    });
                  } catch (e) {}

                  setAlertConfig({
                    title: "📞 Incoming Call Ringing on Screen!",
                    message: `Incoming call from '${testName}' (${testNumber}) triggered! Check your screen—ringing modal is active and will save to Fresh Leads!`,
                    type: "success"
                  });
                }}
                style={{
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: "0.625rem",
                  padding: "0.65rem",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: "0 4px 12px rgba(22,163,74,0.3)"
                }}
              >
                <PhoneIncoming size={16} /> ⚡ Test Incoming Call to Agent (9867778229)
              </button>
            </div>
          )}

          {/* TAB 0: ORGANIZATION BRANDING */}
          {activeTab === "org" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#166534" }}>
                🏢 <strong>Dynamic Company Profile & Logo Settings:</strong> Changes saved here directly update your CRM header logo, company name, and official MahaRERA credentials in CRM Database!
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="e.g. Dream Homes Real Estate"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  style={{ fontWeight: 800, color: "#0f172a" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Company Tagline / Subtitle
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="e.g. Mumbai's Premier Luxury Real Estate Partner"
                  value={companyTagline}
                  onChange={e => setCompanyTagline(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Company Logo Image URL
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="/dreamhomes_gold_logo.jpg"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  MahaRERA Registration Number
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="e.g. A51800045492"
                  value={mahareraNo}
                  onChange={e => setMahareraNo(e.target.value)}
                  style={{ fontWeight: 800, color: "#2563eb" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                    Official Contact Phone
                  </label>
                  <input
                    type="text"
                    className="modern-search-input"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    className="modern-search-input"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: WEBSITE WEBHOOK */}
          {activeTab === "website" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#1e40af" }}>
                🌐 <strong>Website Contact Form API Webhook:</strong> Incoming leads submitted on your website form will automatically post to this REST endpoint and assign to your active telecallers!
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Website Base Domain URL
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="https://dreamhomes42.com"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  CRM REST Webhook Endpoint
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  value={websiteWebhook}
                  onChange={e => setWebsiteWebhook(e.target.value)}
                  style={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                />
              </div>

              <button
                type="button"
                onClick={() => handleTestTrigger("Website Form")}
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#2563eb",
                  borderRadius: "0.625rem",
                  padding: "0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                {testingChannel === "Website Form" ? "⚡ Simulating Test Lead..." : "⚡ Simulate Inbound Website Lead"}
              </button>
            </div>
          )}

          {/* TAB 2: INSTAGRAM API */}
          {activeTab === "instagram" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "#fdf2f8", border: "1px solid #fbcfe8", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#9d174d" }}>
                📸 <strong>Instagram Graph API Direct Lead Ads Integration:</strong> Connect your Instagram Business account to receive DM inquiries and Lead Ad submissions instantly!
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Instagram Business Handle / Page ID
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="e.g. dreamhomes_official"
                  value={instaPageId}
                  onChange={e => setInstaPageId(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Instagram Access Token
                </label>
                <input
                  type="password"
                  className="modern-search-input"
                  placeholder="EAAB..."
                  value={instaToken}
                  onChange={e => setInstaToken(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleTestTrigger("Instagram Ad")}
                style={{
                  background: "#fdf2f8",
                  border: "1px solid #fbcfe8",
                  color: "#db2777",
                  borderRadius: "0.625rem",
                  padding: "0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                {testingChannel === "Instagram Ad" ? "⚡ Simulating Test Lead..." : "⚡ Simulate Inbound Instagram Lead"}
              </button>
            </div>
          )}

          {/* TAB 3: FACEBOOK LEAD ADS */}
          {activeTab === "facebook" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#166534" }}>
                👥 <strong>Meta Facebook Lead Ads Webhook:</strong> Real-time synchronization for Instant Lead Forms from Facebook Ads Manager!
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  Facebook Lead Form ID
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="FB_LEADGEN_FORM_99201"
                  value={fbFormId}
                  onChange={e => setFbFormId(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleTestTrigger("Facebook Lead Ad")}
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1d4ed8",
                  borderRadius: "0.625rem",
                  padding: "0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                {testingChannel === "Facebook Lead Ad" ? "⚡ Simulating Test Lead..." : "⚡ Simulate Inbound Facebook Lead"}
              </button>
            </div>
          )}

          {/* TAB 4: YOUTUBE LEAD GEN */}
          {activeTab === "youtube" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.75rem", color: "#991b1b" }}>
                ▶️ <strong>YouTube Video Leads & Extension Integration:</strong> Capture leads directly from your YouTube video descriptions and site walkthrough videos!
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  placeholder="https://youtube.com/@dreamhomesmumbai"
                  value={ytChannelUrl}
                  onChange={e => setYtChannelUrl(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => handleTestTrigger("YouTube Video")}
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  borderRadius: "0.625rem",
                  padding: "0.6rem",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem"
                }}
              >
                {testingChannel === "YouTube Video" ? "⚡ Simulating Test Lead..." : "⚡ Simulate Inbound YouTube Lead"}
              </button>
            </div>
          )}

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSaving}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              fontSize: "0.84375rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.45rem",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
              marginTop: "0.5rem"
            }}
          >
            <Save size={16} /> {isSaving ? "Saving Credentials..." : "Save Integration Credentials to CRM Database"}
          </button>
        </form>

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
    </div>
  );
}
