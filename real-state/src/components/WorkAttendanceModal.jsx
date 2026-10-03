import React, { useState, useEffect } from "react";
import { X, Clock, MapPin, CheckCircle, ShieldCheck, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { fetchWorkAttendanceApi, toggleWorkAttendanceApi } from "../services/apiService";

export default function WorkAttendanceModal({ isOpen, onClose, currentUser }) {
  const [clockedIn, setClockedIn] = useState(true);
  const [timestamp, setTimestamp] = useState("09:30 AM, Today");
  const [location, setLocation] = useState("Andheri Sales Office (GPS Verified)");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setToastMessage(null);
      const email = currentUser?.email || "shyampandey1104@gmail.com";
      fetchWorkAttendanceApi(email).then((data) => {
        if (data) {
          setClockedIn(data.clockedIn);
          if (data.timestamp) setTimestamp(data.timestamp);
          if (data.location) setLocation(data.location);
        }
      });
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleToggleClock = async () => {
    setIsLoading(true);
    setToastMessage(null);
    const email = currentUser?.email || "shyampandey1104@gmail.com";
    const name = currentUser?.name || "Shyam Pandey";
    const targetStatus = clockedIn ? "Clocked Out" : "Clocked In";

    const res = await toggleWorkAttendanceApi(email, name, location, targetStatus);
    setIsLoading(false);

    if (res) {
      setClockedIn(targetStatus === "Clocked In");
      if (res.timestamp) setTimestamp(res.timestamp);
      
      const successMsg = typeof res.message === "string" ? res.message : `Attendance Request logged as '${targetStatus}' in ERPNext MariaDB!`;
      setToastMessage({
        title: targetStatus === "Clocked In" ? "🎉 Clocked IN Successfully!" : "👋 Clocked OUT Successfully!",
        detail: successMsg,
        status: targetStatus
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "340px", padding: "1.25rem", position: "relative", overflow: "hidden" }}>
        
        {/* Animated Custom Success Toast Popup Banner */}
        {toastMessage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: toastMessage.status === "Clocked In" ? "linear-gradient(135deg, #15803d 0%, #166534 100%)" : "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
              color: "#ffffff",
              padding: "0.85rem 1rem",
              zIndex: 100,
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, fontSize: "0.875rem" }}>
                <CheckCircle2 size={18} color="#ffffff" />
                <span>{toastMessage.title}</span>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <X size={12} />
              </button>
            </div>
            <p style={{ fontSize: "0.71875rem", margin: 0, color: "rgba(255,255,255,0.92)", lineHeight: 1.3 }}>
              {toastMessage.detail}
            </p>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={20} color="#2563eb" />
            <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Work Attendance</h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ background: clockedIn ? "#f0fdf4" : "#fef2f2", border: `1px solid ${clockedIn ? "#bbf7d0" : "#fecaca"}`, borderRadius: "0.75rem", padding: "1rem", textCenter: "center", textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: clockedIn ? "#16a34a" : "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem auto" }}>
            <Clock size={24} />
          </div>
          <div style={{ fontSize: "1.125rem", fontWeight: "800", color: clockedIn ? "#15803d" : "#991b1b" }}>
            {clockedIn ? "STATUS: CLOCKED IN" : "STATUS: CLOCKED OUT"}
          </div>
          <div style={{ fontSize: "0.78125rem", color: "#64748b", marginTop: "0.2rem" }}>
            Since: {timestamp}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#0284c7", marginTop: "0.5rem" }}>
            <MapPin size={12} /> {location}
          </div>
        </div>

        <button 
          className="admin-action-btn" 
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", background: clockedIn ? "#ef4444" : "#16a34a", cursor: isLoading ? "not-allowed" : "pointer" }}
          onClick={handleToggleClock}
        >
          {isLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Loader2 size={16} className="animate-spin" /> Saving to ERPNext...
            </span>
          ) : (
            clockedIn ? "Clock Out Now" : "Clock In Now"
          )}
        </button>

        <div style={{ fontSize: "0.6875rem", color: "#94a3b8", textAlign: "center", marginTop: "0.75rem" }}>
          🔒 Real-time ERPNext Attendance Request & DB Sync
        </div>
      </div>
    </div>
  );
}
