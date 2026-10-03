import React, { useState } from "react";
import { 
  X, ExternalLink, Globe, Phone, Award, Users, Building2, 
  ChevronRight, Star, Heart, CheckCircle2, Share2, Play, Eye, ArrowRight,
  Mail, MapPin, MessageCircle, Send, BookOpen, Clock, FileText
} from "lucide-react";
import CustomAlertDialog from "./CustomAlertDialog";
import { validatePhone, validateName, validateEmail } from "../utils/validators";

export default function StoriesHighlightsModal({ isOpen, onClose, onInboundLeadCreated }) {
  const [activeNav, setActiveNav] = useState("Home"); // 'Home', 'About', 'Contact', 'Real Estate Blogs'
  const [alertConfig, setAlertConfig] = useState(null);

  // Contact Form State
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [contactPhoneInput, setContactPhoneInput] = useState("");
  const [contactEmailInput, setContactEmailInput] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Official Links Provided by User
  const websiteUrl = "https://dreamhomes42.com/";
  const contactPhone = "+91 9372721239";
  const contactEmail = "dreamhomes6631@gmail.com";
  const officeAddress = "Dream homes property, shop no.F38, runwal city centre,dattar colony, Kanjurmarg east 400042";

  const facebookUrl = "https://www.facebook.com/share/1GfitGnEdy/";
  const youtubeUrl = "https://youtube.com/@shreyashrepale2792?si=qY3WM8Tp1z8fpACR";
  const instagramUrl = "https://www.instagram.com/dream_homes42?igsh=MWJhajhuNTZ5MHgzeg==";
  const linkedinUrl = "https://www.linkedin.com/feed/";

  // Exact 8 Mumbai Micro-Market Listings from Website Screenshot
  const listingsData = [
    {
      id: 1,
      location: "Ghatkopar",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹99 Lacs To ₹3.79 Crore",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 2,
      location: "Vikhroli",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹59 Lacs To ₹1.89 Crore",
      img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 3,
      location: "Kanjurmarg",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹89 Lacs To ₹2.99 Crore",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 4,
      location: "Bhandup",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹55 Lakhs To ₹1.98 Crore",
      img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 5,
      location: "Mulund",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹75 Lacs To ₹1.68 Crore",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 6,
      location: "Powai",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹1.25 Crore To ₹9.99 Crore",
      img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 7,
      location: "Chembur",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹99 Lacs To ₹2.99 Crore",
      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    },
    {
      id: 8,
      location: "Thane",
      color: "#00b4d8",
      bhk: "Buy 1 BHK, 2 BHK & 3 BHK Apartments",
      price: "Starting from ₹35 Lacs To ₹1.99 Crore",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      link: "https://dreamhomes42.com/"
    }
  ];

  // Exact 3 Milestones / Timeline Items from Website Screenshot
  const milestones = [
    {
      id: 1,
      title: "Serving Hundreds of Happy Clients",
      desc: "Our dedication to customer satisfaction helped us become a trusted name in the real estate market.",
      year: "2023",
      subYear: "Building Trust Through Results",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "Premium Project Expansion",
      desc: "We introduced a wider portfolio of luxury and affordable residential projects in prime locations.",
      year: "2024",
      subYear: "Partnering with Top Developers",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "5 Years of Excellence",
      desc: "Celebrating five successful years of helping clients find their dream homes and investment opportunities.",
      year: "2025",
      subYear: "A Trusted Real Estate Partner",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
    }
  ];

  // Exact Real Estate Blogs from User Screenshot (media_1787728092799.png)
  const blogsData = [
    {
      id: 1,
      title: "Buy 1 & 2 BHK Flats in Thane | Starting at ₹40 Lakhs",
      category: "Thane Focus",
      date: "July 8, 2026",
      desc: "Explore premium 1 & 2 BHK residential homes in Thane with world-class clubhouse, swimming pool, and seamless highway connectivity.",
      img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "RERA Approved Projects in Mumbai: Why They Matter for Home Buyers",
      category: "MahaRERA Guide",
      date: "July 5, 2026",
      desc: "Your complete guide to safe, transparent, and verified real estate investments in Mumbai with RERA carpet guidelines.",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Best 1 & 2 BHK Property in Mumbai for Family & Investment",
      category: "Market Insights",
      date: "July 3, 2026",
      desc: "Top handpicked 1 & 2 BHK properties in prime Mumbai locations with verified developer credibility and timely possession.",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
    }
  ];

  if (!isOpen) return null;

  const handleOpenLink = (url) => {
    window.open(url || websiteUrl, "_blank");
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent("Hello Dream Homes, I am looking to buy/rent a property in Mumbai. Please share details.");
    window.open(`https://api.whatsapp.com/send?phone=919372721239&text=${text}`, "_blank");
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();

    const fullName = `${contactFirstName} ${contactLastName}`.trim();
    const nameRes = validateName(fullName || "Website Visitor");
    if (!nameRes.isValid) {
      setAlertConfig({ title: "Validation Error", message: nameRes.error, type: "warning" });
      return;
    }

    const phoneRes = validatePhone(contactPhoneInput);
    if (!phoneRes.isValid) {
      setAlertConfig({ title: "Validation Error", message: phoneRes.error, type: "warning" });
      return;
    }

    if (contactEmailInput) {
      const emailRes = validateEmail(contactEmailInput);
      if (!emailRes.isValid) {
        setAlertConfig({ title: "Validation Error", message: emailRes.error, type: "warning" });
        return;
      }
    }

    const newInboundLead = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      name: fullName || "Website Visitor",
      phone: contactPhoneInput.trim(),
      email: contactEmailInput.trim() || `${fullName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      priority: "HOT",
      status: "NEW",
      source: "dreamhomes42.com Contact Form",
      service: "Website Inquiry",
      bhkType: "2 & 3 BHK",
      location: "Mumbai",
      notes: contactMessage || "Inquiry submitted via dreamhomes42.com Contact Us form.",
      createdAt: new Date().toISOString(),
      callCount: 0,
      history: []
    };

    if (onInboundLeadCreated) {
      onInboundLeadCreated(newInboundLead);
    }

    setFormSubmitted(true);
    setAlertConfig({
      title: "Inquiry Submitted!",
      message: `Thank you ${fullName}! Your inquiry has been sent to our sales consultants. We will contact you at ${contactPhoneInput} shortly.`,
      type: "success"
    });

    setContactFirstName("");
    setContactLastName("");
    setContactPhoneInput("");
    setContactEmailInput("");
    setContactMessage("");
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.75rem",
        overflowY: "auto"
      }}
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: "390px",
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "1.25rem",
          background: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          padding: 0,
          border: "1px solid #cbd5e1",
          position: "relative",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* TOP HEADER: White background with Golden DH Logo, Call, Email & Exact Social Icons */}
        <div style={{
          background: "#ffffff",
          padding: "0.65rem 0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0
        }}>
          {/* Golden DH Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }} onClick={() => setActiveNav("Home")}>
            <img 
              src="/dreamhomes_gold_logo.jpg" 
              alt="Dream Homes Logo" 
              onError={(e) => {
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = "1";
                  e.target.src = "/assets/real_state_crm/frontend/dreamhomes_gold_logo.jpg";
                } else if (e.target.dataset.fallback === "1") {
                  e.target.dataset.fallback = "2";
                  e.target.src = "/dreamhomes_logo.png";
                }
              }}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "6px",
                objectFit: "contain",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                flexShrink: 0,
                background: "#ffffff"
              }} 
            />
            <div>
              <div style={{ fontSize: "0.78125rem", fontWeight: "900", color: "#0f172a", lineHeight: 1.1 }}>DREAM HOMES</div>
              <div style={{ fontSize: "0.59375rem", color: "#64748b" }}>Real Estate Advisory</div>
            </div>
          </div>

          {/* Social Icons (Facebook, Youtube, Instagram, Linkedin) + Close */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            
            {/* Facebook */}
            <div 
              onClick={() => handleOpenLink(facebookUrl)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                background: "#1877F2",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(24,119,242,0.3)"
              }}
              title="Facebook"
            >
              f
            </div>

            {/* Youtube */}
            <div 
              onClick={() => handleOpenLink(youtubeUrl)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                background: "#FF0000",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.625rem",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(255,0,0,0.3)"
              }}
              title="YouTube"
            >
              ▶
            </div>

            {/* Instagram */}
            <div 
              onClick={() => handleOpenLink(instagramUrl)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(220,39,67,0.3)"
              }}
              title="Instagram"
            >
              📸
            </div>

            {/* Linkedin */}
            <div 
              onClick={() => handleOpenLink(linkedinUrl)}
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "3px",
                background: "#0A66C2",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6875rem",
                fontWeight: "900",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(10,102,194,0.3)"
              }}
              title="LinkedIn"
            >
              in
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose} 
              style={{
                background: "#f1f5f9",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "0.2rem"
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Contact Info Header Ribbon (Call Us & Email) */}
        <div style={{
          background: "#f8fafc",
          padding: "0.4rem 0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0",
          fontSize: "0.65625rem"
        }}>
          <a 
            href={`tel:${contactPhone}`} 
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#2563eb", textDecoration: "none", fontWeight: "700" }}
          >
            <Phone size={11} color="#ef4444" /> Call Us: <span style={{ color: "#0f172a" }}>{contactPhone}</span>
          </a>

          <a 
            href={`mailto:${contactEmail}`} 
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#dc2626", textDecoration: "none", fontWeight: "700" }}
          >
            <Mail size={11} color="#ef4444" /> <span style={{ color: "#0f172a" }}>{contactEmail}</span>
          </a>
        </div>

        {/* NAVIGATION BAR: Exact 4 Tabs from Website Screenshots */}
        <div style={{
          background: "#18181b",
          color: "#ffffff",
          padding: "0.5rem 0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.71875rem",
          fontWeight: "700",
          flexShrink: 0
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", overflowX: "auto", scrollbarWidth: "none" }}>
            {[
              { id: "Home", label: "Home" },
              { id: "About", label: "About" },
              { id: "Contact", label: "Contact" },
              { id: "Real Estate Blogs", label: "Blogs" }
            ].map((tab) => (
              <span
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                style={{
                  color: activeNav === tab.id ? "#ef4444" : "#d4d4d8",
                  cursor: "pointer",
                  borderBottom: activeNav === tab.id ? "2px solid #ef4444" : "none",
                  paddingBottom: "2px",
                  whiteSpace: "nowrap"
                }}
              >
                {tab.label}
              </span>
            ))}
          </div>

          <button
            onClick={() => setActiveNav("Contact")}
            style={{
              background: "transparent",
              color: "#ffffff",
              border: "1px solid #dc2626",
              borderRadius: "4px",
              padding: "0.25rem 0.5rem",
              fontSize: "0.625rem",
              fontWeight: "800",
              cursor: "pointer",
              letterSpacing: "0.03em",
              whiteSpace: "nowrap"
            }}
          >
            ENQUIRY NOW
          </button>
        </div>

        {/* Scrollable Content Body with Dynamic Tab Switching */}
        <div style={{ overflowY: "auto", flex: "1 1 auto", display: "flex", flexDirection: "column" }}>
          
          {/* ========================================================================= */}
          {/* TAB 1: HOME (Exact Screenshots: Hero + Premium Builder + Listings)        */}
          {/* ========================================================================= */}
          {activeNav === "Home" && (
            <div>
              {/* Hero Banner */}
              <div style={{
                position: "relative",
                minHeight: "300px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.85) 100%), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "1.5rem 1.1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#ffffff"
              }}>
                <h1 style={{
                  fontSize: "1.65rem",
                  fontWeight: "900",
                  color: "#ffffff",
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em"
                }}>
                  Find Your Perfect Home <br />
                  <span style={{
                    color: "#eab308",
                    textShadow: "0 2px 10px rgba(234, 179, 8, 0.4)"
                  }}>
                    Near You <br />
                    in Mumbai
                  </span>
                </h1>

                <p style={{
                  fontSize: "0.71875rem",
                  color: "#e2e8f0",
                  lineHeight: 1.45,
                  margin: "0.75rem 0 1.25rem 0",
                  maxWidth: "92%"
                }}>
                  "Our mission is to help individuals, families, and investors find the perfect property while providing reliable listings, expert guidance, and a seamless real estate experience for buyers, sellers, and tenants."
                </p>

                <div>
                  <button
                    onClick={() => setActiveNav("Contact")}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "0.4rem",
                      padding: "0.55rem 1.25rem",
                      fontSize: "0.8125rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.5)"
                    }}
                  >
                    Contact Me
                  </button>
                </div>

                {/* Floating WhatsApp Button */}
                <div
                  onClick={handleOpenWhatsApp}
                  style={{
                    position: "absolute",
                    bottom: "14px",
                    right: "14px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#25D366",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 6px 16px rgba(37, 211, 102, 0.5)",
                    zIndex: 10
                  }}
                  title="Chat on WhatsApp"
                >
                  <MessageCircle size={20} color="#ffffff" fill="#ffffff" />
                </div>
              </div>

              <div style={{ padding: "1.1rem 1rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                
                {/* Premium Builder in Mumbai */}
                <div style={{
                  background: "#fafafa",
                  borderRadius: "1rem",
                  padding: "1rem",
                  border: "1px solid #f1f5f9",
                  textAlign: "center"
                }}>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#0f172a", margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
                    Premium Builder in<br />Mumbai
                  </h2>

                  <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: "1.5", margin: "0 0 1rem 0" }}>
                    Dream Homes is a trusted real estate company dedicated to helping clients buy, sell, and rent properties across Mumbai. We offer verified property listings, expert market guidance, and personalized support to ensure a smooth and hassle-free real estate experience. Whether you're looking for a cozy 1BHK, a spacious family home, or a smart investment opportunity, Dream Homes is here to help you find the perfect property.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1rem" }}>
                    <div style={{ background: "#38bdf8", color: "#ffffff", borderRadius: "0.875rem", padding: "0.85rem 0.5rem", textAlign: "center", boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "900", lineHeight: 1.1 }}>500+</div>
                      <div style={{ fontSize: "0.71875rem", fontWeight: "700", marginTop: "0.2rem" }}>Properties Listed</div>
                    </div>

                    <div style={{ background: "#60a5fa", color: "#ffffff", borderRadius: "0.875rem", padding: "0.85rem 0.5rem", textAlign: "center", boxShadow: "0 4px 12px rgba(96, 165, 250, 0.3)" }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "900", lineHeight: 1.1 }}>200+</div>
                      <div style={{ fontSize: "0.71875rem", fontWeight: "700", marginTop: "0.2rem" }}>Happy Customer</div>
                    </div>
                  </div>

                  {/* 3 Milestones */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
                    {milestones.map((m) => (
                      <div key={m.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.65rem", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                        <img src={m.img} alt={m.title} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "0.5rem", marginBottom: "0.45rem" }} />
                        <div style={{ fontSize: "0.84375rem", fontWeight: "800", color: "#0f172a" }}>{m.title}</div>
                        <div style={{ fontSize: "0.6875rem", color: "#64748b", margin: "0.2rem 0 0.35rem 0", lineHeight: 1.4 }}>{m.desc}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.35rem", paddingTop: "0.35rem", borderTop: "1px dashed #e2e8f0" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#84cc16", display: "inline-block" }} />
                          <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#0f172a" }}>{m.year}</span>
                          <span style={{ fontSize: "0.65625rem", color: "#64748b" }}>• {m.subYear}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listings 8 Cards */}
                <div>
                  <div style={{ textAlign: "center", marginBottom: "0.85rem" }}>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#0f172a", margin: "0 0 0.35rem 0" }}>
                      Listings
                    </h2>
                    <p style={{ fontSize: "0.71875rem", color: "#64748b", margin: 0, lineHeight: 1.45 }}>
                      Discover your ideal home from our latest property listings, featuring premium apartments and residences across Mumbai to match every budget.
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                    {listingsData.map((item) => (
                      <div key={item.id} style={{ background: "#ffffff", borderRadius: "0.875rem", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <img src={item.img} alt={item.location} style={{ width: "100%", height: "95px", objectFit: "cover" }} />
                          <div style={{ padding: "0.55rem" }}>
                            <h4 style={{ fontSize: "0.9375rem", fontWeight: "900", color: item.color, margin: 0 }}>{item.location}</h4>
                            <div style={{ fontSize: "0.6875rem", fontWeight: "800", color: "#0f172a", margin: "0.25rem 0 0.15rem 0", lineHeight: 1.3 }}>{item.bhk}</div>
                            <div style={{ fontSize: "0.65625rem", color: "#64748b", lineHeight: 1.3 }}>{item.price}</div>
                          </div>
                        </div>
                        <div style={{ padding: "0 0.55rem 0.55rem 0.55rem" }}>
                          <button
                            onClick={() => handleOpenLink(item.link)}
                            style={{
                              width: "100%",
                              background: "#535bf2",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "0.35rem",
                              padding: "0.35rem 0.5rem",
                              fontSize: "0.6875rem",
                              fontWeight: "800",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.2rem",
                              boxShadow: "0 2px 6px rgba(83, 91, 242, 0.3)"
                            }}
                          >
                            Click here <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ABOUT (Exact Screenshots 3 & 5: About Us + Create Your Journey)     */}
          {/* ========================================================================= */}
          {activeNav === "About" && (
            <div>
              {/* About Us Hero Banner (Screenshot 5) */}
              <div style={{
                position: "relative",
                height: "190px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%), url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: 0, letterSpacing: "-0.02em" }}>
                  About Us
                </h1>
              </div>

              {/* Create Your Journey Section (Screenshot 3) */}
              <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Create Your Journey
                  </h2>
                  <div style={{ width: "40px", height: "3px", background: "#ef4444", marginTop: "0.35rem", borderRadius: "2px" }} />
                </div>

                <div style={{
                  background: "#ffffff",
                  borderRadius: "0.875rem",
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  border: "1px solid #e2e8f0"
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80" 
                    alt="Mumbai Skyline" 
                    style={{ width: "100%", height: "160px", objectFit: "cover" }} 
                  />
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "#334155", lineHeight: "1.55", margin: 0 }}>
                      At Dream Homes, we believe every property marks the beginning of a new journey. As a trusted real estate partner in Mumbai, we help buyers, sellers, and investors find opportunities that match their goals and lifestyle. With expert guidance, transparent service, and a commitment to customer satisfaction, we make every step of your real estate journey smooth, secure, and successful.
                    </p>

                    <p style={{ fontSize: "0.71875rem", color: "#64748b", lineHeight: "1.5", margin: 0 }}>
                      Procuring education on consulted assurance in do. Is sympathize he expression mr no travelling. Preference he he at travelling in resolution. So striking at of to welcomed resolved. Northward by described up household therefore attention. Excellence decisively nay man yet impression for contrasted remarkably.
                    </p>
                  </div>
                </div>

                {/* Company Values Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "0.75rem", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: "800", color: "#1e40af" }}>🎯 Our Mission</div>
                    <div style={{ fontSize: "0.6875rem", color: "#3b82f6", marginTop: "0.2rem", lineHeight: 1.4 }}>
                      To make Mumbai home buying transparent, seamless, and rewarding for every client.
                    </div>
                  </div>

                  <div style={{ background: "#fefce8", border: "1px solid #fef08a", borderRadius: "0.75rem", padding: "0.75rem" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: "800", color: "#854d0e" }}>⭐ 5 Years Trust</div>
                    <div style={{ fontSize: "0.6875rem", color: "#ca8a04", marginTop: "0.2rem", lineHeight: 1.4 }}>
                      Trusted by 200+ families with verified titles & MahaRERA compliance.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: CONTACT (Exact Screenshots 1, 2 & 4: Contact Now + Form)          */}
          {/* ========================================================================= */}
          {activeNav === "Contact" && (
            <div>
              {/* Contact Now Hero Banner (Screenshot 4) */}
              <div style={{
                position: "relative",
                height: "190px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.75) 100%), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff"
              }}>
                <h1 style={{ fontSize: "2rem", fontWeight: "900", margin: 0, letterSpacing: "-0.02em" }}>
                  Contact Now
                </h1>
              </div>

              {/* Contact Us Section & Form (Screenshots 1 & 2) */}
              <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                    Contact Us
                  </h2>
                  <div style={{ width: "40px", height: "3px", background: "#ef4444", marginTop: "0.35rem", borderRadius: "2px" }} />
                </div>

                <p style={{ fontSize: "0.75rem", color: "#64748b", lineHeight: "1.5", margin: 0 }}>
                  Have questions about a property? Looking for your dream home in Mumbai? Contact our team today and we'll help you find the right solution with expert guidance and trusted service.
                </p>

                {/* Office Location Box */}
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.75rem" }}>
                  <div style={{ fontSize: "0.78125rem", fontWeight: "800", color: "#ef4444" }}>
                    Office Location
                  </div>
                  <div style={{ fontSize: "0.71875rem", color: "#334155", marginTop: "0.25rem", lineHeight: 1.4 }}>
                    {officeAddress}
                  </div>
                </div>

                {/* Exact Interactive Form from Screenshot */}
                <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  
                  {/* Name * (First & Last) */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem", display: "block" }}>
                      Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                      <div>
                        <input
                          type="text"
                          className="modern-search-input"
                          placeholder="First"
                          value={contactFirstName}
                          onChange={e => setContactFirstName(e.target.value)}
                          required
                          style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                        <span style={{ fontSize: "0.625rem", color: "#94a3b8" }}>First</span>
                      </div>
                      <div>
                        <input
                          type="text"
                          className="modern-search-input"
                          placeholder="Last"
                          value={contactLastName}
                          onChange={e => setContactLastName(e.target.value)}
                          style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                        />
                        <span style={{ fontSize: "0.625rem", color: "#94a3b8" }}>Last</span>
                      </div>
                    </div>
                  </div>

                  {/* Numbers * */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem", display: "block" }}>
                      Numbers <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="tel"
                      className="modern-search-input"
                      placeholder="+91 98XXX XXXXX"
                      value={contactPhoneInput}
                      onChange={e => setContactPhoneInput(e.target.value)}
                      required
                      style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem", display: "block" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      className="modern-search-input"
                      placeholder="your.email@gmail.com"
                      value={contactEmailInput}
                      onChange={e => setContactEmailInput(e.target.value)}
                      style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  {/* Comment or Message */}
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "0.25rem", display: "block" }}>
                      Comment or Message
                    </label>
                    <textarea
                      className="modern-search-input"
                      rows={3}
                      placeholder="Enter your requirement, budget, or preferred Mumbai location..."
                      value={contactMessage}
                      onChange={e => setContactMessage(e.target.value)}
                      style={{ width: "100%", fontSize: "0.8125rem", padding: "0.5rem", borderRadius: "4px", border: "1px solid #cbd5e1", resize: "vertical" }}
                    />
                  </div>

                  {/* Submit Button (Purple Button from Screenshot) */}
                  <button
                    type="submit"
                    style={{
                      background: "#535bf2",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "0.6rem 1.25rem",
                      fontSize: "0.8125rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      boxShadow: "0 4px 12px rgba(83, 91, 242, 0.35)",
                      marginTop: "0.25rem"
                    }}
                  >
                    <Send size={14} /> Submit
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: REAL ESTATE BLOGS (Exact Screenshot media_1787728092799.png)       */}
          {/* ========================================================================= */}
          {activeNav === "Real Estate Blogs" && (
            <div>
              {/* Exact Green Grass Nature Backdrop with Bold Blue "Blogs" Title */}
              <div style={{
                position: "relative",
                height: "190px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                textAlign: "center"
              }}>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#2563eb", margin: 0, letterSpacing: "-0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                  Blogs
                </h1>
              </div>

              {/* Content with Yellow "All Posts" Tag */}
              <div style={{ padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <span style={{
                    background: "#facc15",
                    color: "#0f172a",
                    fontWeight: "800",
                    fontSize: "0.75rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(250, 204, 21, 0.4)"
                  }}>
                    All Posts
                  </span>
                </div>

                {/* Exact 3 Real Blog Cards from Screenshot */}
                {blogsData.map((blog) => (
                  <div key={blog.id} style={{
                    background: "#ffffff",
                    borderRadius: "0.875rem",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column"
                  }}>
                    <img src={blog.img} alt={blog.title} style={{ width: "100%", height: "140px", objectFit: "cover" }} />
                    <div style={{ padding: "0.85rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                        <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.625rem", fontWeight: "800", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                          {blog.category}
                        </span>
                        <span style={{ fontSize: "0.625rem", color: "#94a3b8" }}>
                          {blog.date}
                        </span>
                      </div>

                      <h3 style={{ fontSize: "0.9375rem", fontWeight: "900", color: "#0f172a", margin: "0 0 0.35rem 0", lineHeight: 1.35 }}>
                        {blog.title}
                      </h3>

                      <p style={{ fontSize: "0.6875rem", color: "#64748b", lineHeight: 1.45, margin: "0 0 0.65rem 0" }}>
                        {blog.desc}
                      </p>

                      <button
                        onClick={() => handleOpenLink("https://dreamhomes42.com/real-estate-blogs/")}
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "0.35rem 0.65rem",
                          fontSize: "0.6875rem",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        Read Article <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SHARED OFFICIAL FOOTER (Exact Screenshot on Every Page)                   */}
          {/* ========================================================================= */}
          <div style={{
            background: "#0b0f19",
            color: "#ffffff",
            borderRadius: "0",
            padding: "1.1rem 0.9rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            marginTop: "auto"
          }}>
            {/* Column 1: Dream Homes */}
            <div>
              <h5 style={{ fontSize: "0.78125rem", fontWeight: "800", color: "#ffffff", margin: "0 0 0.35rem 0", letterSpacing: "0.05em" }}>
                DREAM HOMES
              </h5>
              <div style={{ fontSize: "0.6875rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div>• Buy, Sell & Rent Properties</div>
                <div>• Verified Property Listings</div>
                <div>• Prime Locations Across Mumbai</div>
                <div>• Expert Real Estate Guidance</div>
                <div>• Transparent & Trusted Service</div>
              </div>
            </div>

            {/* Column 2: Social Media & Support */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", borderTop: "1px solid #1e293b", paddingTop: "0.6rem" }}>
              <div>
                <h5 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ffffff", margin: "0 0 0.25rem 0" }}>
                  Social Media
                </h5>
                <div style={{ fontSize: "0.6875rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleOpenLink(instagramUrl)}>Instagram</span>
                  <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleOpenLink(facebookUrl)}>Facebook</span>
                  <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleOpenLink(youtubeUrl)}>Youtube</span>
                  <span style={{ cursor: "pointer", color: "#38bdf8" }} onClick={() => handleOpenLink(linkedinUrl)}>Linkedin</span>
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ffffff", margin: "0 0 0.25rem 0" }}>
                  Support
                </h5>
                <div style={{ fontSize: "0.6875rem", color: "#94a3b8", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                  <span style={{ cursor: "pointer" }} onClick={() => setActiveNav("Contact")}>FAQ</span>
                  <span style={{ cursor: "pointer" }} onClick={() => setActiveNav("Contact")}>Contact</span>
                </div>
              </div>
            </div>

            {/* Column 3: Contacts */}
            <div style={{ borderTop: "1px solid #1e293b", paddingTop: "0.6rem" }}>
              <h5 style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ffffff", margin: "0 0 0.25rem 0" }}>
                Contacts
              </h5>
              <div style={{ fontSize: "0.6875rem", color: "#38bdf8", fontWeight: "700" }}>
                <a href={`tel:${contactPhone}`} style={{ color: "#38bdf8", textDecoration: "none" }}>{contactPhone}</a>
              </div>
              <div style={{ fontSize: "0.65625rem", color: "#94a3b8", marginTop: "0.25rem", lineHeight: 1.35 }}>
                {officeAddress}
              </div>
            </div>

            {/* Copyright */}
            <div style={{ borderTop: "1px solid #1e293b", paddingTop: "0.5rem", textAlign: "center", fontSize: "0.625rem", color: "#64748b" }}>
              © 2023 Created with Royal Elementor Addons
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
