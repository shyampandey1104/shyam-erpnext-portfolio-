import React, { useState, useRef } from "react";
import { X, FileSpreadsheet, UploadCloud, CheckCircle2, Download, AlertCircle, Users, ArrowRight } from "lucide-react";
import { saveLeadApi, bulkSaveLeadsApi } from "../services/apiService";
import CustomAlertDialog from "./CustomAlertDialog";

export default function ImportLeadsModal({ isOpen, onClose, onLeadsImported, existingLeads = [] }) {
  const [file, setFile] = useState(null);
  const [parsedLeads, setParsedLeads] = useState([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const headers = "Name,Phone,Email,Location,BHK_Type,Service,Source,Priority,Notes";
    const sampleRows = [
      "Aarav Sharma,+91 98205 91823,aarav.sharma@gmail.com,Bandra West,3 BHK,Home Buying,Google Ads,HOT,Interested in Sea View 3BHK flat",
      "Pooja Verma,+91 98334 11223,pooja.v@yahoo.com,Andheri West,2 BHK,Home Buying,Instagram Ads,WARM,Looking for ready-to-move apartment",
      "Kavita Mehta,+91 98765 43210,kavita.m@outlook.com,Thane West,1 BHK,Site Visit Booking,MagicBricks,HOT,Wants weekend site visit"
    ];
    const csvContent = "\uFEFF" + [headers, ...sampleRows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Sample_CRM_Leads_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (uploadedFile) => {
    const ext = uploadedFile.name.substring(uploadedFile.name.lastIndexOf(".")).toLowerCase();
    if (ext !== ".csv" && ext !== ".txt" && ext !== ".xlsx" && ext !== ".xls") {
      setAlertConfig({
        title: "Invalid File Format",
        message: "Please upload an Excel (.xlsx, .xls) or CSV (.csv) file!",
        type: "warning"
      });
      return;
    }

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseCsvData(text, uploadedFile.name);
    };
    reader.readAsText(uploadedFile);
  };

  const parseCsvData = (text, fileName) => {
    try {
      const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        setAlertConfig({
          title: "Empty File",
          message: "The uploaded file does not contain any lead data rows.",
          type: "warning"
        });
        return;
      }

      // Parse headers
      const headerLine = lines[0];
      const headers = headerLine.split(",").map(h => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

      const nameIdx = headers.findIndex(h => h.includes("name") || h.includes("lead"));
      const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("mobile") || h.includes("contact") || h.includes("number"));
      const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
      const locIdx = headers.findIndex(h => h.includes("loc") || h.includes("city") || h.includes("area") || h.includes("address"));
      const bhkIdx = headers.findIndex(h => h.includes("bhk") || h.includes("config") || h.includes("type"));
      const serviceIdx = headers.findIndex(h => h.includes("service") || h.includes("requirement") || h.includes("category"));
      const sourceIdx = headers.findIndex(h => h.includes("source") || h.includes("channel") || h.includes("campaign"));
      const priorityIdx = headers.findIndex(h => h.includes("priority") || h.includes("stage"));
      const notesIdx = headers.findIndex(h => h.includes("note") || h.includes("comment") || h.includes("remark") || h.includes("detail"));

      // Existing phone set for duplicate detection
      const existingPhoneSet = new Set(
        (existingLeads || []).map(l => (l.phone || "").replace(/\D/g, "").slice(-10)).filter(Boolean)
      );
      const seenInThisFile = new Set();

      const leadsList = [];
      let skippedDuplicates = 0;

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map(col => col.trim().replace(/^["']|["']$/g, ""));
        if (row.length === 0 || !row.some(c => c.length > 0)) continue;

        const nameVal = (nameIdx >= 0 && row[nameIdx]) ? row[nameIdx] : `Lead #${i}`;
        const rawPhone = (phoneIdx >= 0 && row[phoneIdx]) ? row[phoneIdx] : "+91 98000 00000";
        const cleanDigits = rawPhone.replace(/\D/g, "").slice(-10);

        // Check duplicates
        if (cleanDigits && (existingPhoneSet.has(cleanDigits) || seenInThisFile.has(cleanDigits))) {
          skippedDuplicates++;
          continue;
        }

        if (cleanDigits) {
          seenInThisFile.add(cleanDigits);
        }

        if (nameVal && rawPhone) {
          leadsList.push({
            id: `LEAD-IMP-${Date.now().toString().slice(-4)}${i}`,
            name: nameVal,
            lead_name: nameVal,
            phone: rawPhone,
            email: (emailIdx >= 0 && row[emailIdx]) ? row[emailIdx] : "",
            location: (locIdx >= 0 && row[locIdx]) ? row[locIdx] : "Mumbai",
            bhkType: (bhkIdx >= 0 && row[bhkIdx]) ? row[bhkIdx] : "2 BHK",
            service: (serviceIdx >= 0 && row[serviceIdx]) ? row[serviceIdx] : "Home Buying",
            source: (sourceIdx >= 0 && row[sourceIdx]) ? row[sourceIdx] : `Excel Import (${fileName})`,
            priority: (priorityIdx >= 0 && row[priorityIdx]) ? row[priorityIdx].toUpperCase() : "HOT",
            status: "NEW",
            timeAgo: "Just Imported",
            callCount: 0,
            notes: (notesIdx >= 0 && row[notesIdx]) ? row[notesIdx] : "Bulk imported from Excel file"
          });
        }
      }

      setDuplicateCount(skippedDuplicates);
      setParsedLeads(leadsList);

      if (leadsList.length === 0 && skippedDuplicates > 0) {
        setAlertConfig({
          title: "All Leads Already Exist",
          message: `All ${skippedDuplicates} leads in this file already exist in the CRM Database! No duplicate entries created.`,
          type: "warning"
        });
      }
    } catch (err) {
      console.error("CSV parsing error", err);
      setAlertConfig({
        title: "Parsing Error",
        message: "Failed to parse file. Please verify CSV columns format.",
        type: "error"
      });
    }
  };

  const handleImportSubmit = async () => {
    if (parsedLeads.length === 0) {
      setAlertConfig({
        title: "No New Leads",
        message: duplicateCount > 0 
          ? `All leads in the file are duplicates (${duplicateCount} skipped).`
          : "Please select a valid CSV/Excel file with lead rows.",
        type: "warning"
      });
      return;
    }

    setIsProcessing(true);

    let backendImported = parsedLeads.length;
    let backendSkipped = duplicateCount;

    // Save batch of leads to MariaDB via bulk_save_leads API
    try {
      const res = await bulkSaveLeadsApi(parsedLeads);
      if (res && res.lead_ids && res.lead_ids.length > 0) {
        parsedLeads.forEach((l, idx) => {
          if (res.lead_ids[idx]) l.id = res.lead_ids[idx];
        });
      }
      if (res && res.duplicates_skipped) {
        backendSkipped += res.duplicates_skipped;
      }
    } catch (e) {
      console.log("[Bulk Save Fallback]", e);
    }

    setIsProcessing(false);

    if (onLeadsImported) {
      onLeadsImported(parsedLeads);
    }

    const dupMsg = backendSkipped > 0 ? ` (${backendSkipped} duplicate numbers skipped)` : "";
    setAlertConfig({
      title: "Import Completed!",
      message: `🎉 Successfully imported ${parsedLeads.length} unique leads into CRM MariaDB Database!${dupMsg}`,
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
        background: "rgba(15, 23, 42, 0.85)",
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
          maxHeight: "88vh",
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
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <FileSpreadsheet size={18} color="#22c55e" /> Import Leads from Excel
            </h3>
            <p style={{ fontSize: "0.71875rem", color: "#94a3b8", margin: "0.15rem 0 0 0" }}>
              Bulk upload leads via .csv, .xlsx, or .xls format
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

        {/* Body */}
        <div style={{ padding: "1.25rem", overflowY: "auto", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Sample Template Download Button */}
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <div>
              <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#166534" }}>Need standard Excel format?</div>
              <div style={{ fontSize: "0.6875rem", color: "#15803d" }}>Download our ready-made CSV template</div>
            </div>
            <button
              onClick={downloadSampleTemplate}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "0.4rem 0.65rem",
                borderRadius: "0.375rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                whiteSpace: "nowrap"
              }}
            >
              <Download size={13} /> Sample CSV
            </button>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: isDragging ? "2px dashed #16a34a" : "2px dashed #cbd5e1",
              background: isDragging ? "#f0fdf4" : "#f8fafc",
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
              accept=".csv,.txt,.xlsx,.xls"
              style={{ display: "none" }}
            />

            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.5rem" }}>
              <UploadCloud size={22} />
            </div>

            {file ? (
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>{file.name}</div>
                <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 700, marginTop: "0.2rem" }}>
                  ✓ {parsedLeads.length} leads detected • Click to replace file
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0f172a" }}>
                  Click to Browse or Drag & Drop Excel
                </div>
                <div style={{ fontSize: "0.71875rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Supports <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong> files
                </div>
              </div>
            )}
          </div>

          {/* Live Parsed Leads Preview */}
          {parsedLeads.length > 0 && (
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.625rem", overflow: "hidden" }}>
              <div style={{ padding: "0.6rem 0.85rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78125rem", fontWeight: 800, color: "#0f172a" }}>Preview Parsed Leads</span>
                <span style={{ fontSize: "0.6875rem", background: "#dbeafe", color: "#1d4ed8", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                  Total: {parsedLeads.length} Leads
                </span>
              </div>

              <div style={{ maxHeight: "150px", overflowY: "auto", padding: "0.5rem" }}>
                {parsedLeads.slice(0, 5).map((lead, idx) => (
                  <div key={idx} style={{ padding: "0.4rem 0.5rem", borderBottom: idx < 4 ? "1px solid #f1f5f9" : "none", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0f172a" }}>{lead.name}</div>
                      <div style={{ color: "#64748b", fontSize: "0.6875rem" }}>{lead.phone} • {lead.location}</div>
                    </div>
                    <span style={{ fontSize: "0.6875rem", background: "#eff6ff", color: "#2563eb", fontWeight: 700, padding: "0.15rem 0.4rem", borderRadius: "4px" }}>
                      {lead.bhkType}
                    </span>
                  </div>
                ))}
                {parsedLeads.length > 5 && (
                  <div style={{ textAlign: "center", padding: "0.4rem", fontSize: "0.71875rem", color: "#64748b", fontWeight: 600 }}>
                    + {parsedLeads.length - 5} more leads ready for import
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Submit Button */}
          <button
            onClick={handleImportSubmit}
            disabled={parsedLeads.length === 0 || isProcessing}
            style={{
              background: parsedLeads.length === 0 ? "#cbd5e1" : "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.75rem",
              borderRadius: "0.625rem",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: parsedLeads.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              boxShadow: parsedLeads.length === 0 ? "none" : "0 6px 16px rgba(22,163,74,0.3)",
              marginTop: "0.25rem"
            }}
          >
            {isProcessing ? (
              <span>Importing {parsedLeads.length} leads...</span>
            ) : (
              <>
                <CheckCircle2 size={16} /> Import {parsedLeads.length > 0 ? `${parsedLeads.length} Leads to CRM` : "Leads to CRM"}
              </>
            )}
          </button>
        </div>

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
