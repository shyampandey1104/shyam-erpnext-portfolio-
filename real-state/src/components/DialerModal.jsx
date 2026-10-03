import React, { useState, useEffect, useRef } from "react";
import { PhoneOff, Send, Clock, CheckCircle2, Mic, MicOff, Sparkles, Volume2, VolumeX, User, MapPin, Check, Play, Pause, Disc, FileText, RotateCcw, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { UniversalAudioRecorder } from "../utils/audioRecorder";
import CustomAlertDialog from "./CustomAlertDialog";

export default function DialerModal({ lead, onClose, onSaveCall }) {
  // Stage: 'CALLING' (active call screen) or 'DISPOSITION' (post-call form)
  const [callState, setCallState] = useState(() => {
    return sessionStorage.getItem(`crm_call_state_${lead?.id}`) || "CALLING";
  });
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState("00:00");
  const [alertConfig, setAlertConfig] = useState(null);

  // Audio Recorder State
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [recordedAudioBase64, setRecordedAudioBase64] = useState(null);
  const [isRecordingMic, setIsRecordingMic] = useState(false);
  const [liveVolume, setLiveVolume] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const recorderRef = useRef(null);
  const audioElementRef = useRef(null);
  const volumeIntervalRef = useRef(null);

  const getCurrentLocalDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [outcome, setOutcome] = useState("Interested");
  const [bhkType, setBhkType] = useState(lead?.bhkType || "2 BHK");
  const [notes, setNotes] = useState(lead?.notes || "");
  const [followupDate, setFollowupDate] = useState(getCurrentLocalDateTime());
  const [isListening, setIsListening] = useState(false);

  // Initialize Real Microphone Recording when Call Screen Mounts
  useEffect(() => {
    const rec = new UniversalAudioRecorder();
    recorderRef.current = rec;

    rec.start()
      .then(() => {
        setIsRecordingMic(true);
        console.log("[DialerModal] Microphone capturing live audio...");

        // Monitor volume level for visual sound waves
        volumeIntervalRef.current = setInterval(() => {
          if (recorderRef.current && recorderRef.current.isRecording) {
            const vol = recorderRef.current.getVolumeLevel();
            setLiveVolume(vol);
          }
        }, 100);
      })
      .catch((err) => {
        console.log("[DialerModal] Microphone notice:", err.message);
        setIsRecordingMic(false);
      });

    return () => {
      if (recorderRef.current && recorderRef.current.isRecording) {
        recorderRef.current.stop().catch(() => {});
      }
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
    };
  }, []);

  // Active call timer
  useEffect(() => {
    let timer;
    if (callState === "CALLING") {
      timer = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle Microphone Manual Recording
  const toggleMicRecording = async () => {
    if (isRecordingMic) {
      if (recorderRef.current) {
        const result = await recorderRef.current.stop();
        if (result && result.url) {
          setRecordedAudioUrl(result.url);
          setRecordedAudioBase64(result.base64);
        }
      }
      if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);
      setIsRecordingMic(false);
    } else {
      const rec = new UniversalAudioRecorder();
      recorderRef.current = rec;
      try {
        await rec.start();
        setIsRecordingMic(true);
        volumeIntervalRef.current = setInterval(() => {
          if (recorderRef.current && recorderRef.current.isRecording) {
            setLiveVolume(recorderRef.current.getVolumeLevel());
          }
        }, 100);
      } catch (err) {
        setAlertConfig({
          title: "Microphone Access Required",
          message: "Please allow microphone permission to record audio.",
          type: "warning"
        });
      }
    }
  };

  // Stop Recording & Transition to Disposition
  const handleEndCall = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const durationStr = formatTimer(seconds);
    setCallDuration(durationStr);

    if (volumeIntervalRef.current) clearInterval(volumeIntervalRef.current);

    if (recorderRef.current && recorderRef.current.isRecording) {
      try {
        const result = await recorderRef.current.stop();
        if (result && result.url) {
          setRecordedAudioUrl(result.url);
          setRecordedAudioBase64(result.base64);
        }
      } catch (err) {
        console.error("Error stopping recorder:", err);
      }
    }
    setIsRecordingMic(false);

    setCallState("DISPOSITION");
    try {
      sessionStorage.setItem(`crm_call_state_${lead?.id}`, "DISPOSITION");
    } catch (err) {}
    if (isListening) setIsListening(false);
  };

  // Toggle Real Audio Playback (NO FAKE ROBOT VOICE)
  const toggleAudioPlayback = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const audio = audioElementRef.current;
    if (!audio || !recordedAudioUrl) {
      setAlertConfig({
        title: "No Audio Recorded",
        message: "No voice was captured during this call. You can tap 'Re-record' to record a voice note now!",
        type: "info"
      });
      return;
    }

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.currentTime = 0;
      audio.play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          console.error("Audio playback error:", err);
          setIsPlayingAudio(false);
        });
    }
  };

  const handleDownloadRecording = () => {
    if (!recordedAudioUrl) return;
    const a = document.createElement("a");
    a.href = recordedAudioUrl;
    a.download = `Call_Recording_${lead.id}_${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Voice-to-Text Speech Recognition (Web Speech API)
  const toggleVoiceDictation = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAlertConfig({ title: "Dictation Unavailable", message: "Browser Speech Recognition not supported on this browser. You can type notes directly.", type: "warning" });
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-IN";

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (ev) => {
          const transcript = ev.results[0][0].transcript;
          setNotes(prev => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // AI Grammar Polish & Auto-Correct Notes
  const autoCorrectGrammar = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!notes.trim()) {
      setAlertConfig({ title: "Notes Required", message: "Please enter or dictate call notes first!", type: "warning" });
      return;
    }
    let corrected = notes
      .replace(/\b2bhk\b/gi, "2 BHK")
      .replace(/\b3bhk\b/gi, "3 BHK")
      .replace(/\b4bhk\b/gi, "4 BHK")
      .replace(/\blocation\b/gi, "Location")
      .replace(/\bbudget\b/gi, "Budget")
      .replace(/\bsite visit\b/gi, "Site Visit")
      .replace(/\bcall back\b/gi, "Callback")
      .replace(/\s+/g, " ")
      .trim();

    if (!corrected.endsWith(".")) corrected += ".";
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
    setNotes(corrected);
  };

  const handleSave = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      sessionStorage.removeItem(`crm_call_state_${lead?.id}`);
    } catch (err) {}
    if (outcome === "Deal Closed (Won)") {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    }

    onSaveCall({
      leadId: lead.id,
      duration: callDuration || formatTimer(seconds),
      outcome,
      bhkType,
      notes,
      followupDate,
      recordedAudioUrl: recordedAudioBase64 || recordedAudioUrl || ""
    });
  };

  const handleCancelClose = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      sessionStorage.removeItem(`crm_call_state_${lead?.id}`);
    } catch (err) {}
    onClose();
  };

  if (!lead) return null;

  const dispositionOptions = [
    { label: "Interested", icon: "🔥", desc: "Customer interested & engaged" },
    { label: "Not Interested", icon: "❌", desc: "Budget or location mismatch" },
    { label: "Callback", icon: "📞", desc: "Customer requested callback" },
    { label: "Follow Ups", icon: "⏰", desc: "Scheduled follow-up" },
    { label: "Scheduled Site Visit", icon: "📅", desc: "Site visit confirmed" },
    { label: "Deal Closed (Won)", icon: "🎉", desc: "Booking / Token received" },
    { label: "Busy / Line Busy", icon: "⏳", desc: "Call waiting or line busy" },
    { label: "Left Voicemail / WA", icon: "✉️", desc: "Message left on WhatsApp" },
    { label: "Switch Off", icon: "📵", desc: "Mobile unreachable / switched off" },
    { label: "Hung Up", icon: "📴", desc: "Call disconnected / hung up" }
  ];

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.85)", 
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 99999,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "0.75rem",
        overflowY: "auto"
      }}
    >
      {/* Real HTML5 Audio Player Element for Real Voice Playback */}
      {recordedAudioUrl && (
        <audio
          ref={audioElementRef}
          src={recordedAudioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
          onLoadedMetadata={(e) => setAudioDuration(e.target.duration)}
          onEnded={() => {
            setIsPlayingAudio(false);
            setCurrentTime(0);
          }}
          style={{ display: "none" }}
        />
      )}

      {/* STAGE 1: ACTIVE CALLING SCREEN */}
      {callState === "CALLING" ? (
        <div 
          className="dialer-modal-content" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ 
            width: "100%", 
            maxWidth: "380px", 
            background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", 
            borderRadius: "1.5rem", 
            padding: "2rem 1.5rem", 
            textAlign: "center", 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)", 
            color: "#ffffff",
            position: "relative",
            margin: "auto",
            border: "1px solid #334155"
          }}
        >
          {/* Avatar Pulse Animation */}
          <div style={{ position: "relative", width: "100px", height: "100px", margin: "0 auto 1.25rem auto" }}>
            <div className="pulsing-call-ring" style={{ position: "absolute", inset: -10, borderRadius: "50%", background: "rgba(37, 99, 235, 0.2)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px rgba(37, 99, 235, 0.5)" }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 800 }}>
                {lead.name ? lead.name.charAt(0).toUpperCase() : "C"}
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.35rem 0", letterSpacing: "-0.02em" }}>{lead.name}</h2>
          <p style={{ fontSize: "0.95rem", color: "#94a3b8", margin: "0 0 0.5rem 0", fontWeight: 600 }}>{lead.phone}</p>
          <div style={{ fontSize: "0.8125rem", color: "#60a5fa", background: "rgba(37, 99, 235, 0.15)", border: "1px solid rgba(37, 99, 235, 0.3)", padding: "0.25rem 0.75rem", borderRadius: "9999px", display: "inline-block", marginBottom: "1.25rem" }}>
            🏢 {lead.bhkType || "2 BHK"} • {lead.location}
          </div>

          {/* Real Audio Recording Status Indicator with Live Microphone Meter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", marginBottom: "1.25rem" }}>
            <button
              type="button"
              onClick={toggleMicRecording}
              style={{
                background: isRecordingMic ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                border: isRecordingMic ? "1px solid #ef4444" : "1px solid #22c55e",
                color: isRecordingMic ? "#fca5a5" : "#86efac",
                padding: "0.35rem 0.85rem",
                borderRadius: "9999px",
                fontSize: "0.78125rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isRecordingMic ? "#ef4444" : "#22c55e", display: "inline-block", animation: "pulse 1.2s infinite" }} />
              <span>{isRecordingMic ? "🔴 Live Voice Recording Active" : "Tap to Start Microphone"}</span>
            </button>

            {/* Live Audio Visualizer Bars responding to voice volume */}
            {isRecordingMic && (
              <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "20px", marginTop: "4px" }}>
                {[10, 18, 14, 22, 16, 24, 20, 15, 26, 18, 22, 14, 19].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: "3px",
                      height: `${Math.max(4, Math.min(24, h * (1 + liveVolume / 50)))}px`,
                      background: liveVolume > 15 ? "#22c55e" : "#38bdf8",
                      borderRadius: "9999px",
                      transition: "height 0.1s ease"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Call Duration Timer */}
          <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "monospace", letterSpacing: "2px", color: "#38bdf8", marginBottom: "1.75rem" }}>
            {formatTimer(seconds)}
          </div>

          {/* Quick Call Action Controls */}
          <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginBottom: "2rem" }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
              style={{
                background: isMuted ? "#ef4444" : "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "none",
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsSpeakerOn(!isSpeakerOn); }}
              style={{
                background: isSpeakerOn ? "#2563eb" : "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "none",
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {isSpeakerOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
          </div>

          {/* END CALL BUTTON */}
          <button
            type="button"
            onClick={handleEndCall}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.9rem",
              borderRadius: "0.75rem",
              fontSize: "1rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 10px 25px rgba(239, 68, 68, 0.4)"
            }}
          >
            <PhoneOff size={20} /> End Call & Open Disposition Form
          </button>
        </div>
      ) : (
        /* STAGE 2: POST-CALL FEEDBACK & DISPOSITION FORM */
        <div 
          className="dialer-modal-content" 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{ 
            width: "100%", 
            maxWidth: "390px", 
            maxHeight: "88vh",
            background: "#ffffff", 
            borderRadius: "1.25rem", 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            margin: "auto",
            position: "relative",
            border: "1px solid #cbd5e1",
            overflow: "hidden"
          }}
        >
          {/* Header Summary */}
          <div className="dialer-header" style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", flexShrink: 0 }}>
            <div className="dialer-caller-info">
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>{lead.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "2px" }}>
                {lead.phone} • {lead.location} ({bhkType})
              </div>
            </div>

            <div className="dialer-timer-badge" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "0.35rem 0.75rem", borderRadius: "9999px", fontWeight: 800, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={16} />
              <span>{callDuration}</span>
            </div>
          </div>

          <div className="dialer-body" style={{ padding: "1rem 1.25rem", overflowY: "auto", flex: "1 1 auto" }}>
            {/* Real Live Call Audio Recording Player */}
            <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)", border: "1px solid #cbd5e1", borderRadius: "0.875rem", padding: "0.75rem 0.875rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: "800", color: "#0f172a", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  🎙️ Live Call Voice Recording
                </span>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  {recordedAudioUrl && (
                    <button
                      type="button"
                      onClick={handleDownloadRecording}
                      style={{
                        background: "#f1f5f9",
                        color: "#334155",
                        border: "1px solid #cbd5e1",
                        padding: "0.15rem 0.4rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem"
                      }}
                      title="Download .wav audio file"
                    >
                      <Download size={11} /> .wav
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={toggleMicRecording}
                    style={{
                      background: isRecordingMic ? "#ef4444" : "#eff6ff",
                      color: isRecordingMic ? "#ffffff" : "#2563eb",
                      border: "1px solid #bfdbfe",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem"
                    }}
                    title="Record extra voice note"
                  >
                    <Mic size={11} /> {isRecordingMic ? "Stop Mic" : "Re-record"}
                  </button>

                  <span style={{ fontSize: "0.6875rem", fontWeight: "800", color: isPlayingAudio ? "#2563eb" : "#16a34a", background: isPlayingAudio ? "#dbeafe" : "#dcfce7", border: isPlayingAudio ? "1px solid #93c5fd" : "1px solid #bbf7d0", padding: "0.15rem 0.5rem", borderRadius: "9999px" }}>
                    {isPlayingAudio ? "Playing Voice..." : `Recorded • ${callDuration}`}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "#ffffff", padding: "0.6rem 0.85rem", borderRadius: "0.625rem", border: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={toggleAudioPlayback}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: isPlayingAudio ? "#dc2626" : "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    boxShadow: isPlayingAudio ? "0 4px 10px rgba(220, 38, 38, 0.3)" : "0 4px 10px rgba(37, 99, 235, 0.3)"
                  }}
                  title="Play recorded voice"
                >
                  {isPlayingAudio ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" style={{ marginLeft: "2px" }} />}
                </button>

                {/* Animated Waveform Visualizer */}
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "3px", height: "26px" }}>
                  {[14, 26, 18, 28, 22, 16, 24, 30, 20, 15, 25, 19, 27, 21, 17, 23].map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: isPlayingAudio ? `${Math.min(26, Math.max(8, (h * (idx + Math.floor(currentTime * 5)) % 24) + 6))}px` : `${h}px`,
                        background: isPlayingAudio ? "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)" : "#cbd5e1",
                        borderRadius: "9999px",
                        transition: "all 0.15s ease"
                      }}
                    />
                  ))}
                </div>

                <span style={{ fontSize: "0.78125rem", fontWeight: 800, color: isPlayingAudio ? "#2563eb" : "#64748b", fontFamily: "monospace" }}>
                  {isPlayingAudio ? formatTimer(currentTime) : (audioDuration ? formatTimer(audioDuration) : callDuration)}
                </span>
              </div>
            </div>

            {/* Property Requirement */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Property Requirement (BHK Type)
              </label>
              <select
                className="select-input"
                value={bhkType}
                onChange={(e) => { e.stopPropagation(); setBhkType(e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: "100%", 
                  padding: "0.6rem 0.85rem", 
                  borderRadius: "0.5rem", 
                  border: "1px solid #cbd5e1", 
                  fontWeight: 700, 
                  color: "#2563eb",
                  background: "#ffffff",
                  fontSize: "0.875rem"
                }}
              >
                <option value="1 BHK">1 BHK Apartment</option>
                <option value="2 BHK">2 BHK Apartment</option>
                <option value="3 BHK">3 BHK Premium Apartment</option>
                <option value="4 BHK">4 BHK Luxury Residence</option>
                <option value="Penthouse / Villa">Penthouse / Villa</option>
                <option value="Plot">Commercial Plot / Land</option>
              </select>
            </div>

            {/* Disposition Buttons */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label className="form-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.45rem" }}>
                Call Disposition / Outcome <span style={{ color: "#2563eb" }}>*</span>
              </label>
              
              <div 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr", 
                  gap: "0.5rem" 
                }}
              >
                {dispositionOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOutcome(opt.label);
                    }}
                    style={{
                      padding: "0.6rem 0.5rem",
                      borderRadius: "0.625rem",
                      border: outcome === opt.label ? "2px solid #2563eb" : "1px solid #e2e8f0",
                      background: outcome === opt.label ? "#2563eb" : "#ffffff",
                      color: outcome === opt.label ? "#ffffff" : "#1e293b",
                      fontWeight: 700,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      boxShadow: outcome === opt.label ? "0 4px 12px rgba(37, 99, 235, 0.25)" : "none",
                      transition: "all 0.15s ease",
                      userSelect: "none"
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Call Notes with Speech Dictation & AI Grammar */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <label className="form-label" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#334155", margin: 0 }}>
                  Call Notes / Discussion
                </label>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    style={{
                      background: isListening ? "#ef4444" : "#eff6ff",
                      color: isListening ? "#ffffff" : "#2563eb",
                      border: "1px solid #bfdbfe",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    <Mic size={12} /> {isListening ? "Listening..." : "Voice Dictation"}
                  </button>
                  <button
                    type="button"
                    onClick={autoCorrectGrammar}
                    style={{
                      background: "#f0fdf4",
                      color: "#15803d",
                      border: "1px solid #bbf7d0",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.375rem",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    <Sparkles size={12} /> AI Grammar
                  </button>
                </div>
              </div>

              <textarea
                className="textarea-input"
                rows={3}
                placeholder="Enter key customer discussion points, budget, next steps..."
                value={notes}
                onChange={(e) => { e.stopPropagation(); setNotes(e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: "100%", 
                  padding: "0.6rem 0.75rem", 
                  borderRadius: "0.5rem", 
                  border: "1px solid #cbd5e1", 
                  fontSize: "0.84375rem",
                  lineHeight: "1.4",
                  resize: "vertical"
                }}
              />
            </div>

            {/* Follow-up Date/Time */}
            <div className="form-group" style={{ marginBottom: "0.5rem" }}>
              <label className="form-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                Next Follow-Up Date & Time
              </label>
              <input
                type="datetime-local"
                className="input-text"
                value={followupDate}
                onChange={(e) => { e.stopPropagation(); setFollowupDate(e.target.value); }}
                onClick={(e) => e.stopPropagation()}
                style={{ 
                  width: "100%", 
                  padding: "0.55rem 0.75rem", 
                  borderRadius: "0.5rem", 
                  border: "1px solid #cbd5e1", 
                  fontSize: "0.84375rem" 
                }}
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="dialer-footer" style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", gap: "0.75rem", flexShrink: 0 }}>
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancelClose}
              style={{
                flex: 1,
                padding: "0.65rem",
                borderRadius: "0.5rem",
                background: "#64748b",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn-save"
              onClick={handleSave}
              style={{
                flex: 1.5,
                padding: "0.65rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 800,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.4rem",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
              }}
            >
              <CheckCircle2 size={16} /> Save Call Log
            </button>
          </div>
        </div>
      )}

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
  );
}
