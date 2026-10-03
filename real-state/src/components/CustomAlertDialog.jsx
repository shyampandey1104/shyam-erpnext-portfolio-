import React from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export default function CustomAlertDialog({ isOpen, onClose, title, message, type = "success" }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={32} color="#f59e0b" />;
      case "error":
        return <XCircle size={32} color="#ef4444" />;
      case "info":
        return <Info size={32} color="#3b82f6" />;
      case "success":
      default:
        return <CheckCircle2 size={32} color="#16a34a" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case "warning": return "#fffbeb";
      case "error": return "#fef2f2";
      case "info": return "#eff6ff";
      case "success":
      default: return "#f0fdf4";
    }
  };

  const getHeaderBorder = () => {
    switch (type) {
      case "warning": return "#fde68a";
      case "error": return "#fecaca";
      case "info": return "#bfdbfe";
      case "success":
      default: return "#bbf7d0";
    }
  };

  const getBtnBg = () => {
    switch (type) {
      case "warning": return "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
      case "error": return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      case "info": return "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)";
      case "success":
      default: return "linear-gradient(135deg, #16a34a 0%, #15803d 100%)";
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 999999,
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "inherit"
      }}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: "360px",
          width: "90%",
          borderRadius: "1.25rem",
          overflow: "hidden",
          background: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
          padding: 0,
          animation: "scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header Banner */}
        <div style={{
          background: getHeaderBg(),
          borderBottom: `1px solid ${getHeaderBorder()}`,
          padding: "1.25rem 1rem 1rem 1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative"
        }}>
          <button 
            onClick={onClose} 
            style={{
              position: "absolute",
              top: "0.75rem",
              right: "0.75rem",
              background: "none",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>

          <div style={{ marginBottom: "0.5rem" }}>
            {getIcon()}
          </div>

          <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            {title || "System Notification"}
          </h3>
        </div>

        {/* Body Message */}
        <div style={{ padding: "1.25rem 1.25rem 1rem 1.25rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.84375rem", color: "#334155", lineHeight: "1.5", margin: 0, whiteSpace: "pre-wrap", fontWeight: 500 }}>
            {typeof message === "string" ? message : JSON.stringify(message, null, 2)}
          </p>
        </div>

        {/* Footer Action Button */}
        <div style={{ padding: "0 1.25rem 1.25rem 1.25rem" }}>
          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: getBtnBg(),
              color: "#ffffff",
              border: "none",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              transition: "transform 0.1s ease"
            }}
          >
            OK, Understood
          </button>
        </div>
      </div>
    </div>
  );
}
