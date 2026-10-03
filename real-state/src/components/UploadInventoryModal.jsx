import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Layers, FileText, Video, ClipboardList, CheckCircle2, Save, Link2, UploadCloud, Film } from "lucide-react";
import { 
  uploadUnitPlanApi, 
  uploadPropertyDocumentApi, 
  uploadPropertyVideoApi, 
  uploadPropertyListingApi 
} from "../services/apiService";
import CustomAlertDialog from "./CustomAlertDialog";

export default function UploadInventoryModal({ isOpen, onClose, mode = "unit_plan", defaultListingType = "My Listing", onItemUploaded }) {
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    if (isOpen) setAlertConfig(null);
  }, [isOpen]);

  const handleCloseAll = () => {
    setAlertConfig(null);
    onClose();
  };

  // Unit Plan state
  const [projectTitle, setProjectTitle] = useState("");
  const [bhkType, setBhkType] = useState("2 BHK");
  const [area, setArea] = useState("");
  const [planImg, setPlanImg] = useState("");

  // Document state
  const [docName, setDocName] = useState("");
  const [docProject, setDocProject] = useState("");
  const [docCategory, setDocCategory] = useState("Brochure");
  const [docSize, setDocSize] = useState("2.5 MB");
  const [docUrl, setDocUrl] = useState("");

  // Video state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoProject, setVideoProject] = useState("");
  const [videoDuration, setVideoDuration] = useState("03:30");
  const [videoThumb, setVideoThumb] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const videoFileInputRef = useRef(null);

  // Listing state
  const [listingCategory, setListingCategory] = useState(defaultListingType);
  const [listingTitle, setListingTitle] = useState("");
  const [listingLocality, setListingLocality] = useState("");
  const [listingPrice, setListingPrice] = useState("");
  const [listingOwner, setListingOwner] = useState("");
  const [listingPhone, setListingPhone] = useState("");
  const [listingStatus, setListingStatus] = useState("Active");
  const [listingCommission, setListingCommission] = useState("2.0% CP Split");

  if (!isOpen) return null;

  const handleVideoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return `https://img.youtube.com/vi/${watchMatch[1]}/hqdefault.jpg`;

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;

    const shortsMatch = url.match(/shorts\/([^?&]+)/);
    if (shortsMatch) return `https://img.youtube.com/vi/${shortsMatch[1]}/hqdefault.jpg`;

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "unit_plan") {
        const payload = {
          project: projectTitle,
          bhk_type: bhkType,
          area: area ? `${area} sq.ft. Carpet` : "750 sq.ft. Carpet",
          plan_img: planImg || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
        };
        const res = await uploadUnitPlanApi(payload);
        if (onItemUploaded) onItemUploaded("unit_plan", { project: `${projectTitle} - ${bhkType}`, area: payload.area, planImg: payload.plan_img });
        const successText = typeof res.message === "string" ? res.message : "Unit Plan saved to CRM Database!";
        setAlertConfig({ title: "Unit Plan Saved!", message: successText, type: "success" });
      } else if (mode === "document") {
        const payload = {
          document_name: docName,
          project: docProject,
          category: docCategory,
          file_size: docSize,
          file_url: docUrl || "/files/brochure.pdf"
        };
        const res = await uploadPropertyDocumentApi(payload);
        if (onItemUploaded) onItemUploaded("document", { name: docName, size: docSize, date: `${docCategory} (Verified)`, url: payload.file_url });
        const successText = typeof res.message === "string" ? res.message : "Document saved to CRM Database!";
        setAlertConfig({ title: "Document Saved!", message: successText, type: "success" });
      } else if (mode === "video") {
        // Auto extract YouTube thumbnail if user pasted YouTube link
        const ytThumb = getYouTubeThumbnail(videoUrl);
        const finalThumb = videoThumb || ytThumb || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";

        const payload = {
          title: videoTitle,
          project: videoProject,
          duration: videoDuration,
          thumbnail: finalThumb,
          video_url: videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        };
        const res = await uploadPropertyVideoApi(payload);
        if (onItemUploaded) onItemUploaded("video", { 
          title: videoTitle, 
          duration: videoDuration, 
          img: finalThumb, 
          url: payload.video_url,
          video_url: payload.video_url
        });
        const successText = typeof res.message === "string" ? res.message : "Video Walkthrough saved to CRM Database!";
        setAlertConfig({ title: "Video Saved!", message: successText, type: "success" });
      } else if (mode === "listing") {
        const payload = {
          listing_type: listingCategory,
          title: listingTitle,
          locality: listingLocality,
          price: listingPrice,
          owner_or_agent: listingOwner,
          phone: listingPhone,
          status: listingStatus,
          commission: listingCommission
        };
        const res = await uploadPropertyListingApi(payload);
        if (onItemUploaded) onItemUploaded("listing", {
          id: `LIST-${Date.now().toString().slice(-4)}`,
          property: listingTitle,
          locality: listingLocality,
          price: listingPrice,
          owner: listingOwner,
          agent: listingOwner,
          name: listingOwner,
          phone: listingPhone,
          broker: listingOwner,
          status: listingStatus,
          commission: listingCommission,
          listing_type: listingCategory
        });
        const successText = typeof res.message === "string" ? res.message : "Listing saved to CRM Database!";
        setAlertConfig({ title: "Listing Saved!", message: successText, type: "success" });
      }
    } catch (err) {
      setAlertConfig({
        title: "Upload Failed",
        message: "Failed to upload inventory item. Please try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === "unit_plan") return "Add Unit Floor Plan";
    if (mode === "document") return "Upload Project Document";
    if (mode === "video") return "Add 3D Virtual Video Tour";
    if (mode === "listing") return `Add New ${listingCategory}`;
    return "Add Inventory";
  };

  const getIcon = () => {
    if (mode === "unit_plan") return <Layers size={18} color="#2563eb" />;
    if (mode === "document") return <FileText size={18} color="#0284c7" />;
    if (mode === "video") return <Video size={18} color="#dc2626" />;
    return <ClipboardList size={18} color="#16a34a" />;
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
        {/* Modal Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {getIcon()}
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>{getTitle()}</h3>
              <p style={{ fontSize: "0.71875rem", color: "#94a3b8", margin: "0.1rem 0 0 0" }}>Save directly to CRM database</p>
            </div>
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

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: "1.25rem", overflowY: "auto", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          
          {/* MODE: UNIT PLAN */}
          {mode === "unit_plan" && (
            <>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Project Name *</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Kalpataru Vian" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>BHK Config</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. 2BHK Smart" value={bhkType} onChange={e => setBhkType(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Carpet Area (sq.ft)</label>
                  <input type="number" className="modern-search-input" placeholder="e.g. 780" value={area} onChange={e => setArea(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Floor Plan Image URL</label>
                <input type="url" className="modern-search-input" placeholder="https://images.unsplash.com/..." value={planImg} onChange={e => setPlanImg(e.target.value)} />
              </div>
            </>
          )}

          {/* MODE: DOCUMENT */}
          {mode === "document" && (
            <>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Document Name *</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Purva Estrella RERA Approval.pdf" value={docName} onChange={e => setDocName(e.target.value)} required />
              </div>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Project Name</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Purva Estrella" value={docProject} onChange={e => setDocProject(e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Category</label>
                  <select className="modern-search-input" value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                    <option value="RERA Certificate">RERA Certificate</option>
                    <option value="Brochure">Brochure</option>
                    <option value="Payment Plan">Payment Plan</option>
                    <option value="Master Layout">Master Layout</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>File Size</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. 4.2 MB" value={docSize} onChange={e => setDocSize(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Document PDF URL / Link</label>
                <input type="text" className="modern-search-input" placeholder="/files/document.pdf" value={docUrl} onChange={e => setDocUrl(e.target.value)} />
              </div>
            </>
          )}

          {/* MODE: VIDEO */}
          {mode === "video" && (
            <>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Video Title *</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Aditya Heights 4K Penthouse Walkthrough" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Upload MP4 Video File or Paste YouTube Link</label>
                
                {/* File Upload Trigger */}
                <div 
                  onClick={() => videoFileInputRef.current && videoFileInputRef.current.click()}
                  style={{
                    border: "2px dashed #cbd5e1",
                    background: "#f8fafc",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    textAlign: "center",
                    cursor: "pointer",
                    marginBottom: "0.5rem"
                  }}
                >
                  <input 
                    type="file" 
                    ref={videoFileInputRef} 
                    onChange={handleVideoFileUpload} 
                    accept="video/mp4,video/webm,video/mov,video/*" 
                    style={{ display: "none" }} 
                  />
                  <Film size={20} color="#2563eb" style={{ margin: "0 auto 0.25rem" }} />
                  <div style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#0f172a" }}>
                    {videoFile ? `✓ ${videoFile.name}` : "Click to select MP4 video from device"}
                  </div>
                </div>

                {/* Video URL Input */}
                <input 
                  type="text" 
                  className="modern-search-input" 
                  placeholder="OR paste YouTube / Vimeo link (e.g. https://www.youtube.com/watch?v=...)" 
                  value={videoUrl} 
                  onChange={e => {
                    setVideoUrl(e.target.value);
                    const yt = getYouTubeThumbnail(e.target.value);
                    if (yt) setVideoThumb(yt);
                  }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Project Name</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. Aditya Heights" value={videoProject} onChange={e => setVideoProject(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Duration</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. 03:30" value={videoDuration} onChange={e => setVideoDuration(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Thumbnail Image URL (Optional)</label>
                <input type="url" className="modern-search-input" placeholder="Auto-generated from YouTube or custom image URL" value={videoThumb} onChange={e => setVideoThumb(e.target.value)} />
              </div>
            </>
          )}

          {/* MODE: LISTING */}
          {mode === "listing" && (
            <>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Listing Category</label>
                <select className="modern-search-input" value={listingCategory} onChange={e => setListingCategory(e.target.value)}>
                  <option value="My Listing">My Listing</option>
                  <option value="Employee Listing">Employee Listing</option>
                  <option value="Owner Lead">Owner Lead</option>
                  <option value="Owner Listing">Owner Listing</option>
                  <option value="CP Listing">CP Listing</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Property Name & Unit *</label>
                <input type="text" className="modern-search-input" placeholder="e.g. Oberoi Sky City 3BHK" value={listingTitle} onChange={e => setListingTitle(e.target.value)} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Locality</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. Borivali East" value={listingLocality} onChange={e => setListingLocality(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Price</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. ₹ 3.25 Cr" value={listingPrice} onChange={e => setListingPrice(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Owner / Broker Name</label>
                  <input type="text" className="modern-search-input" placeholder="e.g. Vikram Sharma" value={listingOwner} onChange={e => setListingOwner(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.78125rem", fontWeight: 700, color: "#334155", marginBottom: "0.3rem", display: "block" }}>Phone Number</label>
                  <input type="tel" className="modern-search-input" placeholder="+91 98..." value={listingPhone} onChange={e => setListingPhone(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.65rem",
                borderRadius: "0.5rem",
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1.5,
                padding: "0.65rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
              }}
            >
              {loading ? "Saving..." : <><CheckCircle2 size={16} /> Save to Database</>}
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
