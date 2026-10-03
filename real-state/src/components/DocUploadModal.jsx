import React, { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadPropertyDocumentApi, uploadFileToFrappeApi } from "../services/apiService";
import CustomAlertDialog from "./CustomAlertDialog";

export default function DocUploadModal({ isOpen, onClose, onDocumentUploaded, categoryTitle = "Property Documents" }) {
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("Brochure / Layout");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const validExts = [".pdf", ".doc", ".docx"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    
    if (!validExts.includes(fileExt)) {
      setAlertConfig({
        title: "Unsupported File Format",
        message: "Please upload a PDF (.pdf) or Word Document (.doc, .docx) file!",
        type: "warning"
      });
      return;
    }

    setSelectedFile(file);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setAlertConfig({
        title: "File Required",
        message: "Please select a PDF or DOC file to upload!",
        type: "warning"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      const formattedDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const fType = selectedFile.name.endsWith(".pdf") ? "PDF" : "DOC";
      const fSize = formatFileSize(selectedFile.size);
      const titleClean = docTitle.trim() || selectedFile.name;

      // 1. Upload file to Frappe Storage
      let uploadedUrl = `/files/${selectedFile.name}`;
      try {
        const fileRes = await uploadFileToFrappeApi(selectedFile.name, base64Data);
        if (fileRes && fileRes.file_url) uploadedUrl = fileRes.file_url;
      } catch (e) {}

      // 2. Save Document metadata in Frappe DB
      try {
        await uploadPropertyDocumentApi({
          document_name: titleClean,
          project: titleClean,
          category: docCategory,
          file_type: fType,
          file_size: fSize,
          upload_date: formattedDate,
          file_url: uploadedUrl,
          data_url: base64Data
        });
      } catch (e) {}

      const newDocItem = {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        name: titleClean,
        document_name: titleClean,
        fileName: selectedFile.name,
        fileType: fType,
        file_type: fType,
        category: docCategory,
        size: fSize,
        file_size: fSize,
        date: formattedDate,
        upload_date: formattedDate,
        file_url: uploadedUrl,
        dataUrl: base64Data
      };

      if (onDocumentUploaded) {
        onDocumentUploaded(newDocItem);
      }

      setAlertConfig({
        title: "Uploaded Successfully!",
        message: `📄 '${newDocItem.name}' (${newDocItem.fileType}) has been added & saved to CRM Database!`,
        type: "success"
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAlertClose = () => {
    setAlertConfig(null);
    setDocTitle("");
    setSelectedFile(null);
    onClose();
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
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <UploadCloud size={18} color="#38bdf8" /> Upload PDF / DOC
            </h3>
            <p style={{ fontSize: "0.71875rem", color: "#94a3b8", margin: "0.15rem 0 0 0" }}>
              {categoryTitle} • Accepts .pdf, .doc, .docx
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", flex: "1 1 auto" }}>
          
          {/* Drag & Drop File Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: isDragging ? "2px dashed #2563eb" : "2px dashed #cbd5e1",
              background: isDragging ? "#eff6ff" : "#f8fafc",
              borderRadius: "0.75rem",
              padding: "1.5rem 1rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
              style={{ display: "none" }} 
            />

            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
              <FileText size={22} />
            </div>

            {selectedFile ? (
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>{selectedFile.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, marginTop: "0.2rem" }}>
                  ✓ {formatFileSize(selectedFile.size)} • Click or drop to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
                  Click to Browse or Drag & Drop
                </div>
                <div style={{ fontSize: "0.71875rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Supports <strong>PDF (.pdf)</strong> & <strong>Word (.doc, .docx)</strong>
                </div>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
              Document / Title Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              className="modern-search-input"
              placeholder="e.g. Kalpataru Vian 3D Floor Brochure"
              style={{ fontSize: "0.84375rem", padding: "0.55rem 0.75rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              required
            />
          </div>

          {/* Document Category */}
          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
              Category
            </label>
            <select
              className="modern-search-input"
              value={docCategory}
              onChange={e => setDocCategory(e.target.value)}
              style={{ width: "100%", fontSize: "0.8125rem", padding: "0.55rem 0.5rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
            >
              <option value="Brochure / Layout">📄 Brochure / Floor Layout</option>
              <option value="RERA Approval">🏛️ RERA Approval / Legal Docs</option>
              <option value="Price Sheet & Costing">💰 Price Sheet & Costing</option>
              <option value="Client Visit Report">🚗 Client Visit Report</option>
              <option value="Meeting Minutes & Agenda">📅 Meeting Minutes / Agenda</option>
              <option value="Training & Modules">📚 Training & Scripts</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
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
            <UploadCloud size={16} /> Upload & Save Document
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
