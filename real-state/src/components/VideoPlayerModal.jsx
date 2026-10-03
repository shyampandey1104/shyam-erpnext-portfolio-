import React from "react";
import { X, Play, Share2, ExternalLink, Film } from "lucide-react";

export default function VideoPlayerModal({ isOpen, onClose, video }) {
  if (!isOpen || !video) return null;

  // Extract or generate YouTube Embed URL
  const getEmbedInfo = (url) => {
    if (!url) {
      return { isEmbed: true, src: "https://www.youtube.com/embed/kXYiU_JCYtU?autoplay=1&rel=0" };
    }

    if (url.includes("youtube.com/embed/")) {
      return { isEmbed: true, src: url.includes("autoplay") ? url : `${url}?autoplay=1&rel=0` };
    }

    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
      return { isEmbed: true, src: `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&rel=0` };
    }

    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) {
      return { isEmbed: true, src: `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0` };
    }

    const shortsMatch = url.match(/shorts\/([^?&]+)/);
    if (shortsMatch) {
      return { isEmbed: true, src: `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0` };
    }

    const lower = url.toLowerCase();
    if (
      lower.startsWith("blob:") || 
      lower.startsWith("data:video") || 
      lower.endsWith(".mp4") || 
      lower.endsWith(".webm") || 
      lower.endsWith(".mov")
    ) {
      return { isEmbed: false, src: url };
    }

    // Default to YouTube embed
    return { isEmbed: true, src: "https://www.youtube.com/embed/kXYiU_JCYtU?autoplay=1&rel=0" };
  };

  const videoTarget = video.url || video.video_url;
  const { isEmbed, src } = getEmbedInfo(videoTarget);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
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
          background: "#0f172a",
          borderRadius: "1.25rem",
          width: "100%",
          maxWidth: "390px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.85)",
          border: "1px solid #334155",
          overflow: "hidden",
          color: "#ffffff"
        }}
      >
        {/* Header */}
        <div style={{
          padding: "0.85rem 1.15rem",
          borderBottom: "1px solid #1e293b",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Film size={16} color="#ffffff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#ffffff" }}>
                {video.title}
              </h3>
              <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: "0.1rem 0 0 0" }}>
                {video.duration || "4K HD Tour"} • 3D Virtual Walkthrough
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
              marginLeft: "0.5rem",
              flexShrink: 0
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Video Player Frame */}
        <div style={{ width: "100%", height: "230px", background: "#000000", position: "relative" }}>
          {isEmbed ? (
            <iframe
              src={src}
              title={video.title}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video
              src={src}
              controls
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000000" }}
            />
          )}
        </div>

        {/* Video Info & Controls */}
        <div style={{ padding: "0.85rem 1.15rem", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#f8fafc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {video.title}
            </div>
            <div style={{ fontSize: "0.6875rem", color: "#60a5fa", marginTop: "0.15rem" }}>
              🎬 HD Virtual Tour • Dream Homes
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
            {videoTarget && (
              <button
                onClick={() => window.open(videoTarget, "_blank")}
                style={{
                  background: "#334155",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.4rem 0.55rem",
                  borderRadius: "0.4rem",
                  fontSize: "0.71875rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.2rem"
                }}
                title="Open Video in New Tab"
              >
                <ExternalLink size={12} />
              </button>
            )}

            <button
              onClick={() => {
                const text = encodeURIComponent(`🎥 Watch 3D Virtual Video Tour of *${video.title}*: ${videoTarget || src}`);
                window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
              }}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "0.4rem 0.65rem",
                borderRadius: "0.4rem",
                fontSize: "0.71875rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                whiteSpace: "nowrap"
              }}
            >
              <Share2 size={12} /> Share Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
