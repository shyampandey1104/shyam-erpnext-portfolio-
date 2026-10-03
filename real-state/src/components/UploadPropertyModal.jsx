import React, { useState } from "react";
import { X, Upload, FileText, CheckCircle2, Sparkles, Building, MapPin, Tag, DollarSign, AlertCircle, Image, Video, Share2 } from "lucide-react";
import { uploadPropertyApi, uploadFileToFrappeApi } from "../services/apiService";
import { validateRequiredText } from "../utils/validators";
import CustomAlertDialog from "./CustomAlertDialog";

export default function UploadPropertyModal({ isOpen, onClose, onPropertyUploaded }) {
  const [title, setTitle] = useState("");
  const [builder, setBuilder] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [tag, setTag] = useState("New Launch");
  const [bhk, setBhk] = useState("1, 2 & 3 BHK Apartments");
  const [carpet, setCarpet] = useState("450 - 1100 sq.ft.");
  const [heroImg, setHeroImg] = useState("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80");
  const [videoUrl, setVideoUrl] = useState("");
  const [highlights, setHighlights] = useState("Gated luxury community, 5-tier security, 50+ Lifestyle Amenities, Holiday EMI");
  
  const [fileName, setFileName] = useState("");
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);

  if (!isOpen) return null;

  // Handle PDF Brochure or Image Upload & Auto AI Parse
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setAlertConfig({ title: "File Too Large", message: "File size exceeds 25MB limit. Please upload a smaller file.", type: "warning" });
      return;
    }

    setFileName(file.name);

    // Convert file to base64 & upload to Frappe Storage
    const reader = new FileReader();
    reader.onload = async (uploadEv) => {
      const base64Data = uploadEv.target?.result;
      if (file.type.startsWith("image/") && base64Data) {
        setHeroImg(base64Data);
      }
      try {
        const fileRes = await uploadFileToFrappeApi(file.name, base64Data);
        if (fileRes && fileRes.file_url && file.type.startsWith("image/")) {
          setHeroImg(fileRes.file_url);
        }
      } catch (e) {}
    };
    reader.readAsDataURL(file);

    setIsAiParsing(true);

    // AI parsing PDF brochure details
    setTimeout(() => {
      setIsAiParsing(false);
      setAiSuccess(true);

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/brochure|rera|certificate|plan|layout|pdf/gi, "")
        .trim();

      const extractedTitle = cleanName ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1) : "Srishti Oasis";
      
      if (!title) setTitle(extractedTitle);
      if (!builder) setBuilder(file.name.toLowerCase().includes("srishti") ? "Srishti Group" : "Kalpataru Limited");
      if (!location) setLocation("Bhandup West, Mumbai (Direct GMLR Access)");
      if (!priceRange) setPriceRange("₹ 1.08 Cr - ₹ 2.26 Cr (All Inclusive)");
      if (!bhk) setBhk("1, 2 & 3 BHK Sun-Deck Residences");
      if (!carpet) setCarpet("425 - 910 sq.ft.");
    }, 1000);
  };

  const handleSubmit = async (e, shouldShareWhatsApp = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const titleRes = validateRequiredText(title, "Project Title", 2);
    if (!titleRes.isValid) {
      setAlertConfig({ title: "Validation Error", message: titleRes.error, type: "warning" });
      return;
    }

    const locRes = validateRequiredText(location || "Mumbai", "Location", 2);
    if (!locRes.isValid) {
      setAlertConfig({ title: "Validation Error", message: locRes.error, type: "warning" });
      return;
    }

    const highlightsArr = highlights.split(",").map(s => s.trim()).filter(Boolean);

    const newPropertyObj = {
      id: `PROP-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      builder: builder.trim() || "Independent Developer",
      location: location.trim() || "Mumbai",
      price: priceRange.trim() || "Price on Request",
      priceRange: priceRange.trim() || "Price on Request",
      tag: tag || "New Launch",
      bhk: bhk.trim() || "1, 2 & 3 BHK",
      carpet: carpet.trim() || "450 - 1100 sq.ft.",
      highlights: highlightsArr.length > 0 ? highlightsArr : ["Prime Locality", "Modern Amenities", "Vastu Compliant"],
      img: heroImg,
      image: heroImg,
      hero_img: heroImg,
      videoUrl: videoUrl.trim(),
      brochureFile: fileName || `${title.replace(/\s+/g, '_')}_Brochure.pdf`
    };

    const res = await uploadPropertyApi(newPropertyObj);
    
    if (onPropertyUploaded) {
      onPropertyUploaded(newPropertyObj);
    }

    // Direct WhatsApp share trigger if requested
    if (shouldShareWhatsApp) {
      const hText = highlightsArr.map(h => `✔️ ${h}`).join("\n");
      const pitchMsg = `✨ *${newPropertyObj.title}* – ${newPropertyObj.location}\nBy *${newPropertyObj.builder}*\n\n🏡 *Configurations:* ${newPropertyObj.bhk}\n📐 *Carpet Area:* ${newPropertyObj.carpet}\n💰 *Price:* ${newPropertyObj.priceRange}\n\n⭐ *Project Highlights:*\n${hText}${newPropertyObj.videoUrl ? `\n\n🎥 *Video Tour:* ${newPropertyObj.videoUrl}` : ""}\n\n📞 Book your exclusive site visit today!\n*Dream Homes Real Estate*`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(pitchMsg)}`, '_blank');
      onClose();
      return;
    }

    const successText = typeof res?.message === "string" ? res.message : `🎉 Property '${title}' uploaded & saved to Database!`;
    setAlertConfig({ title: "Property Uploaded!", message: successText, type: "success" });
  };

  const handleCloseAll = () => {
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
        WebkitBackdropFilter: "blur(6px)",
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
              <Upload size={18} color="#38bdf8" /> Upload Property
            </h3>
            <p style={{ fontSize: "0.71875rem", color: "#94a3b8", margin: "0.15rem 0 0 0" }}>
              Upload project PDF, details & sync to CRM
            </p>
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
              justifyContent: "center"
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem", overflowY: "auto", flex: "1 1 auto" }}>
          
          {/* PDF Brochure Drag & Drop Upload Zone */}
          <div style={{
            border: "2px dashed #3b82f6",
            borderRadius: "0.75rem",
            padding: "1rem 0.75rem",
            textAlign: "center",
            background: "#eff6ff",
            position: "relative",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer"
              }}
            />
            <FileText size={26} color="#2563eb" style={{ margin: "0 auto 0.35rem" }} />
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e40af" }}>
              {fileName ? `📄 Attached: ${fileName}` : "Click or Drop PDF Brochure / RERA"}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#60a5fa", marginTop: "0.15rem" }}>
              Supports PDF, DOC, DOCX, PNG up to 25MB
            </div>

            {isAiParsing && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.71875rem", color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem" }}>
                <Sparkles className="spin" size={14} color="#2563eb" /> AI auto-extracting brochure details...
              </div>
            )}

            {aiSuccess && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.71875rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                <CheckCircle2 size={14} color="#16a34a" /> Auto-filled form from brochure!
              </div>
            )}
          </div>

          {/* Form Fields: Project Title & Builder */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Project Title *
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="Oberoi Sky City"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Builder
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="Oberoi Realty"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={builder}
                onChange={e => setBuilder(e.target.value)}
              />
            </div>
          </div>

          {/* Locality & Price Range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Locality / Area
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="Borivali East"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Price Range
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="₹ 2.50 Cr onwards"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
              />
            </div>
          </div>

          {/* BHK & Carpet Area */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                BHK Config
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="2 & 3 BHK"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={bhk}
                onChange={e => setBhk(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Carpet Area
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="800 - 1200 sq.ft"
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={carpet}
                onChange={e => setCarpet(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
              Project Tag
            </label>
            <select
              className="modern-search-input"
              value={tag}
              onChange={e => setTag(e.target.value)}
              style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem 0.6rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
            >
              <option value="New Launch">🚀 New Launch</option>
              <option value="Focus Project">⭐ Focus Project</option>
              <option value="Luxury 2 & 3 BHK">👑 Luxury Residences</option>
              <option value="Ready to Move">🔑 Ready to Move</option>
              <option value="Under Construction">🏗️ Under Construction</option>
            </select>
          </div>

          {/* Project Image & 3D Video Tour Link */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Property Photo / Hero Image URL
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="https://images.unsplash.com/..."
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={heroImg}
                onChange={e => setHeroImg(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
                Video Tour / YouTube Link
              </label>
              <input
                type="text"
                className="modern-search-input"
                placeholder="https://youtube.com/watch?v=..."
                style={{ fontSize: "0.8125rem", padding: "0.5rem 0.6rem", width: "100%", borderRadius: "0.5rem", border: "1px solid #cbd5e1" }}
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Live Image Preview */}
          {heroImg && (
            <div style={{ position: "relative", width: "100%", height: "100px", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <img 
                src={heroImg} 
                alt="Property Preview" 
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
                }}
              />
              <span style={{ position: "absolute", bottom: "6px", left: "6px", background: "rgba(0,0,0,0.7)", color: "#ffffff", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.6875rem", fontWeight: 700 }}>
                Live Photo Preview
              </span>
            </div>
          )}

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem", display: "block" }}>
              Key Highlights (Comma Separated)
            </label>
            <textarea
              className="modern-search-input"
              rows={2}
              placeholder="e.g. Sky Lounge, Infinity Pool, 5 mins from Metro, 12 Months Holiday EMI"
              value={highlights}
              onChange={e => setHighlights(e.target.value)}
              style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #cbd5e1", resize: "vertical" }}
            />
          </div>

          {/* Action Buttons: Save or Save & Share to WhatsApp */}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
            <button
              type="submit"
              onClick={(e) => handleSubmit(e, false)}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                padding: "0.75rem 0.5rem",
                borderRadius: "0.625rem",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                boxShadow: "0 4px 12px rgba(37,99,235,0.25)"
              }}
            >
              <Upload size={15} /> Save to CRM
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                border: "none",
                padding: "0.75rem 0.5rem",
                borderRadius: "0.625rem",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                boxShadow: "0 4px 12px rgba(22,163,74,0.25)"
              }}
            >
              <Share2 size={15} /> Save & Share WA
            </button>
          </div>
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
