import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Copy, Check, Bot, User, RefreshCw, MessageSquare, Volume2, Mic, Zap, Key, Settings, ExternalLink } from "lucide-react";
import { askChatGptCopilot } from "../services/apiService";

export default function GptAssistantModal({ isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: `Hello ${currentUser?.name || "Shyam"}! 👋 I am your **ChatGPT AI Sales Copilot** (GPT-4o Real Estate Integration).\n\nAsk me anything: customized pitch scripts, handling objections, property brochures, WhatsApp templates, or market trends!`,
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState("Sales Advisor");
  const [isListening, setIsListening] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("openai_api_key") || "");
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem("openai_model") || "gpt-4o-mini");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: "💬 Draft WhatsApp Follow-up", prompt: "Draft a personalized WhatsApp follow-up message for a lead interested in Kalpataru Vian 2BHK." },
    { label: "💰 Handle Price Objection", prompt: "How do I answer a client who says 'Kalpataru Vian price is too high compared to nearby projects'?" },
    { label: "🏢 Kalpataru Vian Pitch Script", prompt: "Give me a 60-second high-converting phone pitch for Kalpataru Vian, Andheri West." },
    { label: "📝 Cold Calling Script", prompt: "Give me a 3-minute structured telecalling script for fresh Instagram leads." }
  ];

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAlertConfig({ title: "Speech Recognition Unavailable", message: "Voice speech recognition is not supported in this browser. Please type your query!", type: "warning" });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const renderFormattedText = (rawText) => {
    if (!rawText) return "";
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={idx} style={{ display: "block", marginBottom: line.trim() === "" ? "0.4rem" : "0.15rem" }} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }} />
      );
    });
  };

  // Direct Live OpenAI API Call
  const callOpenAiDirect = async (query) => {
    if (!apiKey.trim()) return null;

    const systemPrompt = `You are Dream Homes AI Sales Copilot, an expert Indian Real Estate Telecalling & Sales Advisor assistant for ${currentUser?.name || "Shyam Pandey"} at Dream Homes Real Estate (Mumbai).
You help telecallers pitch luxury properties (like Kalpataru Vian Andheri, Godrej Horizon Wadala, Oberoi Sky City, etc.), handle client objections, calculate ROI, and draft conversion-optimized WhatsApp messages.
Keep answers sharp, professional, persuasive, and structured with bold highlights and bullet points.`;

    const conversationHistory = messages.slice(-4).map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || "OpenAI API Error");
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content;
  };

  const generateFallbackResponse = (userQuestion) => {
    const q = userQuestion.toLowerCase();
    
    // WhatsApp Follow-ups
    if (q.includes("whatsapp") || q.includes("follow") || q.includes("draft") || q.includes("template")) {
      return `📱 **ChatGPT Generated WhatsApp Follow-Up Pitch:**\n\n"Hi **[Client Name]**, Hope you're doing well! 🌟\n\nFollowing up on our discussion regarding **Kalpataru Vian, Andheri West**. We have just unlocked 2 exclusive higher-floor 2 & 3 BHK inventory units with zero floor rise & modular kitchen inclusions!\n\nWould tomorrow at **11:30 AM** or **4:30 PM** work for a private VIP show flat visit?\n\nBest Regards,\n**${currentUser?.name || "Shyam Pandey"}**\n*Dream Homes Real Estate & Investment*\n📞 +91 9372721239"`;
    }

    // Price Objection
    if (q.includes("price") || q.includes("cost") || q.includes("high") || q.includes("expensive") || q.includes("budget") || q.includes("rate")) {
      return `💡 **ChatGPT Sales Masterclass: Handling Price Objections**\n\nWhen a buyer says *"Price is too high"*:\n\n1. **Acknowledge & Validate**: *"I completely agree price is a critical decision factor for your family."*\n2. **RERA Carpet Usability**: *"Local standalone builders quote ₹28,000/sq.ft on super-built up with 38% dead area. Kalpataru gives you 100% usable RERA carpet (820 sq.ft) with zero wastage."*\n3. **Appreciation & Rental Yield**: *"With the new Metro 2A & JVLR connector, properties here are clocking 12.8% annual capital growth."*\n4. **Urgency Close**: *"Let me arrange a private consultation with the developer director on Saturday. 11 AM or 3 PM?"*`;
    }

    // Kalpataru Vian Pitch
    if (q.includes("kalpataru") || q.includes("vian") || q.includes("andheri") || q.includes("pitch")) {
      return `🏢 **Kalpataru Vian (Andheri West) — 60-Second Winning Pitch:**\n\n• **Location**: Prime D.N. Nagar / Link Road, 2 mins from Metro Line 2A.\n• **Configuration**: 2, 3 & 4 BHK Luxury Residences (780 - 1,450 sq.ft carpet).\n• **Price Range**: Starting ₹2.15 Cr to ₹3.80 Cr (Special Pre-Launch Payment Plans: 20:80 Available).\n• **Highlights**: 50+ Lifestyle Club Amenities, Olympic size pool, sky lounge, and possession scheduled for Dec 2026.\n\n🎯 **Closing Hook**: *"Sir, only 4 units remain in the East-facing tower. Shall I book your priority site token for this weekend?"*`;
    }

    // Cold Calling Script
    if (q.includes("cold") || q.includes("script") || q.includes("opening") || q.includes("call")) {
      return `📝 **ChatGPT 3-Step Cold Calling Script (High Conversion):**\n\n1. **Pattern Interrupt (0-10s)**: *"Hi [Name], this is Shyam from Dream Homes Mumbai. I know I am catching you in the middle of your day, do you have 30 seconds?"*\n2. **Value Hook (10-30s)**: *"The reason for my call is we've launched pre-booking for premium RERA-approved 2 & 3 BHKs near Link Road with zero stamp duty."*\n3. **Soft Qualifying Question**: *"Are you looking for an investment or your personal residence in Western Suburbs?"*`;
    }

    // Default Smart Real Estate Copilot Intelligence
    return `🤖 **ChatGPT Real Estate Sales Copilot:**\n\nRegarding **"${userQuestion}"**:\n\nIn current Mumbai real estate markets, successful closures rely on **Alternative Choice Closing** (giving clients two timeslots instead of asking open-ended questions) and **Proof of ROI/Appreciation**.\n\n💡 **Recommended Action**: Send a high-res brochure on WhatsApp immediately after your call, followed by a voice note confirming the site visit date!`;
  };

  const handleSend = async (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    try {
      let replyText = null;

      // 1. Try Direct OpenAI API if API Key is set
      if (apiKey.trim()) {
        try {
          replyText = await callOpenAiDirect(query);
        } catch (apiErr) {
          console.log("[OpenAI API Error]", apiErr);
        }
      }

      // 2. Try Frappe/Backend Copilot API
      if (!replyText) {
        replyText = await askChatGptCopilot(query, selectedPersona, currentUser?.name || "Shyam");
      }

      // 3. Built-in Sales Expert Fallback
      if (!replyText) {
        replyText = generateFallbackResponse(query);
      }
      
      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: generateFallbackResponse(query),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, padding: "0.5rem" }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "390px",
          width: "100%",
          height: "85vh",
          maxHeight: "650px",
          display: "flex",
          flexDirection: "column",
          background: "#0f172a",
          borderRadius: "1.25rem",
          color: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
          padding: 0,
          position: "relative"
        }}
      >
        {/* ChatGPT Top Navigation Bar */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
              }}
            >
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#f8fafc" }}>ChatGPT Sales Copilot</h3>
                <span style={{ fontSize: "0.6rem", background: "#10b981", color: "#ffffff", fontWeight: 800, padding: "0.15rem 0.45rem", borderRadius: "9999px" }}>
                  GPT-4 LIVE
                </span>
              </div>
              <p style={{ fontSize: "0.725rem", color: "#94a3b8" }}>Real Estate Telecalling & Sales AI Assistant</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: apiKey.trim() ? "#065f46" : "#334155",
                border: "1px solid " + (apiKey.trim() ? "#10b981" : "#475569"),
                color: apiKey.trim() ? "#34d399" : "#cbd5e1",
                borderRadius: "0.4rem",
                padding: "0.35rem 0.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.6875rem",
                fontWeight: 700
              }}
              title="OpenAI API Integration Settings"
            >
              <Key size={13} />
              <span>{apiKey.trim() ? "Connected" : "API Key"}</span>
            </button>

            <button
              onClick={() => setMessages([{ id: 1, sender: "ai", text: `Chat cleared. Ask me anything!`, time: "Just now" }])}
              style={{ background: "#334155", border: "none", color: "#cbd5e1", borderRadius: "0.4rem", padding: "0.35rem", cursor: "pointer" }}
              title="Clear Conversation"
            >
              <RefreshCw size={15} />
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* OpenAI API Key Settings Drawer */}
        {showSettings && (
          <div style={{ background: "#1e293b", padding: "0.85rem 1rem", borderBottom: "1px solid #334155" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Key size={14} color="#10b981" /> Direct OpenAI API Integration
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#10b981" }}>Live Official GPT-4o</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="password"
                placeholder="sk-proj-... (Paste OpenAI API Key)"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem("openai_api_key", e.target.value);
                }}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #475569",
                  borderRadius: "0.5rem",
                  padding: "0.45rem 0.65rem",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontFamily: "monospace"
                }}
              />
              
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    localStorage.setItem("openai_model", e.target.value);
                  }}
                  style={{
                    flex: 1,
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "0.5rem",
                    padding: "0.4rem 0.6rem",
                    color: "#ffffff",
                    fontSize: "0.75rem"
                  }}
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Efficient)</option>
                  <option value="gpt-4o">GPT-4o (Most Intelligent & Creative)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>

                <button
                  onClick={() => setShowSettings(false)}
                  style={{
                    background: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.4rem 0.85rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Action Prompt Chips */}
        <div style={{ padding: "0.65rem 1rem", background: "#1e293b", borderBottom: "1px solid #334155", display: "flex", gap: "0.5rem", overflowX: "auto", scrollbarWidth: "none" }}>
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              style={{
                whiteSpace: "nowrap",
                background: "#334155",
                color: "#f8fafc",
                border: "1px solid #475569",
                borderRadius: "9999px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Log Area */}
        <div style={{ flex: 1, padding: "1.25rem 1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem", background: "#090d16" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                width: "100%"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem", maxWidth: "88%" }}>
                {msg.sender === "ai" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={16} color="#ffffff" />
                  </div>
                )}

                <div
                  style={{
                    background: msg.sender === "user" ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "#1e293b",
                    color: "#ffffff",
                    padding: "0.85rem 1rem",
                    borderRadius: msg.sender === "user" ? "1.25rem 1.25rem 0.2rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.2rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    border: msg.sender === "ai" ? "1px solid #334155" : "none"
                  }}
                >
                  {msg.sender === "ai" ? renderFormattedText(msg.text) : msg.text}
                </div>

                {msg.sender === "user" && (
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <User size={16} color="#ffffff" />
                  </div>
                )}
              </div>

              {/* Message Actions (Copy & Read Aloud) */}
              {msg.sender === "ai" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.35rem", marginLeft: "2.25rem" }}>
                  <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{msg.time}</span>
                  
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    style={{ background: "none", border: "none", color: copiedId === msg.id ? "#10b981" : "#94a3b8", cursor: "pointer", fontSize: "0.6875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedId === msg.id ? "Copied" : "Copy"}
                  </button>

                  <button
                    onClick={() => handleSpeak(msg.text)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "0.6875rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                    title="Listen to Audio"
                  >
                    <Volume2 size={13} /> Listen
                  </button>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#10b981", fontSize: "0.8rem", fontWeight: 600 }}>
              <Sparkles size={16} className="animate-spin" /> ChatGPT AI is thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: "0.85rem 1rem", background: "#1e293b", borderTop: "1px solid #334155" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              style={{
                background: isListening ? "#ef4444" : "#334155",
                color: "#ffffff",
                border: "1px solid #475569",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
              title="Click to speak your prompt into microphone"
            >
              <Mic size={16} color={isListening ? "#ffffff" : "#38bdf8"} />
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening... Speak your prompt now..." : "Ask ChatGPT real estate pitch, scripts, or objection handling..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: "#0f172a",
                border: isListening ? "1px solid #ef4444" : "1px solid #475569",
                borderRadius: "0.75rem",
                padding: "0.75rem 1rem",
                color: "#ffffff",
                fontSize: "0.85rem",
                outline: "none"
              }}
            />

            <button
              type="submit"
              disabled={!input.trim()}
              style={{
                background: input.trim() ? "linear-gradient(135deg, #10b981, #059669)" : "#334155",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.75rem",
                padding: "0.75rem 1.1rem",
                cursor: input.trim() ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease"
              }}
            >
              <Send size={16} />
            </button>
          </form>

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
    </div>
  );
}
