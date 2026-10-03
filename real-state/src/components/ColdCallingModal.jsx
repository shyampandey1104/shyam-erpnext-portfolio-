import React, { useState } from "react";
import { X, Phone, MessageSquare, Send, CheckCircle2, ChevronDown, PhoneCall } from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";

export default function ColdCallingModal({ isOpen, onClose, onLogCall }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [activeTab, setActiveTab] = useState("cold-call"); // 'cold-call' or 'cold-meeting'
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);

  if (!isOpen) return null;

  const handleKeyPress = (num) => {
    if (phoneNumber.length < 10) {
      setPhoneNumber(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleDirectCall = () => {
    const cleanNum = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanNum.length < 10) {
      setAlertConfig({ title: "Invalid Phone Number", message: "Please enter a valid 10-digit mobile number to place a call.", type: "warning" });
      return;
    }
    const fullPhone = `${countryCode}${cleanNum}`;
    
    // Direct Native Call (Triggers SIM Card dialer on mobile phone / Mac)
    window.location.href = `tel:${fullPhone}`;

    if (onLogCall) {
      onLogCall({
        id: `COLD-${Date.now()}`,
        name: `Cold Lead (${cleanNum})`,
        phone: fullPhone,
        status: "COLD_CALL",
        timeAgo: "Just Now"
      });
    }
  };

  const handleSendFeedbackCode = (method) => {
    const cleanNum = phoneNumber.replace(/[^0-9]/g, "");
    if (cleanNum.length < 10) {
      setAlertConfig({ title: "Invalid Phone Number", message: "Please enter a valid 10-digit mobile number", type: "warning" });
      return;
    }
    const fullPhone = `${countryCode}${cleanNum}`;
    if (method === "WhatsApp") {
      const waMsg = encodeURIComponent(`Hello! Thank you for speaking with LeadCall CRM. Please rate our cold call feedback code: ${Math.floor(1000 + Math.random() * 9000)}`);
      window.open(`https://api.whatsapp.com/send?phone=${countryCode.replace('+', '')}${cleanNum}&text=${waMsg}`, "_blank");
    } else {
      setAlertConfig({ title: "Feedback Code Sent!", message: `Feedback Code sent via SMS to ${fullPhone}`, type: "success" });
    }
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: "360px", width: "92%", borderRadius: "1.25rem", padding: "1.25rem" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0f172a" }}>
                {activeTab === "cold-meeting" ? "Cold Meeting" : "Cold Call Dialer"}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#64748b" }}>Instant Lead Dial & Direct SIM Call</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="sub-tabs-scroll" style={{ justifyContent: "center", marginBottom: "1rem" }}>
          <button 
            className={`sub-tab-chip ${activeTab === "cold-call" ? "active" : ""}`}
            onClick={() => setActiveTab("cold-call")}
          >
            📞 Cold Call
          </button>
          <button 
            className={`sub-tab-chip ${activeTab === "cold-meeting" ? "active" : ""}`}
            onClick={() => setActiveTab("cold-meeting")}
          >
            🤝 Cold Meeting
          </button>
        </div>

        {/* Input Box */}
        <div className="dialer-input-box" style={{ marginBottom: "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", background: "#ffffff", padding: "0.25rem 0.5rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}>
            <span>{countryCode}</span>
            <ChevronDown size={14} color="#64748b" />
          </div>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Mobile Number"
            style={{ width: "100%", border: "none", background: "transparent", fontSize: "1.125rem", fontWeight: "700", outline: "none", letterSpacing: "0.05em" }}
          />
        </div>

        {/* Keypad Grid */}
        <div style={{ display: "flex", justifyContent: "center", margin: "0.75rem 0" }}>
          <div className="keypad-grid">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "⌫"].map((btn) => (
              <button 
                key={btn}
                className="keypad-btn"
                onClick={() => {
                  if (btn === "⌫") handleDelete();
                  else if (btn !== "*") handleKeyPress(btn);
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* DIRECT CALL NOW BUTTON */}
        <button
          onClick={handleDirectCall}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            color: "#ffffff",
            border: "none",
            fontWeight: 700,
            fontSize: "0.9375rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
            marginBottom: "1rem"
          }}
        >
          <PhoneCall size={20} />
          <span>Direct Call Now</span>
        </button>

        {/* Send Feedback Code Actions */}
        <div className="send-code-options">
          <div style={{ fontSize: "0.8125rem", fontWeight: "600", color: "#475569", textAlign: "center", marginBottom: "0.5rem" }}>
            Send Feedback Code via
          </div>
          <div className="code-btn-row">
            <button className="code-action-btn sms" onClick={() => handleSendFeedbackCode("SMS")}>
              <MessageSquare size={16} />
              SMS
            </button>
            <button className="code-action-btn whatsapp" onClick={() => handleSendFeedbackCode("WhatsApp")}>
              <Send size={16} />
              WhatsApp
            </button>
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
    </div>
  );
}
