// Universal Excel / CSV Lead Exporter with Native Mobile Sharing & Desktop Download
export const exportLeadsToExcel = async (leads = [], title = "CRM_Leads_Report") => {
  if (!leads || leads.length === 0) {
    console.warn("No leads found matching current filters to export.");
    return false;
  }

  const headers = [
    "Lead ID",
    "Lead Name",
    "Phone Number",
    "Email Address",
    "Status",
    "Priority",
    "Service / Category",
    "BHK Configuration",
    "Location",
    "Lead Source",
    "Time Added / Callback",
    "Notes & Details"
  ];

  const rows = leads.map(l => [
    `"${(l.id || l.name || '').toString().replace(/"/g, '""')}"`,
    `"${(l.name || l.lead_name || '').toString().replace(/"/g, '""')}"`,
    `"${(l.phone || '').toString().replace(/"/g, '""')}"`,
    `"${(l.email || '').toString().replace(/"/g, '""')}"`,
    `"${(l.status || 'NEW').toString().replace(/"/g, '""')}"`,
    `"${(l.priority || 'HOT').toString().replace(/"/g, '""')}"`,
    `"${(l.service || 'Home Buying').toString().replace(/"/g, '""')}"`,
    `"${(l.bhkType || l.bhk_type || '2 BHK').toString().replace(/"/g, '""')}"`,
    `"${(l.location || '').toString().replace(/"/g, '""')}"`,
    `"${(l.source || '').toString().replace(/"/g, '""')}"`,
    `"${(l.timeAgo || l.time || '').toString().replace(/"/g, '""')}"`,
    `"${(l.notes || l.comment || '').toString().replace(/"/g, '""')}"`
  ]);

  const csvString = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanTitle = title.replace(/\s+/g, '_');
  const fileName = `${cleanTitle}_${timestamp}.csv`;

  // On Mobile: Use Web Share API if available for clean sharing/saving without leaving app
  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], fileName, { type: "text/csv" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Dream Homes CRM Leads Report",
          text: `Exported ${leads.length} leads from Dream Homes CRM`
        });
        return true;
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.log("Web Share fallback:", err);
      } else {
        return true;
      }
    }
  }

  // Standard Desktop / Browser Direct Download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
};
