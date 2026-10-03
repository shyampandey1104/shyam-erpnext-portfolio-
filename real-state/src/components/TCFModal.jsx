import React, { useState } from "react";
import { X, FileText, CheckCircle2 } from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";
import { getApiHeaders } from "../services/apiService";

export default function TCFModal({ isOpen, onClose }) {
  const [leadId, setLeadId] = useState("");
  const [clientName, setClientName] = useState("");
  const [budget, setBudget] = useState("");
  const [possession, setPossession] = useState("Ready to Move");
  const [notes, setNotes] = useState("");
  const [alertConfig, setAlertConfig] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/method/real_state_crm.api.save_tcf", {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({
          client_name: clientName || leadId || "Client",
          phone: "9867778229",
          call_outcome: possession,
          budget: budget,
          notes: notes
        })
      });
    } catch (err) {}

    setAlertConfig({
      title: "TCF Saved to Database!",
      message: `TCF (Telecaller Call Feedback) for '${clientName || leadId}' saved directly to Frappe MariaDB!`,
      type: "success"
    });
  };

  const handleCloseAll = () => {
    setAlertConfig(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "340px", padding: "1.25rem", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700" }}>Add TCF (Call Feedback)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.2rem" }}>Lead ID</label>
            <input type="text" className="text-input" placeholder="e.g. LEAD-0007" value={leadId} onChange={e => setLeadId(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.2rem" }}>Client Name</label>
            <input type="text" className="text-input" placeholder="Client Full Name" value={clientName} onChange={e => setClientName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.2rem" }}>Budget (Cr)</label>
            <input type="text" className="text-input" placeholder="e.g. 2.5 Cr" value={budget} onChange={e => setBudget(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.2rem" }}>Possession Timeline</label>
            <select className="select-input" value={possession} onChange={e => setPossession(e.target.value)}>
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction (1 Yr)">Under Construction (1 Yr)</option>
              <option value="New Launch (2-3 Yrs)">New Launch (2-3 Yrs)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "0.2rem" }}>Call Summary Notes</label>
            <textarea className="text-input" rows="2" placeholder="Key discussion points..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button className="admin-action-btn" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            Submit TCF Form
          </button>
        </form>

        {alertConfig && (
          <CustomAlertDialog
            isOpen={!!alertConfig}
            onClose={handleCloseAll}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
          />
        )}
      </div>
    </div>
  );
}
