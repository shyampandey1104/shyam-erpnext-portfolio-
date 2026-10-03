import React, { useState, useEffect } from "react";
import { X, UserPlus, User, Phone, Mail, MapPin, Tag, FileText, Sparkles, Flame, CheckCircle2, Edit3, AlertCircle, AlertTriangle } from "lucide-react";
import { saveLeadApi } from "../services/apiService";
import { validateName, validatePhone, validateEmail, validateRequiredText, checkDuplicateLead } from "../utils/validators";
import CustomAlertDialog from "./CustomAlertDialog";

export default function AddLeadModal({ isOpen, onClose, onLeadCreated, initialData = null, existingLeads = [] }) {
  const isEditing = !!initialData;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("Home Buying");
  const [bhkType, setBhkType] = useState("2 BHK");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("Direct Walk-in");
  const [priority, setPriority] = useState("HOT");
  const [notes, setNotes] = useState("");
  
  // Validation error states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [duplicateWarning, setDuplicateWarning] = useState("");
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || initialData.lead_name || "");
      setPhone(initialData.phone || "");
      setEmail(initialData.email || "");
      setService(initialData.service || "Home Buying");
      setBhkType(initialData.bhkType || initialData.bhk_type || "2 BHK");
      setLocation(initialData.location || "");
      setSource(initialData.source || "Direct Walk-in");
      setPriority(initialData.priority || "HOT");
      setNotes(initialData.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setService("Home Buying");
      setBhkType("2 BHK");
      setLocation("");
      setSource("Direct Walk-in");
      setPriority("HOT");
      setNotes("");
    }
    setErrors({});
    setTouched({});
    setDuplicateWarning("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time field validation & Duplicate Check
  const validateField = (field, value) => {
    let result = { isValid: true, error: "" };
    if (field === "name") {
      result = validateName(value);
    } else if (field === "phone") {
      result = validatePhone(value);
      if (result.isValid) {
        // Run Duplicate Check
        const dupCheck = checkDuplicateLead(value, email, initialData?.id, existingLeads);
        if (dupCheck.isDuplicate) {
          result = { isValid: false, error: dupCheck.error };
          setDuplicateWarning(dupCheck.error);
        } else {
          setDuplicateWarning("");
        }
      }
    } else if (field === "email") {
      result = validateEmail(value, false);
      if (result.isValid && value.trim()) {
        const dupCheck = checkDuplicateLead(phone, value, initialData?.id, existingLeads);
        if (dupCheck.isDuplicate && dupCheck.field === "email") {
          result = { isValid: false, error: dupCheck.error };
          setDuplicateWarning(dupCheck.error);
        }
      }
    } else if (field === "location") {
      result = validateRequiredText(value, "Location", 2);
    }

    setErrors(prev => ({
      ...prev,
      [field]: result.isValid ? "" : result.error
    }));
    return result.isValid;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let val = "";
    if (field === "name") val = name;
    if (field === "phone") val = phone;
    if (field === "email") val = email;
    if (field === "location") val = location;
    validateField(field, val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(phone);
    const isEmailValid = validateEmail(email, false);
    const isLocValid = validateRequiredText(location || "Mumbai", "Location", 2);

    // Duplicate Lead Verification
    const dupCheck = checkDuplicateLead(phone, email, initialData?.id, existingLeads);

    const newErrors = {
      name: isNameValid.error,
      phone: !isPhoneValid.isValid ? isPhoneValid.error : (dupCheck.isDuplicate ? dupCheck.error : ""),
      email: isEmailValid.error,
      location: isLocValid.error
    };

    setErrors(newErrors);
    setTouched({ name: true, phone: true, email: true, location: true });

    if (dupCheck.isDuplicate) {
      setAlertConfig({
        title: "Duplicate Lead Detected!",
        message: `⚠️ A lead with this mobile number already exists in the system:\n\n• Lead Name: ${dupCheck.existingLead.name}\n• Lead ID: ${dupCheck.existingLead.id}\n• Phone: ${dupCheck.existingLead.phone}\n\nPlease check the existing lead or enter a unique mobile number.`,
        type: "warning"
      });
      return;
    }

    if (!isNameValid.isValid || !isPhoneValid.isValid || !isEmailValid.isValid || !isLocValid.isValid) {
      setAlertConfig({
        title: "Validation Error",
        message: isNameValid.error || isPhoneValid.error || isEmailValid.error || isLocValid.error || "Please fix highlighted form errors!",
        type: "warning"
      });
      return;
    }

    // Format phone with +91 if 10 digits
    let formattedPhone = phone.trim();
    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length === 10) {
      formattedPhone = `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`;
    }

    const leadObj = {
      id: initialData?.id || `LEAD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      lead_name: name.trim(),
      phone: formattedPhone,
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      service: service,
      bhkType: bhkType,
      bhk_type: bhkType,
      location: location.trim() || "Mumbai",
      source: source,
      priority: priority,
      status: initialData?.status || "NEW",
      timeAgo: initialData?.timeAgo || "Just Now",
      callCount: initialData?.callCount || 0,
      notes: notes.trim() || (isEditing ? "" : "Fresh lead created manually via CRM Portal"),
      history: initialData?.history || []
    };

    // Save to Backend Database
    const res = await saveLeadApi(leadObj);
    const assignedId = res?.lead_id || res?.message?.lead_id || res?.id || res?.message?.id;
    if (assignedId) {
      leadObj.id = assignedId;
    }

    if (onLeadCreated) {
      onLeadCreated(leadObj);
    }

    setAlertConfig({
      title: isEditing ? "Lead Updated!" : "Lead Created!",
      message: isEditing
        ? `✅ Lead '${name}' has been updated successfully!`
        : `🎉 Fresh Lead '${name}' saved to Database! (Lead ID: ${assignedId || leadObj.id})`,
      type: "success"
    });
  };

  const handleAlertClose = () => {
    if (alertConfig?.type === "success") {
      setAlertConfig(null);
      onClose();
    } else {
      setAlertConfig(null);
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        zIndex: 99999,
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
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          border: "1px solid #cbd5e1",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Modal Header */}
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
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {isEditing ? (
                <>
                  <Edit3 size={18} color="#38bdf8" /> Edit Lead Details
                </>
              ) : (
                <>
                  <UserPlus size={18} color="#38bdf8" /> Add New Fresh Lead
                </>
              )}
            </h3>
            <p style={{ fontSize: "0.71875rem", color: "#94a3b8", margin: "0.15rem 0 0 0" }}>
              {isEditing ? `Editing lead: ${initialData?.id}` : "Strict duplicate phone & email checking active"}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#ffffff",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Duplicate Warning Alert Banner */}
        {duplicateWarning && (
          <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "0.5rem 0.85rem", display: "flex", alignItems: "center", gap: "0.4rem", color: "#b45309", fontSize: "0.71875rem", fontWeight: 700 }}>
            <AlertTriangle size={14} color="#d97706" flexShrink={0} />
            <span>{duplicateWarning}</span>
          </div>
        )}

        {/* Modal Body - Scrollable Mobile App Form */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", flex: "1 1 auto" }}>
          
          {/* Full Name */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Lead Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              {touched.name && errors.name && (
                <span style={{ fontSize: "0.6875rem", color: "#dc2626", fontWeight: 600 }}>{errors.name}</span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <User size={15} style={{ position: "absolute", left: 10, top: 11, color: touched.name && errors.name ? "#ef4444" : "#94a3b8" }} />
              <input
                type="text"
                placeholder="e.g. Rohan Mehta"
                style={{
                  paddingLeft: "2.1rem",
                  fontSize: "0.84375rem",
                  padding: "0.55rem 0.65rem 0.55rem 2.1rem",
                  width: "100%",
                  borderRadius: "0.5rem",
                  border: touched.name && errors.name ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  background: touched.name && errors.name ? "#fef2f2" : "#ffffff"
                }}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (touched.name) validateField("name", e.target.value);
                }}
                onBlur={() => handleBlur("name")}
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Mobile Number (10 Digits) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              {touched.phone && errors.phone && (
                <span style={{ fontSize: "0.6875rem", color: "#dc2626", fontWeight: 600 }}>{errors.phone}</span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Phone size={15} style={{ position: "absolute", left: 10, top: 11, color: touched.phone && errors.phone ? "#ef4444" : "#94a3b8" }} />
              <input
                type="tel"
                placeholder="98205 91823"
                maxLength={14}
                style={{
                  paddingLeft: "2.1rem",
                  fontSize: "0.84375rem",
                  padding: "0.55rem 0.65rem 0.55rem 2.1rem",
                  width: "100%",
                  borderRadius: "0.5rem",
                  border: touched.phone && errors.phone ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  background: touched.phone && errors.phone ? "#fef2f2" : "#ffffff"
                }}
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (touched.phone) validateField("phone", e.target.value);
                }}
                onBlur={() => handleBlur("phone")}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Email Address (Optional)
              </label>
              {touched.email && errors.email && (
                <span style={{ fontSize: "0.6875rem", color: "#dc2626", fontWeight: 600 }}>{errors.email}</span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <Mail size={15} style={{ position: "absolute", left: 10, top: 11, color: touched.email && errors.email ? "#ef4444" : "#94a3b8" }} />
              <input
                type="email"
                placeholder="rohan.mehta@gmail.com"
                style={{
                  paddingLeft: "2.1rem",
                  fontSize: "0.84375rem",
                  padding: "0.55rem 0.65rem 0.55rem 2.1rem",
                  width: "100%",
                  borderRadius: "0.5rem",
                  border: touched.email && errors.email ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  background: touched.email && errors.email ? "#fef2f2" : "#ffffff"
                }}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (touched.email) validateField("email", e.target.value);
                }}
                onBlur={() => handleBlur("email")}
              />
            </div>
          </div>

          {/* Preferred Locality */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Preferred Locality / Area
              </label>
              {touched.location && errors.location && (
                <span style={{ fontSize: "0.6875rem", color: "#dc2626", fontWeight: 600 }}>{errors.location}</span>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <MapPin size={15} style={{ position: "absolute", left: 10, top: 11, color: touched.location && errors.location ? "#ef4444" : "#94a3b8" }} />
              <input
                type="text"
                placeholder="e.g. Bandra West, Mumbai"
                style={{
                  paddingLeft: "2.1rem",
                  fontSize: "0.84375rem",
                  padding: "0.55rem 0.65rem 0.55rem 2.1rem",
                  width: "100%",
                  borderRadius: "0.5rem",
                  border: touched.location && errors.location ? "1.5px solid #ef4444" : "1px solid #cbd5e1",
                  background: touched.location && errors.location ? "#fef2f2" : "#ffffff"
                }}
                value={location}
                onChange={e => {
                  setLocation(e.target.value);
                  if (touched.location) validateField("location", e.target.value);
                }}
                onBlur={() => handleBlur("location")}
              />
            </div>
          </div>

          {/* 2-Column Grid: BHK Type & Requirement */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                BHK Type
              </label>
              <select
                className="modern-search-input"
                value={bhkType}
                onChange={e => setBhkType(e.target.value)}
                style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem 0.4rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              >
                <option value="1 BHK">1 BHK</option>
                <option value="2 BHK">2 BHK</option>
                <option value="3 BHK">3 BHK</option>
                <option value="4 BHK">4 BHK</option>
                <option value="Penthouse / Villa">Penthouse / Villa</option>
                <option value="Plot">Plot</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Service
              </label>
              <select
                className="modern-search-input"
                value={service}
                onChange={e => setService(e.target.value)}
                style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem 0.4rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              >
                <option value="Home Buying">🏡 Home Buying</option>
                <option value="Site Visit Booking">🚗 Site Visit</option>
                <option value="Valuation & Selling">💰 Selling</option>
                <option value="Commercial Rental">🏢 Rental</option>
              </select>
            </div>
          </div>

          {/* 2-Column Grid: Lead Source & Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Lead Source
              </label>
              <select
                className="modern-search-input"
                value={source}
                onChange={e => setSource(e.target.value)}
                style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem 0.4rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              >
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Instagram Ads">Instagram Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="MagicBricks">MagicBricks</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Priority
              </label>
              <select
                className="modern-search-input"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem 0.4rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              >
                <option value="HOT">🔥 HOT</option>
                <option value="WARM">⚡ WARM</option>
                <option value="COLD">❄️ COLD</option>
              </select>
            </div>
          </div>

          {/* Customer Requirements / Notes */}
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
              Notes & Requirements
            </label>
            <textarea
              className="modern-search-input"
              rows={2}
              placeholder="e.g. Budget 2.5 Cr. Callback requested."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", resize: "vertical" }}
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            style={{
              background: isEditing ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
              marginTop: "0.25rem"
            }}
          >
            {isEditing ? (
              <>
                <CheckCircle2 size={16} /> Save Lead Changes
              </>
            ) : (
              <>
                <UserPlus size={16} /> Create & Add Lead
              </>
            )}
          </button>
        </form>

        {alertConfig && (
          <CustomAlertDialog
            isOpen={!!alertConfig}
            onClose={handleAlertClose}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
          />
        )}
      </div>
    </div>
  );
}
