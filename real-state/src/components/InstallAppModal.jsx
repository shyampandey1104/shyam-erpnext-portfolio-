import React from "react";
import { X, Share, Smartphone, Download, CheckCircle, ArrowDown } from "lucide-react";

export default function InstallAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);

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
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          animation: "scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          borderTopLeftRadius: "1.5rem",
          borderTopRightRadius: "1.5rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Smartphone size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>
                Install App on Phone
              </h3>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>
                iOS Safari & Android Chrome Setup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
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

        {/* Content Body */}
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* iPhone / iOS Instructions */}
          <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1.5px solid #cbd5e1", borderRadius: "1rem", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📱</span>
              <strong style={{ fontSize: "0.875rem", color: "#0f172a" }}>iPhone (iOS Safari) Setup:</strong>
            </div>

            <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.78125rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.3" }}>
              <li>Safari browser mein link kholein: <strong style={{ color: "#2563eb" }}>https://routers-regardless-compiler-lcd.trycloudflare.com</strong></li>
              <li>Bottom bar me Share Icon <strong style={{ background: "#e2e8f0", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", color: "#0f172a" }}>[↑ Share]</strong> par click karein.</li>
              <li>Menu list me scroll karke <strong style={{ color: "#16a34a" }}>➕ Add to Home Screen</strong> par click karein.</li>
              <li>Top right me <strong style={{ color: "#2563eb" }}>Add</strong> par click karein!</li>
            </ol>
          </div>

          {/* Android Instructions */}
          <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1.5px solid #bbf7d0", borderRadius: "1rem", padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.2rem" }}>🤖</span>
              <strong style={{ fontSize: "0.875rem", color: "#166534" }}>Android (Google Chrome) Setup:</strong>
            </div>

            <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.78125rem", color: "#14532d", display: "flex", flexDirection: "column", gap: "0.4rem", lineHeight: "1.3" }}>
              <li>Chrome browser me link kholein.</li>
              <li>Top right me <strong style={{ background: "#dcfce7", padding: "0.1rem 0.35rem", borderRadius: "0.25rem", color: "#166534" }}>3 Dots (⋮)</strong> par click karein.</li>
              <li><strong style={{ color: "#16a34a" }}>Install App</strong> (ya Add to Home Screen) par click karein.</li>
              <li><strong style={{ color: "#15803d" }}>Install</strong> button par tap karein!</li>
            </ol>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#2563eb",
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
              gap: "0.4rem"
            }}
          >
            <CheckCircle size={16} /> Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
