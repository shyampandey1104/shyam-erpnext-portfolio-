import React, { useState } from "react";
import { Send, X, CheckCircle, MessageSquare } from "lucide-react";

export default function WhatsAppReportModal({ lead, onClose }) {
  const [reportType, setReportType] = useState("Srishti Oasis – Bhandup (West)");

  const templates = {
    "Srishti Oasis – Bhandup (West)": `Hello ${lead?.name || 'Customer'},\n\n✨ *Srishti Oasis – Bhandup (West)*\n*THE GMLR – Get More Life. Less Rush.*\n\nExperience premium living with 1, 2 & 3 BHK Sun-Deck Residences at Mumbai's 1st Residential Project with Direct Access to GMLR!\n\n🏡 *Configuration & Pricing (All Inclusive):*\n• *1 BHK*: 425 - 460 sq.ft – ₹1.08 Cr to ₹1.19 Cr\n• *2 BHK*: 620 - 660 sq.ft – ₹1.59 Cr to ₹1.73 Cr\n• *3 BHK*: 855 - 910 sq.ft – ₹2.04 Cr to ₹2.26 Cr\n\n⭐ *Project Highlights:*\n✔️ 36-Storey Premium Residential Tower\n✔️ Fully Modular Kitchen with every apartment\n✔️ 50+ Lifestyle Amenities (40,000+ sq.ft Podium & 11,000+ sq.ft Sky Lounge)\n✔️ 12 Months Holiday EMI & Flexi Pay Plan\n\n📍 *MahaRERA No.*: P51800051004\n\n📞 Book your exclusive site visit today!\n\n*Dream Homes Real Estate*\nSujit Rajak (Sourcing Manager): 8424908963`,
    "Kalpataru Vian Brochure & Pricing": `Hello ${lead?.name || 'Customer'},\n\n🏢 *Kalpataru Vian (Andheri West)*\n\nHere is the brochure & pricing detail for Kalpataru Vian.\n\n• *Configuration*: 2 & 3 BHK Luxury Residences\n• *Carpet Area*: 780 - 1150 sq.ft.\n• *Price*: ₹2.15 Cr Onwards\n• *Location*: Prime Link Road / Metro Line 2A Connectivity\n\nPlease let us know if you would like to book a VIP site visit!`,
    "Godrej Horizon Wadala Brochure": `Hello ${lead?.name || 'Customer'},\n\n🌟 *Godrej Horizon (Wadala Mumbai)*\n\n• *Configuration*: 2 & 3 BHK Sea View Homes\n• *Carpet Area*: 680 - 1050 sq.ft.\n• *Price*: ₹1.85 Cr - ₹3.20 Cr\n• *Highlights*: Private 5-Acre Parkland, 5 Mins from Eastern Freeway\n\nReply to this message to book your site visit!`,
    "Oberoi Sky City Borivali East": `Hello ${lead?.name || 'Customer'},\n\n🌆 *Oberoi Sky City (Borivali East)*\n\n• *Configuration*: 3 & 4 BHK Ultra Luxury Residences\n• *Carpet Area*: 1050 - 1980 sq.ft.\n• *Price*: ₹3.40 Cr - ₹6.20 Cr\n• *Highlights*: Integrated 25-Acre Township on Western Express Highway\n\nReply to this message for site visit booking!`,
    "Site Visit Confirmation & Location": `Hello ${lead?.name || 'Customer'},\n\nYour Site Visit is confirmed!\n\n📍 Venue: Sales Experience Center, ${lead?.location || 'Mumbai'}\n⏰ Time: Scheduled Today\n🚗 Pick & Drop Cab: Driver Details Shared\n\nSee you soon!`
  };

  const [customMsg, setCustomMsg] = useState(templates["Srishti Oasis – Bhandup (West)"]);

  if (!lead) return null;

  const handleTemplateChange = (e) => {
    const selected = e.target.value;
    setReportType(selected);
    if (templates[selected]) {
      setCustomMsg(templates[selected]);
    }
  };

  const handleSend = () => {
    let cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, "") : "919820591823";
    if (cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    const text = encodeURIComponent(customMsg);
    
    // Free official WhatsApp Deep Link (Works on Web & Mobile WhatsApp App)
    const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
    window.open(waUrl, "_blank");
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="dialer-modal-content" style={{ maxWidth: "390px", width: "94%" }}>
        <div className="dialer-header" style={{ background: "linear-gradient(135deg, #15803d, #16a34a)" }}>
          <div className="dialer-caller-info">
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MessageSquare size={18} color="#ffffff" />
              <span className="dialer-caller-name">Send Free WhatsApp Report</span>
            </div>
            <span className="dialer-caller-sub">To: {lead.name} (+{lead.phone})</span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div className="dialer-body">
          <div className="form-group">
            <label className="form-label">Select Instant WhatsApp Template</label>
            <select
              className="select-input"
              value={reportType}
              onChange={handleTemplateChange}
            >
              {Object.keys(templates).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Pre-filled WhatsApp Message Content</label>
            <textarea
              className="textarea-input"
              style={{ minHeight: "140px", fontSize: "0.8125rem", lineHeight: "1.4" }}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
            />
          </div>
        </div>

        <div className="dialer-footer">
          <button className="end-call-btn" onClick={onClose} style={{ background: "#94a3b8" }}>
            Cancel
          </button>
          <button className="save-call-btn" onClick={handleSend} style={{ background: "#25d366", color: "#ffffff" }}>
            <Send size={16} style={{ marginRight: 6 }} />
            <span>Open WhatsApp App & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
