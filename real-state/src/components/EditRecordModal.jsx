import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Edit3, AlertCircle } from "lucide-react";
import { validateName, validatePhone, validateEmail, validateRequiredText } from "../utils/validators";

export default function EditRecordModal({ isOpen, onClose, record, recordType, onSave }) {
  const [formData, setFormData] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      setErrorMsg("");
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrorMsg("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check Phone validation if phone exists
    if (formData.phone) {
      const phoneRes = validatePhone(formData.phone);
      if (!phoneRes.isValid) {
        setErrorMsg(phoneRes.error);
        return;
      }
    }

    // Check Email validation if email exists
    if (formData.email) {
      const emailRes = validateEmail(formData.email, false);
      if (!emailRes.isValid) {
        setErrorMsg(emailRes.error);
        return;
      }
    }

    // Check Title/Name required validation
    const nameVal = formData.title || formData.name || formData.property || formData.project;
    if (nameVal !== undefined) {
      const nameRes = validateRequiredText(nameVal, "Title/Name", 2);
      if (!nameRes.isValid) {
        setErrorMsg(nameRes.error);
        return;
      }
    }

    onSave(formData);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(6px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.75rem",
        overflowY: "auto"
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#ffffff",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "390px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          border: "1px solid #cbd5e1",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Edit3 size={15} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>
                Edit {recordType || "Record"}
              </h3>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: "0.1rem 0 0 0" }}>
                Update details with real-time validation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#ffffff",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", overflowY: "auto", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          
          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "0.5rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {/* Title / Name */}
          {(formData.title !== undefined || formData.name !== undefined || formData.property !== undefined || formData.project !== undefined) && (
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                {formData.title !== undefined ? "Title / Project" : (formData.property !== undefined ? "Property Name" : (formData.project !== undefined ? "Project" : "Name"))} *
              </label>
              <input
                type="text"
                className="modern-search-input"
                value={formData.title || formData.name || formData.property || formData.project || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.title !== undefined) handleChange("title", val);
                  else if (formData.name !== undefined) handleChange("name", val);
                  else if (formData.property !== undefined) handleChange("property", val);
                  else if (formData.project !== undefined) handleChange("project", val);
                }}
                required
              />
            </div>
          )}

          {/* Location / Locality / Venue */}
          {(formData.location !== undefined || formData.locality !== undefined || formData.venue !== undefined) && (
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                {formData.venue !== undefined ? "Venue" : "Location / Locality"}
              </label>
              <input
                type="text"
                className="modern-search-input"
                value={formData.location || formData.locality || formData.venue || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.location !== undefined) handleChange("location", val);
                  else if (formData.locality !== undefined) handleChange("locality", val);
                  else if (formData.venue !== undefined) handleChange("venue", val);
                }}
              />
            </div>
          )}

          {/* Price / Budget / Area / Duration */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {(formData.price !== undefined || formData.priceRange !== undefined || formData.budget !== undefined) && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                  Price / Budget
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  value={formData.price || formData.priceRange || formData.budget || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (formData.price !== undefined) handleChange("price", val);
                    else if (formData.priceRange !== undefined) handleChange("priceRange", val);
                    else if (formData.budget !== undefined) handleChange("budget", val);
                  }}
                />
              </div>
            )}

            {(formData.bhk !== undefined || formData.area !== undefined || formData.duration !== undefined || formData.size !== undefined) && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                  {formData.bhk !== undefined ? "BHK Config" : (formData.duration !== undefined ? "Duration" : (formData.size !== undefined ? "File Size" : "Carpet Area"))}
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  value={formData.bhk || formData.duration || formData.size || formData.area || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (formData.bhk !== undefined) handleChange("bhk", val);
                    else if (formData.duration !== undefined) handleChange("duration", val);
                    else if (formData.size !== undefined) handleChange("size", val);
                    else if (formData.area !== undefined) handleChange("area", val);
                  }}
                />
              </div>
            )}
          </div>

          {/* Client / Owner / Phone / Status */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {(formData.client !== undefined || formData.owner !== undefined || formData.agent !== undefined) && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                  {formData.client !== undefined ? "Client Name" : (formData.owner !== undefined ? "Owner" : "Agent")}
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  value={formData.client || formData.owner || formData.agent || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (formData.client !== undefined) handleChange("client", val);
                    else if (formData.owner !== undefined) handleChange("owner", val);
                    else if (formData.agent !== undefined) handleChange("agent", val);
                  }}
                />
              </div>
            )}

            {(formData.phone !== undefined || formData.status !== undefined || formData.tag !== undefined) && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                  {formData.phone !== undefined ? "Phone (10 Digits)" : (formData.status !== undefined ? "Status" : "Tag")}
                </label>
                <input
                  type="text"
                  className="modern-search-input"
                  value={formData.phone || formData.status || formData.tag || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (formData.phone !== undefined) handleChange("phone", val);
                    else if (formData.status !== undefined) handleChange("status", val);
                    else if (formData.tag !== undefined) handleChange("tag", val);
                  }}
                />
              </div>
            )}
          </div>

          {/* Email if present */}
          {formData.email !== undefined && (
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Email Address
              </label>
              <input
                type="email"
                className="modern-search-input"
                value={formData.email || ""}
                onChange={e => handleChange("email", e.target.value)}
              />
            </div>
          )}

          {/* Date / Time / Slot */}
          {(formData.date !== undefined || formData.time !== undefined || formData.slot !== undefined) && (
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                Date / Time / Slot
              </label>
              <input
                type="text"
                className="modern-search-input"
                value={formData.date || formData.time || formData.slot || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.date !== undefined) handleChange("date", val);
                  else if (formData.time !== undefined) handleChange("time", val);
                  else if (formData.slot !== undefined) handleChange("slot", val);
                }}
              />
            </div>
          )}

          {/* Agenda / Details / Topic */}
          {(formData.agenda !== undefined || formData.topic !== undefined || formData.category !== undefined) && (
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", display: "block", marginBottom: "0.25rem" }}>
                {formData.agenda !== undefined ? "Agenda / Notes" : (formData.topic !== undefined ? "Call Topic" : "Category")}
              </label>
              <input
                type="text"
                className="modern-search-input"
                value={formData.agenda || formData.topic || formData.category || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (formData.agenda !== undefined) handleChange("agenda", val);
                  else if (formData.topic !== undefined) handleChange("topic", val);
                  else if (formData.category !== undefined) handleChange("category", val);
                }}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.6rem",
                borderRadius: "0.5rem",
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                fontWeight: 700,
                fontSize: "0.8125rem",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1.5,
                padding: "0.6rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: "0.8125rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
              }}
            >
              <CheckCircle2 size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
