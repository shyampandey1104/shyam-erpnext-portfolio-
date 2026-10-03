import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export default function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast || !toast.message) return null;

  const { type, message, title } = toast;

  let headerTitle = title;
  let blockBg = "#0284c7"; // blue
  let icon = <Info size={28} color="#ffffff" />;

  if (type === "success") {
    headerTitle = title || "Success!";
    blockBg = "#16a34a"; // green
    icon = <CheckCircle2 size={28} color="#ffffff" />;
  } else if (type === "error") {
    headerTitle = title || "Oops!";
    blockBg = "#dc2626"; // red
    icon = <XCircle size={28} color="#ffffff" />;
  } else if (type === "warning") {
    headerTitle = title || "Alert!";
    blockBg = "#f59e0b"; // yellow/orange
    icon = <AlertTriangle size={28} color="#ffffff" />;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        maxWidth: "340px",
        width: "92%",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 12px 28px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.06)",
        border: "1px solid #cbd5e1",
        display: "flex",
        alignItems: "stretch",
        overflow: "hidden",
        animation: "toastSlideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        boxSizing: "border-box"
      }}
    >
      {/* Left Colored Block with Icon */}
      <div
        style={{
          width: "60px",
          background: blockBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      {/* Right Content Area */}
      <div
        style={{
          flex: 1,
          padding: "0.75rem 0.85rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            background: "none",
            border: "none",
            color: "#64748b",
            cursor: "pointer",
            padding: "0.2rem",
            display: "flex",
            alignItems: "center"
          }}
        >
          <X size={15} />
        </button>

        {headerTitle && (
          <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.15rem" }}>
            {headerTitle}
          </div>
        )}
        <div style={{ fontSize: "0.8125rem", color: "#475569", fontWeight: 500, lineHeight: "1.35", paddingRight: "1rem" }}>
          {message}
        </div>
      </div>
    </div>
  );
}
