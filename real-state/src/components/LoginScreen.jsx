import React, { useState, useEffect } from "react";
import { Phone, Lock, Mail, UserCheck, Shield, ArrowRight, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { getStoredUsers, registerCrmUser, saveStoredUsers, fetchCrmUsers, authenticateCrmUser } from "../services/apiService";
import ToastNotification from "./ToastNotification";

export default function LoginScreen({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [role, setRole] = useState("Telecaller");
  const [usersList, setUsersList] = useState([]);
  const [toast, setToast] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchCrmUsers().then((list) => {
      if (list && list.length > 0) {
        setUsersList(list);
      }
    });
  }, []);

  const triggerToast = (type, message) => {
    setToast({ type, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Password validation (required in both modes)
    if (!password.trim()) {
      const msg = "Please enter your password.";
      setErrorMsg(msg);
      triggerToast("error", msg);
      return;
    }

    if (password.length < 3) {
      const msg = "Password must be at least 3 characters long.";
      setErrorMsg(msg);
      triggerToast("error", msg);
      return;
    }

    // 1. REGISTER MODE (Either Phone OR Email is required)
    if (isRegisterMode) {
      if (!name.trim()) {
        const msg = "Please enter your full name.";
        setErrorMsg(msg);
        triggerToast("error", msg);
        return;
      }

      if (!cleanEmail && !cleanPhone) {
        const msg = "Please enter either Mobile Phone Number or Email Address.";
        setErrorMsg(msg);
        triggerToast("error", msg);
        return;
      }

      // Check if user already exists with this email or phone
      const existing = usersList.find(u => 
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) || 
        (cleanPhone && u.phone && u.phone.includes(cleanPhone))
      );

      if (existing) {
        triggerToast("success", `Welcome back ${existing.name}! Logging in...`);
        setTimeout(() => onLoginSuccess(existing), 600);
        return;
      }

      const displayName = name.trim();
      const userRole = role === "Admin" ? "Sales Manager" : "Telecaller";
      const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

      // Generate clean email from Full Name (e.g. "Ibrahim Khan" -> "ibrahimkhan@dreamhomes.in")
      let baseEmailName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!baseEmailName) baseEmailName = "user";

      let generatedEmail = `${baseEmailName}@dreamhomes.in`;
      let count = 1;
      while (usersList.some(u => u.email && u.email.toLowerCase() === generatedEmail.toLowerCase())) {
        generatedEmail = `${baseEmailName}${count}@dreamhomes.in`;
        count++;
      }

      const userEmail = cleanEmail || generatedEmail;
      const userPhone = cleanPhone || "+91 98200 11223";

      const newUserObj = {
        id: Date.now(),
        name: displayName,
        email: userEmail,
        phone: userPhone,
        role: userRole,
        status: "Active",
        areas: ["Andheri", "Bandra"],
        leadCap: 50,
        initials
      };

      registerCrmUser(newUserObj);
      const updatedList = [...usersList, newUserObj];
      saveStoredUsers(updatedList);
      setUsersList(updatedList);
      triggerToast("success", `Account created successfully for ${displayName}!`);
      setTimeout(() => onLoginSuccess(newUserObj), 600);
      return;
    }

    // 2. SIGN IN MODE
    if (!cleanEmail && !cleanPhone) {
      const msg = "Please enter your Email Address or Mobile Phone Number.";
      setErrorMsg(msg);
      triggerToast("error", msg);
      return;
    }

    const loginId = cleanEmail || cleanPhone;
    const res = await authenticateCrmUser(loginId, password, role);
    if (res && res.status === "error") {
      setErrorMsg(res.message);
      triggerToast("error", res.message);
      return;
    }

    if (res && res.status === "success" && res.user) {
      triggerToast("success", `Login Successful! Welcome, ${res.user.name}`);
      setTimeout(() => onLoginSuccess(res.user), 600);
      return;
    }

    // Local DB check
    let existing = usersList.find(u => 
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
      (loginId && u.email && u.email.toLowerCase() === loginId.toLowerCase()) ||
      (loginId && u.phone && u.phone.includes(loginId))
    );

    if (!existing) {
      const msg = `Invalid Login Credentials! User '${loginId}' not found.`;
      setErrorMsg(msg);
      triggerToast("error", msg);
      return;
    }

    triggerToast("success", `Login Successful! Welcome, ${existing.name}`);
    setTimeout(() => onLoginSuccess(existing), 600);
  };

  const handleSelectAdminUser = (userObj) => {
    setErrorMsg("");
    setEmail(userObj.email);
    triggerToast("success", `Selected Telecaller: ${userObj.name}`);
    setTimeout(() => onLoginSuccess(userObj), 600);
  };

  return (
    <div className="login-screen-container" style={{ width: "100%", maxWidth: "420px", margin: "0 auto", padding: "1rem", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="login-card" style={{ width: "100%", background: "#ffffff", borderRadius: "1.5rem", padding: "1.75rem 1.5rem", boxShadow: "0 25px 60px rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.15)", boxSizing: "border-box" }}>
        {/* Brand Header */}
        <div className="login-brand-header" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <div style={{ 
            display: "inline-block", 
            borderRadius: "20px", 
            overflow: "hidden", 
            boxShadow: "0 10px 25px rgba(212, 175, 55, 0.2)", 
            marginBottom: "0.5rem" 
          }}>
            <img 
              src="/assets/real_state_crm/frontend/dreamhomes_gold_logo.jpg" 
              alt="Dream Homes Logo" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/dreamhomes_gold_logo.jpg";
              }}
              style={{ 
                width: "84px", 
                height: "84px", 
                objectFit: "contain", 
                filter: "drop-shadow(0 6px 16px rgba(217, 119, 6, 0.35))",
                display: "block" 
              }} 
            />
          </div>
          <h1 className="login-title" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "0.25rem 0 0", letterSpacing: "0.02em" }}>
            Dream Homes
          </h1>
          <p className="login-subtitle" style={{ fontSize: "0.8125rem", color: "#64748b" }}>
            {isRegisterMode ? "Create New Telecaller Account" : "Real Estate Telecaller & Sales Portal"}
          </p>
        </div>

        {/* Sign In vs Register Segmented Pill Switcher */}
        <div style={{ 
          display: "flex", 
          background: "#f1f5f9", 
          padding: "4px", 
          borderRadius: "14px", 
          marginBottom: "1.25rem",
          border: "1px solid #e2e8f0"
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              border: "none",
              borderRadius: "10px",
              background: !isRegisterMode ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "transparent",
              color: !isRegisterMode ? "#ffffff" : "#64748b",
              fontWeight: 700,
              fontSize: "0.84375rem",
              cursor: "pointer",
              boxShadow: !isRegisterMode ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            onClick={() => { setIsRegisterMode(false); setErrorMsg(""); }}
          >
            Sign In
          </button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.6rem 0.5rem",
              border: "none",
              borderRadius: "10px",
              background: isRegisterMode ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" : "transparent",
              color: isRegisterMode ? "#ffffff" : "#64748b",
              fontWeight: 700,
              fontSize: "0.84375rem",
              cursor: "pointer",
              boxShadow: isRegisterMode ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
            onClick={() => { setIsRegisterMode(true); setErrorMsg(""); }}
          >
            Register User
          </button>
        </div>

        {/* Modern iOS Segmented Control Role Selector */}
        <div style={{ 
          display: "flex", 
          background: "#f8fafc", 
          padding: "4px", 
          borderRadius: "12px", 
          marginBottom: "1.25rem",
          border: "1px solid #cbd5e1"
        }}>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              border: "none",
              background: role === "Telecaller" ? "#ffffff" : "transparent",
              boxShadow: role === "Telecaller" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              color: role === "Telecaller" ? "#2563eb" : "#64748b",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease"
            }}
            onClick={() => setRole("Telecaller")}
          >
            <UserCheck size={16} color={role === "Telecaller" ? "#2563eb" : "#64748b"} />
            <span>Telecaller</span>
          </button>

          <button
            type="button"
            style={{
              flex: 1,
              padding: "0.5rem",
              borderRadius: "8px",
              border: "none",
              background: role === "Admin" ? "#ffffff" : "transparent",
              boxShadow: role === "Admin" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              color: role === "Admin" ? "#2563eb" : "#64748b",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.2s ease"
            }}
            onClick={() => setRole("Admin")}
          >
            <Shield size={16} color={role === "Admin" ? "#2563eb" : "#64748b"} />
            <span>Manager / Admin</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegisterMode && (
            <>
              {/* Full Name Field */}
              <div className="form-group" style={{ marginBottom: "1rem", textAlign: "left" }}>
                <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Full Name</span>
                  <span style={{ fontSize: "0.6875rem", color: "#2563eb", fontWeight: 600, background: "#eff6ff", padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>Required</span>
                </label>
                <div style={{ position: "relative" }}>
                  <User size={18} style={{ position: "absolute", left: 14, top: 13, color: name ? "#2563eb" : "#94a3b8", transition: "color 0.2s ease" }} />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter Full Name"
                    style={{ 
                      width: "100%", 
                      paddingLeft: "2.75rem", 
                      paddingRight: "1rem", 
                      paddingTop: "0.75rem", 
                      paddingBottom: "0.75rem", 
                      borderRadius: "12px", 
                      border: name ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1", 
                      background: name ? "#ffffff" : "#f8fafc", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "#0f172a", 
                      boxShadow: name ? "0 0 0 3px rgba(37,99,235,0.1)" : "none", 
                      outline: "none", 
                      transition: "all 0.2s ease",
                      boxSizing: "border-box"
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Mobile Phone Number Field */}
              <div className="form-group" style={{ marginBottom: "1rem", textAlign: "left" }}>
                <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>Mobile Phone Number</span>
                  <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>Phone or Email Required</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={18} style={{ position: "absolute", left: 14, top: 13, color: phone ? "#2563eb" : "#94a3b8", transition: "color 0.2s ease" }} />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter Mobile Phone Number"
                    style={{ 
                      width: "100%", 
                      paddingLeft: "2.75rem", 
                      paddingRight: "1rem", 
                      paddingTop: "0.75rem", 
                      paddingBottom: "0.75rem", 
                      borderRadius: "12px", 
                      border: phone ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1", 
                      background: phone ? "#ffffff" : "#f8fafc", 
                      fontSize: "0.875rem", 
                      fontWeight: 500, 
                      color: "#0f172a", 
                      boxShadow: phone ? "0 0 0 3px rgba(37,99,235,0.1)" : "none", 
                      outline: "none", 
                      transition: "all 0.2s ease",
                      boxSizing: "border-box"
                    }}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address / User ID Field */}
          <div className="form-group" style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Email Address / User ID</span>
              {isRegisterMode && (
                <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>Auto-generated if empty</span>
              )}
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: 14, top: 13, color: email ? "#2563eb" : "#94a3b8", transition: "color 0.2s ease" }} />
              <input
                type="text"
                className="text-input"
                autoComplete="username"
                placeholder="Enter Email Address / User ID"
                style={{ 
                  width: "100%", 
                  paddingLeft: "2.75rem", 
                  paddingRight: "1rem", 
                  paddingTop: "0.75rem", 
                  paddingBottom: "0.75rem", 
                  borderRadius: "12px", 
                  border: email ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1", 
                  background: email ? "#ffffff" : "#f8fafc", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#0f172a", 
                  boxShadow: email ? "0 0 0 3px rgba(37,99,235,0.1)" : "none", 
                  outline: "none", 
                  transition: "all 0.2s ease",
                  boxSizing: "border-box"
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: "1.25rem", textAlign: "left" }}>
            <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Password</span>
              <span style={{ fontSize: "0.6875rem", color: "#2563eb", fontWeight: 600, background: "#eff6ff", padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>Min 3 chars</span>
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: 14, top: 13, color: password ? "#2563eb" : "#94a3b8", transition: "color 0.2s ease" }} />
              <input
                type={showPassword ? "text" : "password"}
                className="text-input"
                autoComplete="current-password"
                placeholder="Enter Password"
                style={{ 
                  width: "100%", 
                  paddingLeft: "2.75rem", 
                  paddingRight: "2.75rem", 
                  paddingTop: "0.75rem", 
                  paddingBottom: "0.75rem", 
                  borderRadius: "12px", 
                  border: password ? "1.5px solid #2563eb" : "1.5px solid #cbd5e1", 
                  background: password ? "#ffffff" : "#f8fafc", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#0f172a", 
                  boxShadow: password ? "0 0 0 3px rgba(37,99,235,0.1)" : "none", 
                  outline: "none", 
                  transition: "all 0.2s ease",
                  boxSizing: "border-box"
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  background: "none",
                  border: "none",
                  color: showPassword ? "#2563eb" : "#94a3b8",
                  cursor: "pointer",
                  padding: "0.2rem",
                  display: "flex",
                  alignItems: "center",
                  outline: "none"
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-submit-btn">
            <span>{isRegisterMode ? "Create Account & Login" : `Login as ${role}`}</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
