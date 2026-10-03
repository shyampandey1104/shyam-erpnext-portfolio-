import React from "react";
import { X, Download, Share2, FileText, CheckCircle2, ShieldCheck, ExternalLink, Eye, Building2, Calendar, HardDrive } from "lucide-react";

export default function DocumentViewerModal({ isOpen, onClose, doc }) {
  if (!isOpen || !doc) return null;

  const isPdf = (doc.fileType === "PDF" || doc.fileName?.toLowerCase().endsWith(".pdf") || doc.name?.toLowerCase().endsWith(".pdf"));

  const handleDownload = () => {
    if (doc.dataUrl) {
      const link = document.createElement("a");
      link.href = doc.dataUrl;
      link.download = doc.fileName || `${doc.name}.${isPdf ? "pdf" : "docx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a clean mock text/pdf blob download for sample docs
      const sampleContent = `%PDF-1.4\n1 0 obj\n<< /Title (${doc.name}) /Author (Dream Homes CRM) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      const blob = new Blob([sampleContent], { type: isPdf ? "application/pdf" : "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName || `${doc.name.replace(/\s+/g, "_")}.${isPdf ? "pdf" : "docx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  const handleShare = () => {
    const text = encodeURIComponent(`📄 Check out verified project document: *${doc.name}* (${doc.category || "Brochure"}) from Dream Homes CRM.`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
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
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "0.45rem",
              background: isPdf ? "#fee2e2" : "#e0e7ff",
              color: isPdf ? "#dc2626" : "#4338ca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.6875rem",
              flexShrink: 0
            }}>
              {isPdf ? "PDF" : "DOC"}
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 800, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {doc.name}
              </h3>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: "0.1rem 0 0 0" }}>
                {doc.category || "Project Document"} • {doc.size || "2.4 MB"}
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
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: "0.5rem"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Document Preview Viewer Body */}
        <div style={{ padding: "1rem", overflowY: "auto", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: "0.85rem", background: "#f8fafc" }}>
          
          {/* If dataUrl is available (uploaded PDF/DOC) */}
          {doc.dataUrl && isPdf ? (
            <div style={{ width: "100%", height: "280px", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #cbd5e1", background: "#ffffff" }}>
              <iframe
                src={`${doc.dataUrl}#toolbar=0`}
                title={doc.name}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          ) : (
            /* Rich Formatted Document Sheet Preview */
            <div style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "0.875rem",
              padding: "1.25rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              position: "relative"
            }}>
              {/* Document Stamp */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px dashed #cbd5e1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 800, color: "#16a34a" }}>
                  <ShieldCheck size={16} /> MahaRERA Verified Document
                </div>
                <span style={{ fontSize: "0.6875rem", background: "#dcfce7", color: "#15803d", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                  Official Specimen
                </span>
              </div>

              {/* Title & Organization */}
              <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#2563eb", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Dream Homes Realty Group
                </div>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: "0.25rem 0" }}>
                  {doc.name}
                </h4>
                <div style={{ fontSize: "0.71875rem", color: "#64748b" }}>
                  Category: <strong>{doc.category || "Brochure / Layout"}</strong>
                </div>
              </div>

              {/* Metadata Key-Value Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "0.5rem", fontSize: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>File Name:</div>
                  <div style={{ fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>{doc.fileName || `${doc.name}.${isPdf ? "pdf" : "docx"}`}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>File Size:</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{doc.size || "2.4 MB"}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>Verification Date:</div>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{doc.date || "24 Aug 2026"}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>Security & Format:</div>
                  <div style={{ fontWeight: 700, color: "#16a34a" }}>256-Bit Encrypted ({doc.fileType || "PDF"})</div>
                </div>
              </div>

              {/* Document Body Preview Excerpt */}
              <div style={{ borderLeft: "3px solid #2563eb", paddingLeft: "0.75rem", fontSize: "0.78125rem", color: "#475569", lineHeight: "1.4" }}>
                This verified real estate document contains full architectural layouts, floor plans, structural safety certifications, and MahaRERA registered terms for customer review.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid #e2e8f0", background: "#ffffff", display: "flex", gap: "0.6rem", flexShrink: 0 }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              padding: "0.65rem",
              borderRadius: "0.5rem",
              background: "#f0fdf4",
              color: "#15803d",
              border: "1px solid #bbf7d0",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem"
            }}
          >
            <Share2 size={14} /> WhatsApp
          </button>

          <button
            onClick={handleDownload}
            style={{
              flex: 1.5,
              padding: "0.65rem",
              borderRadius: "0.5rem",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: "#ffffff",
              border: "none",
              fontWeight: 800,
              fontSize: "0.84375rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
            }}
          >
            <Download size={15} /> Download {isPdf ? "PDF" : "DOC"}
          </button>
        </div>
      </div>
    </div>
  );
}
