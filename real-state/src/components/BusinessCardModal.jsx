import React, { useState, useEffect } from "react";
import { X, Share2, Phone, Mail, MapPin, Printer, RotateCw, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { fetchDigitalBusinessCardApi, trackBusinessCardShareApi } from "../services/apiService";

// Exact Vector Replica of the Circular 3D Gold Monogram Ring Logo (Black D & Gold H)
const BrandLogo = ({ size = 68 }) => (
  <svg width={size} height={size} viewBox="0 0 140 140">
    <defs>
      <linearGradient id="dhGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="25%" stopColor="#eab308" />
        <stop offset="65%" stopColor="#ca8a04" />
        <stop offset="100%" stopColor="#854d0e" />
      </linearGradient>
      <filter id="dhShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#854d0e" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Outer Metallic Gold Circle Border Ring */}
    <circle cx="70" cy="70" r="60" fill="#ffffff" stroke="url(#dhGoldMetallic)" strokeWidth="6" filter="url(#dhShadow)" />
    <circle cx="70" cy="70" r="54" fill="none" stroke="url(#dhGoldMetallic)" strokeWidth="1.5" opacity="0.6" />

    {/* Black Outer Letter D */}
    <path
      d="M 44 32 H 72 C 96 32 96 108 72 108 H 44 V 32 Z M 56 44 V 96 H 72 C 84 96 84 44 72 44 Z"
      fill="#0f172a"
    />

    {/* Gold Inner Letter h */}
    <path
      d="M 44 60 V 108 M 44 76 H 64 C 74 76 74 108 74 108"
      fill="none"
      stroke="url(#dhGoldMetallic)"
      strokeWidth="11"
      strokeLinecap="square"
      strokeLinejoin="miter"
    />
  </svg>
);

