import React, { useEffect, useRef, useState } from "react";
import { PhoneCall, PhoneOff, PhoneIncoming, User, MapPin, Building, Sparkles, Smartphone } from "lucide-react";

export default function InboundCallModal({ lead, incomingLead, onAccept, onReject, onDecline, userProfile }) {
  const currentLead = lead || incomingLead;
  const handleDecline = onReject || onDecline;
  const audioCtxRef = useRef(null);
  const ringIntervalRef = useRef(null);
  const [countdown, setCountdown] = useState(25);

  const agentPhone = userProfile?.mobile_no || userProfile?.phone || "9867778229";
  const agentName = userProfile?.name || "Shyam Pandey";

  // Auto-decline / Missed Call timer after 25 seconds
  useEffect(() => {
    if (!currentLead) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (handleDecline) handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentLead, handleDecline]);

  // Synthesize realistic phone ringtone via browser Web Audio API
  useEffect(() => {
    if (!currentLead) return;

    // Trigger haptic vibration if supported (Mobile devices)
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        if (!navigator.userActivation || navigator.userActivation.hasBeenActive) {
          navigator.vibrate([500, 250, 500, 250, 1000]);
        }
      } catch (e) {}
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const playRingTone = () => {
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }
          const now = ctx.currentTime;
          
          // Dual frequency phone ring (440Hz + 480Hz US/India standard cadence)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.8);
          osc2.stop(now + 1.8);
        };

        // Ring initially and every 3.5 seconds
        playRingTone();
        ringIntervalRef.current = setInterval(playRingTone, 3500);
      }
    } catch (err) {
      console.log("[Inbound Ringtone notice]", err);
    }

    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch (e) {}
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch (e) {}
      }
    };
  }, [currentLead]);

  if (!currentLead) return null;

  return (
    <div 
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div 
        className="inbound-ring-card"
        style={{
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "1.5rem",
          padding: "2rem 1.5rem",
          maxWidth: "380px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.3)",
          color: "#ffffff",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {/* Logged in Agent Route Banner */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.35)",
          padding: "0.3rem 0.75rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 700,
          color: "#6ee7b7",
          marginBottom: "1rem"
        }}>
          <Smartphone size={13} color="#34d399" />
          <span>Call to: <strong>{agentPhone}</strong> ({agentName})</span>
        </div>

        {/* Animated Radar Ripples & Icon */}
        <div style={{ position: "relative", width: "84px", height: "84px", margin: "0 auto 1rem auto" }}>
          <div 
            style={{
              position: "absolute",
              inset: "-12px",
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.3)",
              animation: "ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite"
            }}
          />
          <div 
            style={{
              position: "absolute",
              inset: "-4px",
              borderRadius: "50%",
              background: "rgba(37, 99, 235, 0.5)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            }}
          />
          <div 
            style={{
              position: "relative",
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(37, 99, 235, 0.5)"
            }}
          >
            <PhoneIncoming size={38} color="#ffffff" style={{ animation: "bounce 1s infinite" }} />
          </div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(37, 99, 235, 0.2)", border: "1px solid rgba(37, 99, 235, 0.4)", padding: "0.2rem 0.65rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, color: "#93c5fd", marginBottom: "0.5rem" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", display: "inline-block", animation: "pulse 1s infinite" }} />
          DIRECT INCOMING CALL ({countdown}s)
        </div>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.2rem 0", color: "#f8fafc" }}>
          {currentLead.name || currentLead.lead_name || "Direct Inbound Caller"}
        </h2>
        <p style={{ color: "#93c5fd", fontSize: "1rem", fontWeight: 800, margin: "0 0 0.85rem 0", letterSpacing: "0.02em" }}>
          {currentLead.phone || "+91 98205 91823"}
        </p>

        {/* Lead Details Card */}
        <div style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "0.875rem", padding: "0.75rem 0.875rem", textAlign: "left", marginBottom: "1.5rem", fontSize: "0.8125rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ color: "#94a3b8" }}>Source:</span>
            <span style={{ fontWeight: 700, color: "#60a5fa" }}>{currentLead.source || "Direct Inbound Call"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ color: "#94a3b8" }}>Looking For:</span>
            <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{currentLead.bhkType || currentLead.bhk_type || "2 BHK"} • {currentLead.service || "Home Buying"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#94a3b8" }}>Location:</span>
            <span style={{ fontWeight: 700, color: "#f1f5f9" }}>{currentLead.location || "Mumbai"}</span>
          </div>
        </div>

        {/* Action Buttons: Decline (Red) & Accept (Green) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem" }}>
          <div style={{ textAlign: "center" }}>
            <button 
              onClick={() => handleDecline && handleDecline()} 
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.5)",
                transition: "transform 0.15s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              title="Decline Call"
            >
              <PhoneOff size={28} />
            </button>
            <span style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", fontWeight: 600 }}>Decline</span>
          </div>

          <div style={{ textAlign: "center" }}>
            <button 
              onClick={() => onAccept && onAccept(currentLead)} 
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                border: "none",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.6)",
                animation: "pulse 1.5s infinite",
                transition: "transform 0.15s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              title="Accept Call"
            >
              <PhoneCall size={28} />
            </button>
            <span style={{ display: "block", fontSize: "0.75rem", color: "#34d399", marginTop: "0.5rem", fontWeight: 700 }}>Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
