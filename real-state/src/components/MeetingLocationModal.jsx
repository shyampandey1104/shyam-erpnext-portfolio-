import React, { useState, useEffect } from "react";
import { 
  X, MapPin, Navigation, Share2, Send, Copy, CheckCircle2, 
  Building2, Compass, Layers, ExternalLink, ShieldCheck, Sparkles, MessageSquare, RefreshCw, Car
} from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";
import { fetchMeetingLocationsApi } from "../services/apiService";

export default function MeetingLocationModal({ isOpen, onClose, clientName = "Client", initialLocation = "Andheri West Sales Office" }) {
  const [currentAddress, setCurrentAddress] = useState("Dream Homes HQ, Lotus Grandeur, Veera Desai Road, Andheri West, Mumbai - 400053");
  const [gpsCoords, setGpsCoords] = useState({ lat: "19.1363", lng: "72.8277" });
  const [isLocating, setIsLocating] = useState(false);
  const [propertiesList, setPropertiesList] = useState([
    { id: 1, name: "Kalpataru Vian", area: "Andheri West", bhk: "2 & 3 BHK", price: "₹ 2.10 Cr", address: "New Link Road, Opp. Citi Mall, Andheri West", coords: "19.1385,72.8312", distance: "0.8 km away" },
    { id: 2, name: "Oberoi Sky City", area: "Goregaon East", bhk: "3 & 4 BHK", price: "₹ 3.40 Cr", address: "Off Western Express Highway, Goregaon East", coords: "19.1550,72.8620", distance: "4.2 km away" },
    { id: 3, name: "Rustomjee Elements", area: "Juhu / Upper Juhu", bhk: "4 BHK Luxury", price: "₹ 6.50 Cr", address: "DN Nagar, Near Indian Oil Nagar, Juhu", coords: "19.1220,72.8290", distance: "2.1 km away" },
    { id: 4, name: "Godrej Horizon", area: "Wadala", bhk: "2 BHK Smart", price: "₹ 1.95 Cr", address: "RRA Area, Wadala West, Mumbai", coords: "19.0210,72.8560", distance: "12 km away" }
  ]);
  const [alertConfig, setAlertConfig] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMeetingLocationsApi().then(data => {
        if (data) {
          if (data.office_address) setCurrentAddress(data.office_address);
          if (data.property_pins && data.property_pins.length > 0) {
            setPropertiesList(data.property_pins);
          }
        }
      });

      if (navigator.geolocation) {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsCoords({
              lat: pos.coords.latitude.toFixed(4),
              lng: pos.coords.longitude.toFixed(4)
            });
            setIsLocating(false);
          },
          () => {
            setIsLocating(false);
          },
          { timeout: 5000 }
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mapsUrl = `https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`;
  const directNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${gpsCoords.lat},${gpsCoords.lng}`;

  const handleShareWhatsAppLive = () => {
    const text = encodeURIComponent(`📍 *Meeting & Live Location Shared*\n\nHello ${clientName}!\nHere is my live GPS location for our meeting:\n📍 Address: ${currentAddress}\n🧭 Open Google Maps: ${mapsUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setAlertConfig({ title: "Location Shared!", message: `Live GPS Location sent via WhatsApp for ${clientName}!`, type: "success" });
  };

  const handleSharePropertyWhatsApp = (prop) => {
    const propMapsUrl = `https://maps.google.com/?q=${prop.coords}`;
    const text = encodeURIComponent(`🏢 *Property Site Visit Location Shared*\n\nProject: *${prop.name}* (${prop.area})\nBHK: ${prop.bhk || '2 & 3 BHK'}\n📍 Address: ${prop.address}\n🧭 Navigate on Google Maps: ${propMapsUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    setAlertConfig({ title: "Property Pin Shared!", message: `Google Maps Location pin for ${prop.name} shared via WhatsApp!`, type: "success" });
  };

  const handleOpenDirectNav = (coords) => {
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords || `${gpsCoords.lat},${gpsCoords.lng}`}`;
    window.open(navUrl, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mapsUrl);
    setAlertConfig({ title: "Link Copied! 📋", message: `Google Maps location link copied to clipboard:\n${mapsUrl}`, type: "success" });
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.85)",
        backdropFilter: "blur(8px)",
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
          maxWidth: "380px",
          width: "92%",
          maxHeight: "calc(100% - 1rem)",
          overflowY: "auto",
          borderRadius: "1.5rem",
          background: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          padding: 0,
          border: "1px solid rgba(255, 255, 255, 0.2)",
          animation: "scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Luxury Header Banner */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "1.1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "0.625rem",
              background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(2, 132, 199, 0.35)"
            }}>
              <MapPin size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>
                Live Google Maps Radar
              </h3>
              <span style={{ fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 500 }}>
                Meeting Location & MariaDB Property Pins
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "none",
              color: "#cbd5e1",
              cursor: "pointer",
              padding: "0.35rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.1rem" }}>
          {/* Real Embedded Google Maps Viewport */}
          <div style={{
            position: "relative",
            height: "185px",
            borderRadius: "1rem",
            overflow: "hidden",
            background: "#e2e8f0",
            border: "2px solid #cbd5e1",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)"
          }}>
            <iframe
              title="Google Map Live View"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://maps.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}&z=14&output=embed`}
            />

            {/* Top Floating Glassmorphic Badge */}
            <div style={{ position: "absolute", top: "10px", left: "10px", right: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2, pointerEvents: "none" }}>
              <span style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)", padding: "0.25rem 0.65rem", borderRadius: "9999px", fontSize: "0.6875rem", fontWeight: "700", color: "#ffffff", boxShadow: "0 4px 10px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "pulse 1.5s infinite" }}></span>
                {isLocating ? "Locating Satellite..." : "Live Satellite GPS Active"}
              </span>
              
              <button 
                onClick={() => handleOpenDirectNav()} 
                style={{
                  pointerEvents: "auto",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.25rem 0.6rem",
                  borderRadius: "9999px",
                  fontSize: "0.65rem",
                  fontWeight: "800",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  boxShadow: "0 4px 10px rgba(37,99,235,0.4)"
                }}
              >
                <Navigation size={11} /> 🧭 Open Map
              </button>
            </div>
          </div>

          {/* Verified Address Card */}
          <div style={{
            background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)",
            padding: "0.75rem 0.875rem",
            borderRadius: "0.875rem",
            border: "1px solid #bfdbfe",
            marginTop: "0.875rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.06)"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1e40af", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                📍 Verified Meeting Address
              </span>
              <span style={{ fontSize: "0.65rem", background: "#dcfce7", color: "#15803d", fontWeight: "800", padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>
                ● Active
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#334155", fontWeight: "600", lineHeight: "1.4" }}>
              {currentAddress}
            </div>
            <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: "500" }}>
              GPS Coords: {gpsCoords.lat}° N, {gpsCoords.lng}° E
            </div>
          </div>

          {/* Quick Action Share Buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", margin: "0.875rem 0" }}>
            <button
              onClick={handleShareWhatsAppLive}
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.7rem 0.5rem",
                fontSize: "0.78125rem",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                transition: "transform 0.1s ease"
              }}
            >
              <Send size={15} /> Share via WhatsApp
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                background: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "0.75rem",
                padding: "0.7rem 0.5rem",
                fontSize: "0.78125rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
              }}
            >
              <Copy size={15} color="#2563eb" /> Copy Map Link
            </button>
          </div>

          {/* Section 2: Dynamic MariaDB Nearby Property Map Pins Radar */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.875rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
              <h4 style={{ fontSize: "0.84375rem", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Building2 size={16} color="#2563eb" /> MariaDB Property Locations
              </h4>
              <span style={{ fontSize: "0.65rem", background: "#eff6ff", color: "#2563eb", fontWeight: "800", padding: "0.15rem 0.5rem", borderRadius: "9999px", border: "1px solid #bfdbfe" }}>
                {propertiesList.length} Pins Synced
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {propertiesList.map(prop => (
                <div 
                  key={prop.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 0.875rem",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.84375rem", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        🏢 {prop.name}
                        <span style={{ fontSize: "0.65rem", background: "#f1f5f9", color: "#475569", fontWeight: "700", padding: "0.1rem 0.4rem", borderRadius: "9999px" }}>
                          {prop.area}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.71875rem", color: "#64748b", marginTop: "0.15rem" }}>
                        {prop.address}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.35rem", borderTop: "1px dashed #e2e8f0", fontSize: "0.6875rem" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      📍 {prop.distance || "Near Site Office"}
                    </span>
                    <span style={{ color: "#2563eb", fontWeight: "800" }}>
                      {prop.bhk || "2 & 3 BHK"}
                    </span>
                  </div>

                  {/* Dual Action Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginTop: "0.1rem" }}>
                    <button
                      onClick={() => handleOpenDirectNav(prop.coords)}
                      style={{
                        background: "#f1f5f9",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "0.5rem",
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.725rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <Car size={13} color="#2563eb" /> Navigate Map
                    </button>

                    <button
                      onClick={() => handleSharePropertyWhatsApp(prop)}
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        border: "1px solid #bfdbfe",
                        borderRadius: "0.5rem",
                        padding: "0.35rem 0.5rem",
                        fontSize: "0.725rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.25rem"
                      }}
                    >
                      <Share2 size={13} /> WhatsApp Pin
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