export default function BusinessCardModal({ isOpen, onClose, agentProfile, currentUser: propUser }) {
  const [activeSide, setActiveSide] = useState("front");
  const [isExporting, setIsExporting] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);
  const [dbCard, setDbCard] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const emailToFetch = propUser?.email || agentProfile?.email || "shyampandey1104@gmail.com";
      fetchDigitalBusinessCardApi(emailToFetch).then((data) => {
        if (data) setDbCard(data);
      });
    }
  }, [isOpen, propUser, agentProfile]);

  if (!isOpen) return null;

  const currentUser = dbCard || propUser || agentProfile;
  const name = currentUser?.agent_name || currentUser?.full_name || currentUser?.name || "Shyam Pandey";
  const phone = currentUser?.mobile_no || currentUser?.phone || propUser?.mobile_no || propUser?.phone || "9867778229";
  const email = currentUser?.email || propUser?.email || "shyampandey1104@gmail.com";
  const reraNo = currentUser?.rera_no || propUser?.rera_no || "";
  const instagramId = currentUser?.instagram_id || propUser?.instagram_id || "";
  const facebookId = currentUser?.facebook_id || propUser?.facebook_id || "";
  const youtubeId = currentUser?.youtube_id || propUser?.youtube_id || "";

  const triggerToast = (msg) => {
    setToastAlert(msg);
    setTimeout(() => setToastAlert(null), 4000);
  };

  // High-Definition html2canvas DOM Snapshot Exporter (3x Resolution)
  const generateCardBlobFromDOM = async () => {
    const cardId = activeSide === "front" ? "printable-front-card" : "printable-back-card";
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return null;

    try {
      const canvas = await html2canvas(cardEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    } catch (err) {
      console.error("DOM Snapshot Error:", err);
      return null;
    }
  };

  const handleDownloadImage = async () => {
    trackBusinessCardShareApi(email, dbCard?.name);
    const blob = await generateCardBlobFromDOM();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dream_Homes_Business_Card_${name.replace(/\s+/g, '_')}.png`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("✅ Card PNG Image Downloaded! You can now send this image directly on WhatsApp.");
  };

  const handleCopyCardImage = async () => {
    trackBusinessCardShareApi(email, dbCard?.name);
    try {
      const blob = await generateCardBlobFromDOM();
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      triggerToast("📋 Card Image copied to Clipboard! Press Cmd+V / Ctrl+V in WhatsApp chat to paste.");
    } catch (e) {
      handleDownloadImage();
    }
  };

  const handleShare = async () => {
    trackBusinessCardShareApi(email, dbCard?.name);
    const blob = await generateCardBlobFromDOM();
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Only use navigator.share on mobile devices (Android/iOS) where WhatsApp app is registered natively
    if (isMobile && blob) {
      try {
        const file = new File([blob], `Dream_Homes_Card_${name.replace(/\s+/g, '_')}.png`, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          // Share ONLY the image file with NO text caption underneath
          await navigator.share({
            files: [file]
          });
          return;
        }
      } catch (e) {
        console.log("Mobile share fallback");
      }
    }

    // Desktop (Mac/Windows): Direct WhatsApp Web + Copy Image to Clipboard + Auto Download
    try {
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
      }
    } catch (err) {
      console.log("Clipboard write image fallback");
    }

    // Auto download PNG file
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Dream_Homes_Business_Card_${name.replace(/\s+/g, '_')}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    // Direct open WhatsApp Web without text caption
    window.open(`https://api.whatsapp.com/send`, '_blank');
    triggerToast("🖼️ Card Image copied to Clipboard! Paste it directly in WhatsApp chat.");
  };

  const handlePrint = () => {
    const frontEl = document.getElementById("printable-front-card");
    const backEl = document.getElementById("printable-back-card");

    const printWindow = window.open("", "_blank", "width=850,height=750");
    if (!printWindow) {
      setAlertConfig({ title: "Popups Blocked", message: "Please allow browser popups to enable Business Card printing.", type: "warning" });
      return;
    }

    const fontLink = `<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">`;
    let frontMarkup = frontEl ? frontEl.outerHTML.replace(/display:\s*none/g, "display: flex") : "";
    let backMarkup = backEl ? backEl.outerHTML.replace(/display:\s*none/g, "display: flex") : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dream Homes Business Card - ${name}</title>
          ${fontLink}
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: sans-serif;
              background: #ffffff;
              color: #000000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
              padding: 20px;
              gap: 15px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .card-outer-container {
              width: 440px !important;
              height: 215px !important;
              min-width: 440px !important;
              max-width: 440px !important;
              min-height: 215px !important;
              max-height: 215px !important;
              border: 1.5px solid #cbd5e1 !important;
              border-radius: 10px !important;
              overflow: hidden !important;
              box-shadow: 0 4px 15px rgba(0,0,0,0.12) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: flex !important;
              position: relative !important;
              margin: 0 auto !important;
              flex-shrink: 0 !important;
            }
            .card-outer-container > div {
              display: flex !important;
              width: 440px !important;
              height: 215px !important;
              min-width: 440px !important;
              min-height: 215px !important;
              margin: 0 !important;
              box-sizing: border-box !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 5px;">
            DREAM HOMES - Official Business Card (${name})
          </h2>

          <div style="text-align: center; margin-top: 5px;">
            <span style="font-size: 10px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px;">— FRONT SIDE —</span>
          </div>
          <div class="card-outer-container">
            ${frontMarkup}
          </div>

          <div style="text-align: center; margin-top: 10px;">
            <span style="font-size: 10px; font-weight: 700; color: #14532d; text-transform: uppercase; letter-spacing: 1px;">— BACK SIDE —</span>
          </div>
          <div class="card-outer-container">
            ${backMarkup}
          </div>

          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 350);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
      `}</style>

      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "95%",
          padding: "1rem",
          background: "#0f172a",
          borderRadius: "1rem",
          color: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc" }}>Digital Business Card</h3>
            <p style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Dream Homes Real Estate & Investment</p>
          </div>

          <div className="modal-header-actions" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={() => setActiveSide(activeSide === "front" ? "back" : "front")}
              style={{
                background: "#334155",
                color: "#f8fafc",
                border: "none",
                padding: "0.35rem 0.65rem",
                borderRadius: "0.4rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <RotateCw size={12} /> {activeSide === "front" ? "Show Back Side" : "Show Front Side"}
            </button>

            <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.2rem" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dual Side Container */}
        <div className="print-card-area" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* FRONT SIDE CARD (Matching Reference Design 100%) */}
          <div
            id="printable-front-card"
            style={{
              display: activeSide === "front" ? "flex" : "none",
              width: "100%",
              maxWidth: "440px",
              height: "215px",
              margin: "0 auto",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              background: "#ffffff",
              position: "relative",
              fontFamily: "sans-serif"
            }}
          >
            {/* Left Column (Warm Cream Panel) */}
            <div
              style={{
                width: "42%",
                background: "linear-gradient(180deg, #fefcf9 0%, #f7eee0 100%)",
                padding: "0.35rem 0.4rem 0.5rem 0.4rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                borderRight: "1.5px solid #e7d8c3",
                textAlign: "center"
              }}
            >
              {/* RERA NO Header Badge above Logo - Top Aligned (Only if exists in User DocType) */}
              {reraNo && String(reraNo).trim() !== "" && (
                <div
                  style={{
                    fontSize: "0.45rem",
                    fontWeight: "800",
                    color: "#b45309",
                    background: "linear-gradient(90deg, #fef3c7 0%, #fffbe6 100%)",
                    border: "1px solid #f59e0b",
                    borderRadius: "9999px",
                    padding: "0.15rem 0.45rem",
                    marginBottom: "0.15rem",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 3px rgba(245,158,11,0.12)"
                  }}
                >
                  RERA NO: {reraNo}
                </div>
              )}

              {/* Circular Gold Emblem Logo (User Uploaded 3D Gold Logo) */}
              <div style={{ marginBottom: "0.2rem" }}>
                <img 
                  src="/dreamhomes_gold_logo.jpg" 
                  alt="Dream Homes Gold Logo" 
                  style={{ 
                    width: "62px", 
                    height: "62px", 
                    objectFit: "contain",
                    filter: "drop-shadow(0px 3px 6px rgba(217,119,6,0.3))"
                  }} 
                />
              </div>

              {/* Title & Subtitle */}
              <div style={{ fontSize: "0.8125rem", fontWeight: "900", color: "#b45309", letterSpacing: "0.06em", lineHeight: "1.1" }}>
                DREAM HOMES
              </div>
              <div style={{ fontSize: "0.425rem", fontWeight: "800", color: "#475569", letterSpacing: "0.08em", margin: "0.15rem 0 0.4rem 0" }}>
                REAL ESTATE & INVESTMENT
              </div>

              {/* Dynamic Name in Dancing Script Cursive */}
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", lineHeight: "1" }}>
                {name}
              </div>

              {/* Gold Line Divider with Center Dot */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", width: "75%", marginTop: "0.35rem" }}>
                <div style={{ flex: 1, height: "1.5px", background: "linear-gradient(90deg, transparent, #d97706)" }}></div>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#d97706" }}></div>
                <div style={{ flex: 1, height: "1.5px", background: "linear-gradient(90deg, #d97706, transparent)" }}></div>
              </div>
            </div>

            {/* Right Column (Contact Details & Skyline) */}
            <div
              style={{
                width: "58%",
                padding: "0.65rem 0.75rem 0 0.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#ffffff",
                position: "relative"
              }}
            >
              {/* Top Header Protruding Gold Ribbon Badge - 100% Reference Replica */}
              <div
                style={{
                  background: "linear-gradient(180deg, #fefdfa 0%, #f6eee0 100%)",
                  border: "1.5px solid #d97706",
                  borderTopLeftRadius: "6px",
                  borderBottomLeftRadius: "6px",
                  borderTopRightRadius: "9999px",
                  borderBottomRightRadius: "9999px",
                  padding: "0.3rem 0.75rem",
                  textAlign: "center",
                  boxShadow: "-2px 3px 8px rgba(217,119,6,0.22)",
                  marginBottom: "0.35rem",
                  marginTop: "-0.25rem",
                  alignSelf: "stretch"
                }}
              >
                <div style={{ fontSize: "0.95rem", fontWeight: "900", letterSpacing: "0.04em", lineHeight: "1.1" }}>
                  <span style={{ color: "#0f172a" }}>DREAM </span>
                  <span style={{ color: "#d97706" }}>HOMES</span>
                </div>
                <div style={{ fontSize: "0.4875rem", fontWeight: "700", color: "#334155", letterSpacing: "0.06em", marginTop: "0.15rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                  <span style={{ width: "12px", height: "1.5px", background: "#d97706" }}></span>
                  <span>Real Eastate & Investment</span>
                  <span style={{ width: "12px", height: "1.5px", background: "#d97706" }}></span>
                </div>
              </div>

              {/* Contact Items with Gold Circles */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", zIndex: 2 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "radial-gradient(circle, #fde68a 0%, #d97706 100%)", border: "1px solid #b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                    <Phone size={10} color="#0f172a" />
                  </div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: "700", color: "#0f172a" }}>{phone}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "radial-gradient(circle, #fde68a 0%, #d97706 100%)", border: "1px solid #b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                    <Mail size={10} color="#0f172a" />
                  </div>
                  <span style={{ fontSize: "0.625rem", fontWeight: "600", color: "#1e293b", wordBreak: "break-all" }}>{email}</span>
                </div>

                {/* Instagram Row (Only rendered if exists in User DocType) */}
                {instagramId && String(instagramId).trim() !== "" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "radial-gradient(circle, #fde68a 0%, #d97706 100%)", border: "1px solid #b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </div>
                    <span style={{ fontSize: "0.625rem", fontWeight: "600", color: "#1e293b" }}>{String(instagramId).replace(/^@/, '')}</span>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "radial-gradient(circle, #fde68a 0%, #d97706 100%)", border: "1px solid #b45309", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
                    <MapPin size={10} color="#0f172a" />
                  </div>
                  <span style={{ fontSize: "0.5875rem", fontWeight: "600", color: "#334155", lineHeight: "1.2" }}>
                    Office No - F-38 Runwal City Centre, Kanjurmarg East, 400042
                  </span>
                </div>
              </div>

              {/* Golden City Skyline Graphic */}
              <div style={{ width: "100%", height: "28px", marginTop: "0.15rem", overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
                <svg width="100%" height="25" viewBox="0 0 400 60" preserveAspectRatio="none">
                  <path d="M0,60 L0,45 L10,45 L10,35 L20,35 L20,60 L30,60 L30,25 L45,25 L45,60 L55,60 L55,15 L70,15 L70,60 L85,60 L85,40 L100,40 L100,60 L115,60 L115,20 L130,20 L130,60 L145,60 L145,30 L160,30 L160,60 L175,60 L175,10 L195,10 L195,60 L210,60 L210,35 L225,35 L225,60 L240,60 L240,18 L255,18 L255,60 L270,60 L270,40 L285,40 L285,60 L300,60 L300,22 L315,22 L315,60 L330,60 L330,38 L345,38 L345,60 L360,60 L360,15 L380,15 L380,60 L400,60 Z" fill="#d97706" opacity="0.38" />
                </svg>
              </div>
            </div>
          </div>

          {/* BACK SIDE CARD - 100% Reference Match */}
          <div
            id="printable-back-card"
            style={{
              display: activeSide === "back" ? "flex" : "none",
              width: "100%",
              maxWidth: "440px",
              height: "215px",
              margin: "0 auto",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
              background: "#fffdf9",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem 0.5rem 0.8rem 0.5rem",
              position: "relative",
              fontFamily: "sans-serif",
              textAlign: "center"
            }}
          >
            {/* Top Faded Watermark Title */}
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: "900",
                color: "#e8d8c2",
                opacity: 0.75,
                letterSpacing: "0.08em",
                lineHeight: "1",
                userSelect: "none",
                marginTop: "0.2rem"
              }}
            >
              DREAM HOMES
            </div>

            {/* Middle Skyline Silhouette Watermark */}
            <div style={{ position: "absolute", top: "50px", width: "100%", height: "50px", opacity: 0.18, pointerEvents: "none" }}>
              <svg width="100%" height="50" viewBox="0 0 500 100" preserveAspectRatio="none">
                <path d="M0,100 L0,50 L20,50 L20,30 L40,30 L40,100 L60,100 L60,20 L90,20 L90,100 L110,100 L110,40 L140,40 L140,100 L160,100 L160,15 L200,15 L200,100 L220,100 L220,50 L250,50 L250,100 L270,100 L270,25 L310,25 L310,100 L330,100 L330,45 L360,45 L360,100 L380,100 L380,10 L420,10 L420,100 L450,100 L450,60 L500,60 L500,100 Z" fill="#b45309" />
              </svg>
            </div>

            {/* Center Circular Gold Monogram Ring Emblem Logo (User Uploaded 3D Gold Logo) */}
            <div style={{ margin: "-0.2rem 0", zIndex: 2 }}>
              <img 
                src="/dreamhomes_gold_logo.jpg" 
                alt="Dream Homes Gold Logo" 
                style={{ 
                  width: "82px", 
                  height: "82px", 
                  objectFit: "contain",
                  filter: "drop-shadow(0px 4px 10px rgba(217,119,6,0.35))"
                }} 
              />
            </div>

            {/* Bottom Bold Branding Text */}
            <div style={{ zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: "1.45rem", fontWeight: "900", letterSpacing: "0.04em", lineHeight: "1.1" }}>
                <span style={{ color: "#0d3822" }}>DREAM </span>
                <span style={{ color: "#d97706" }}>HOMES</span>
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#1e293b", letterSpacing: "0.18em", marginTop: "0.15rem" }}>
                Real Eastate & Investment
              </div>
            </div>
          </div>
        </div>

        {/* Toast Alert Banner */}
        {toastAlert && (
          <div
            style={{
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #10b981",
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              fontSize: "0.725rem",
              fontWeight: "600",
              marginTop: "0.75rem",
              textAlign: "center"
            }}
          >
            {toastAlert}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="modal-action-btns" style={{ display: "flex", gap: "0.4rem", marginTop: "0.85rem" }}>
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              background: "#25d366",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 0.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.725rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              boxShadow: "0 4px 12px rgba(37,211,102,0.3)"
            }}
          >
            <Share2 size={13} /> Share WhatsApp
          </button>

          <button
            onClick={handleDownloadImage}
            style={{
              flex: 1,
              background: "#d97706",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 0.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.725rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              boxShadow: "0 4px 12px rgba(217,119,6,0.3)"
            }}
          >
            <Download size={13} /> Download PNG
          </button>

          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "0.5rem 0.5rem",
              borderRadius: "0.5rem",
              fontSize: "0.725rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.25rem",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
            }}
          >
            <Printer size={13} /> 🖨️ Direct Print
          </button>
        </div>

        {alertConfig && (
          <CustomAlertDialog
            isOpen={!!alertConfig}
            onClose={() => setAlertConfig(null)}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
          />
        )}
      </div>
    </div>
  );
}
