import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import MobileHeader from "./components/MobileHeader";
import MobileBottomNav from "./components/MobileBottomNav";
import PerformanceView from "./components/PerformanceView";
import TodaysActionsView from "./components/TodaysActionsView";
import FreshLeadsView from "./components/FreshLeadsView";
import FollowUpsView from "./components/FollowUpsView";
import PropertiesView from "./components/PropertiesView";
import ActivitiesView from "./components/ActivitiesView";
import SidebarDrawer from "./components/SidebarDrawer";
import ColdCallingModal from "./components/ColdCallingModal";
import WorkAttendanceModal from "./components/WorkAttendanceModal";
import BusinessCardModal from "./components/BusinessCardModal";
import TCFModal from "./components/TCFModal";
import MCFModal from "./components/MCFModal";
import ClaimLeadsModal from "./components/ClaimLeadsModal";
import DialerModal from "./components/DialerModal";
import InboundCallModal from "./components/InboundCallModal";
import WhatsAppReportModal from "./components/WhatsAppReportModal";
import NotificationsModal from "./components/NotificationsModal";
import UserProfileModal from "./components/UserProfileModal";
import GptAssistantModal from "./components/GptAssistantModal";
import MeetingLocationModal from "./components/MeetingLocationModal";
import StoriesHighlightsModal from "./components/StoriesHighlightsModal";
import RealEstateCalculatorModal from "./components/RealEstateCalculatorModal";
import InstallAppModal from "./components/InstallAppModal";
import LoginScreen from "./components/LoginScreen";
import AdminPortal from "./components/AdminPortal";
import IntegrationsModal from "./components/IntegrationsModal";
import { Signal, Wifi, Battery } from "lucide-react";

import {
  getStoredLeads,
  saveStoredLeads,
  getStoredMetrics,
  saveStoredMetrics,
  syncWithFrappeBackend,
  fetchCrmLeads,
  fetchCrmMetrics,
  fetchCrmNotifications,
  saveNotificationApi,
  markNotificationReadApi,
  clearAllNotificationsApi,
  fetchOrgProfile,
  claimLeadsApi,
  fetchUserProfileApi
} from "./services/apiService";
import { SOCIAL_LEAD_TEMPLATES, INITIAL_LEADS } from "./services/mockData";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("crm_is_authenticated") === "true";
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem("crm_user_profile");
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          parsed.phone = parsed.mobile_no || parsed.phone || "9867778229";
          if (!parsed.email) parsed.email = "shyampandey1104@gmail.com";
          return parsed;
        }
      } catch (e) {}
    }
    return {
      name: "Shyam Pandey",
      email: "shyampandey1104@gmail.com",
      phone: "9867778229",
      mobile_no: "9867778229",
      role: "Senior Sales Consultant",
      initials: "SP",
      areas: ["Andheri", "Bandra", "Goregaon"]
    };
  });

  const [orgProfile, setOrgProfile] = useState(null);

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("crm_view_mode") || "telecaller";
  });

  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem("crm_active_tab") || "dashboard";
  });

  const handleSetTab = (tab) => {
    setCurrentTab(tab);
    localStorage.setItem("crm_active_tab", tab);
  };

  const [leads, setLeads] = useState(() => getStoredLeads());
  const [searchQuery, setSearchQuery] = useState("");
  const [metrics, setMetrics] = useState(() => getStoredMetrics());
  const [isMobileView, setIsMobileView] = useState(false);
  const [isRealMobile, setIsRealMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  useEffect(() => {
    const handleResize = () => {
      setIsRealMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Modals & Drawers state
  const [showSidebar, setShowSidebar] = useState(false);
  const [showColdDialer, setShowColdDialer] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showBusinessCardModal, setShowBusinessCardModal] = useState(false);
  const [showTCFModal, setShowTCFModal] = useState(false);
  const [showMCFModal, setShowMCFModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showGptModal, setShowGptModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showStoriesModal, setShowStoriesModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const [activeCallLead, setActiveCallLead] = useState(null);
  const [incomingCallLead, setIncomingCallLead] = useState(null);
  const [incomingCallNotifId, setIncomingCallNotifId] = useState(null);
  const handledInboundCallsRef = useRef(new Set());
  const [reportLead, setReportLead] = useState(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Initialize notifications from localStorage or real scheduled leads
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_live_notifications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Initial real scheduled disposition alerts based on actual follow-up leads
    const initialFollowups = INITIAL_LEADS.filter(l => l.status === "FOLLOWUP_TODAY" || l.callbackTime);
    return initialFollowups.map((l, idx) => ({
      id: `notif-init-${l.id}-${idx}`,
      title: `⏰ Follow-up Due: ${l.name}`,
      message: `Follow-up scheduled via call disposition (${l.notes || "Callback Requested"}). Client interested in ${l.bhkType} (${l.location}).`,
      source: "Scheduled Follow-up",
      type: "followup",
      timeAgo: l.callbackTime || "Today",
      read: false,
      lead: l
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem("crm_live_notifications", JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    const userEmail = userProfile?.email || "shyampandey1104@gmail.com";

    const syncLiveData = () => {
      // Don't poll and trigger re-renders if user is currently on a call or filling disposition form
      if (activeCallLead) return;
      fetchCrmLeads(userEmail).then((data) => {
        if (data && data.length > 0) setLeads(data);
      });

      fetchCrmNotifications().then((notifs) => {
        if (notifs && notifs.length > 0) {
          setNotifications(notifs);
          // Check for fresh unhandled inbound call to ring the screen
          const latestInbound = notifs.find(n => 
            (n.type === "inbound" || n.type === "inbound_call" || n.source?.toLowerCase().includes("inbound") || n.title?.toLowerCase().includes("inbound")) && 
            !n.read && 
            n.lead && 
            !handledInboundCallsRef.current.has(String(n.id)) &&
            !handledInboundCallsRef.current.has(String(n.lead?.id)) &&
            !handledInboundCallsRef.current.has(String(n.lead?.phone))
          );
          if (latestInbound && !activeCallLead && !incomingCallLead) {
            setIncomingCallNotifId(latestInbound.id);
            setIncomingCallLead(latestInbound.lead);
          }
        }
      });
    };

    syncLiveData();
    const pollInterval = setInterval(syncLiveData, 5000);

    fetchUserProfileApi(userEmail).then((freshProfile) => {
      if (freshProfile && (freshProfile.phone || freshProfile.mobile_no)) {
        const cleanPhone = String(freshProfile.mobile_no || freshProfile.phone || "9867778229").trim();
        setUserProfile((prev) => {
          const updated = {
            ...prev,
            ...freshProfile,
            phone: cleanPhone,
            mobile_no: cleanPhone
          };
          localStorage.setItem("crm_user_profile", JSON.stringify(updated));
          return updated;
        });
      }
    });

    fetchCrmMetrics().then((data) => {
      if (data) setMetrics(data);
      else setMetrics(getStoredMetrics());
    });

    fetchOrgProfile().then((data) => {
      if (data) setOrgProfile(data);
    });

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => clearInterval(pollInterval);
  }, [userProfile?.email, activeCallLead]);

  const handleLoginSuccess = (profile) => {
    const rawPhone = profile?.mobile_no || profile?.phone || "9867778229";
    const defaultProfile = {
      name: profile?.name || "Shyam Pandey",
      email: profile?.email || "shyampandey1104@gmail.com",
      phone: rawPhone,
      mobile_no: rawPhone,
      role: profile?.role || "Senior Sales Consultant",
      initials: profile?.initials || "SP",
      areas: profile?.areas || ["Andheri", "Bandra", "Goregaon"]
    };
    setUserProfile(defaultProfile);
    setIsAuthenticated(true);
    const mode = (defaultProfile.role && (defaultProfile.role.includes("Manager") || defaultProfile.role.includes("Admin"))) ? "admin" : "telecaller";
    setViewMode(mode);

    localStorage.setItem("crm_is_authenticated", "true");
    localStorage.setItem("crm_user_profile", JSON.stringify(defaultProfile));
    localStorage.setItem("crm_view_mode", mode);
    showToast(`Logged in as ${defaultProfile.name} (${defaultProfile.role})`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setViewMode("telecaller");
    setShowProfileModal(false);

    localStorage.removeItem("crm_is_authenticated");
    localStorage.removeItem("crm_user_profile");
    localStorage.removeItem("crm_view_mode");
    localStorage.removeItem("crm_active_tab");
  };

  const unreadCount = (Array.isArray(notifications) ? notifications : []).filter(n => !n.read).length;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Detect Return from Native iPhone/Android SIM Phone Calls
  useEffect(() => {
    const handleNativeCallReturn = () => {
      if (document.visibilityState === "visible") {
        const savedNativeLeadJson = sessionStorage.getItem("crm_pending_native_call_lead");
        if (savedNativeLeadJson) {
          try {
            const savedLead = JSON.parse(savedNativeLeadJson);
            sessionStorage.removeItem("crm_pending_native_call_lead");
            setActiveCallLead((prev) => {
              if (prev && prev.id === savedLead.id) return prev;
              return savedLead;
            });
          } catch (e) {}
        }
      }
    };

    document.addEventListener("visibilitychange", handleNativeCallReturn);

    return () => {
      document.removeEventListener("visibilitychange", handleNativeCallReturn);
    };
  }, []);

  const handleCallLead = (lead) => {
    if (!lead) return;
    const phoneNum = lead.phone ? lead.phone.replace(/[^0-9+]/g, "") : "+919820591823";
    
    // Only trigger tel: scheme on real touch/mobile devices so desktop browser does not lose window focus or open FaceTime
    const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice) {
      sessionStorage.setItem("crm_pending_native_call_lead", JSON.stringify(lead));
      window.location.href = `tel:${phoneNum}`;
    }
    
    setActiveCallLead(lead);
  };

  const handleSaveCall = async ({ leadId, duration, outcome, bhkType, notes, followupDate, recordedAudioUrl }) => {
    let targetLeadName = "Lead";
    const updatedLeads = leads.map(l => {
      if (l.id === leadId) {
        targetLeadName = l.name || l.lead_name || "Lead";
        const newCallCount = (l.callCount || 0) + 1;
        let newStatus = "FOLLOWUP";
        const outLower = (outcome || "").toLowerCase();

        if (outLower.includes("closed") || outLower.includes("deal") || outLower.includes("won")) {
          newStatus = "CLOSED";
        } else if (outLower.includes("not interested") || outLower.includes("wrong number") || outLower.includes("lost")) {
          newStatus = "NOT_INTERESTED";
        } else if (followupDate) {
          newStatus = "FOLLOWUP_TODAY";
        } else {
          newStatus = "FOLLOWUP";
        }

        const newHistory = [
          {
            date: "Just now",
            outcome: outcome,
            duration: duration,
            recordedAudioUrl: recordedAudioUrl,
            note: notes || `Outcome: ${outcome}`
          },
          ...(Array.isArray(l.history) ? l.history : [])
        ];

        return {
          ...l,
          callCount: newCallCount,
          status: newStatus,
          bhkType: bhkType || l.bhkType,
          notes: notes || l.notes,
          callbackTime: followupDate || l.callbackTime,
          recordedAudioUrl: recordedAudioUrl,
          history: newHistory
        };
      }
      return l;
    });

    setLeads(updatedLeads);
    saveStoredLeads(updatedLeads);

    const isWon = outcome === "Deal Closed (Won)";
    const newMetrics = {
      ...metrics,
      mtdCallsMade: (metrics.mtdCallsMade || 186) + 1,
      followupsDone: followupDate ? (metrics.followupsDone || 46) + 1 : (metrics.followupsDone || 46),
      visitsBooked: outcome.includes("Visit") ? (metrics.visitsBooked || 12) + 1 : (metrics.visitsBooked || 12),
      hotLeadsPassed: (outcome.includes("Interested") || outcome.includes("Hot")) ? (metrics.hotLeadsPassed || 18) + 1 : (metrics.hotLeadsPassed || 18),
      conversionsCount: isWon ? (metrics.conversionsCount || 8) + 1 : (metrics.conversionsCount || 8),
      conversionsAmount: isWon ? `₹${((metrics.conversionsCount || 8) + 1) * 30 + 35}K` : (metrics.conversionsAmount || "₹245K")
    };
    setMetrics(newMetrics);
    saveStoredMetrics(newMetrics);

    // Create real logic-based notification alert for scheduled disposition
    const savedLead = updatedLeads.find(l => l.id === leadId);
    if (savedLead && (followupDate || outcome.includes("Follow") || outcome.includes("Visit") || outcome.includes("Meeting") || outcome.includes("Call Back"))) {
      const isVisit = outcome.includes("Visit");
      const isMeeting = outcome.includes("Meeting");
      
      const newDispositionNotif = {
        id: `notif-disp-${Date.now()}`,
        title: isVisit 
          ? `🚗 Site Visit Scheduled: ${savedLead.name}`
          : isMeeting
          ? `🤝 Meeting Scheduled: ${savedLead.name}`
          : `⏰ Follow-up Due: ${savedLead.name}`,
        message: `Disposition: '${outcome}'. Scheduled for: ${followupDate || "Today"}. Client interest: ${bhkType || savedLead.bhkType || "Property"} (${savedLead.location || "Mumbai"}).`,
        source: `Scheduled Disposition (${outcome})`,
        type: isVisit ? "visit" : "followup",
        timeAgo: followupDate || "Scheduled",
        read: false,
        lead: savedLead
      };

      setNotifications(prev => [newDispositionNotif, ...prev.filter(n => n.lead?.id !== leadId)]);
      saveNotificationApi(newDispositionNotif);
    }

    await syncWithFrappeBackend("log_call", {
      lead_id: leadId,
      duration,
      outcome,
      bhk_type: bhkType,
      notes,
      followup_date: followupDate,
      recordedAudioUrl
    });

    const isDealWon = (outcome || "").includes("Closed") || (outcome || "").includes("Won");
    const isNotInt = (outcome || "").toLowerCase().includes("not interested");
    const toastMsg = isDealWon 
      ? `🎉 Deal Closed (Won) for '${targetLeadName}'!` 
      : isNotInt 
      ? `❌ '${targetLeadName}' marked as Not Interested.` 
      : `⏰ Disposition '${outcome}' logged! '${targetLeadName}' moved from Fresh to Follow-ups.`;
    showToast(toastMsg);
    setActiveCallLead(null);
  };

  const simulateSocialInboundLead = () => {
    const template = SOCIAL_LEAD_TEMPLATES[Math.floor(Math.random() * SOCIAL_LEAD_TEMPLATES.length)];
    const randomDigits = Math.floor(10000 + Math.random() * 89999);
    const newLeadId = `LEAD-INB-${randomDigits}`;

    const newLeadObj = {
      id: newLeadId,
      name: template.name,
      lead_name: template.name,
      phone: template.phone || `+91 98205 ${randomDigits}`,
      email: `${template.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      priority: template.priority || "HOT",
      status: "NEW",
      service: template.service || "Home Buying",
      bhkType: template.bhkType || "2 BHK",
      bhk_type: template.bhkType || "2 BHK",
      location: template.location || "Mumbai",
      source: "Direct Inbound Call",
      timeAgo: "Just now",
      createdAt: new Date().toISOString(),
      callCount: 0,
      callbackTime: null,
      notes: template.notes || "Inbound caller connected via IVR.",
      history: []
    };

    setIncomingCallLead(newLeadObj);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Inbound Call from ${newLeadObj.name}`, {
        body: `${newLeadObj.source} | ${newLeadObj.service} (${newLeadObj.bhkType})`,
        icon: "/favicon.ico"
      });
    }

    const newNotification = {
      id: Date.now(),
      title: `📞 Inbound Call: ${newLeadObj.name}`,
      message: `${newLeadObj.source} - ${newLeadObj.service} (${newLeadObj.location})`,
      source: newLeadObj.source,
      timeAgo: "Just now",
      read: false,
      lead: newLeadObj
    };
    setNotifications(prev => [newNotification, ...prev]);
    saveNotificationApi(newNotification);

    // Save lead to MariaDB immediately so it is recorded
    syncWithFrappeBackend("create_lead", newLeadObj);
  };

  const handleAcceptIncomingCall = (lead) => {
    if (incomingCallNotifId) {
      handledInboundCallsRef.current.add(String(incomingCallNotifId));
      markNotificationReadApi(incomingCallNotifId);
    }
    const currentLead = lead || incomingCallLead;
    if (currentLead?.id) {
      handledInboundCallsRef.current.add(String(currentLead.id));
    }
    if (currentLead?.phone) {
      handledInboundCallsRef.current.add(String(currentLead.phone));
    }
    setNotifications(prev => prev.map(n => n.id === incomingCallNotifId ? { ...n, read: true } : n));
    
    if (currentLead) {
      const acceptedLead = {
        ...currentLead,
        status: "NEW",
        callCount: 0
      };
      setLeads(prev => {
        const filtered = prev.filter(l => l.id !== acceptedLead.id && l.phone !== acceptedLead.phone);
        const updated = [acceptedLead, ...filtered];
        saveStoredLeads(updated);
        return updated;
      });
      syncWithFrappeBackend("create_lead", acceptedLead);
      setActiveCallLead(acceptedLead);
    }

    setIncomingCallLead(null);
    setIncomingCallNotifId(null);
  };

  const handleRejectIncomingCall = () => {
    if (incomingCallNotifId) {
      handledInboundCallsRef.current.add(String(incomingCallNotifId));
      markNotificationReadApi(incomingCallNotifId);
    }
    const currentLead = incomingCallLead;
    if (currentLead?.id) {
      handledInboundCallsRef.current.add(String(currentLead.id));
    }
    if (currentLead?.phone) {
      handledInboundCallsRef.current.add(String(currentLead.phone));
    }
    setNotifications(prev => prev.map(n => n.id === incomingCallNotifId ? { ...n, read: true } : n));
    setIncomingCallLead(null);
    setIncomingCallNotifId(null);

    if (currentLead) {
      const declinedLead = {
        id: currentLead.id || `LEAD-INB-${Date.now()}`,
        name: currentLead.name || currentLead.lead_name || "Direct Inbound Caller",
        lead_name: currentLead.name || currentLead.lead_name || "Direct Inbound Caller",
        phone: currentLead.phone || "+91 98000 00000",
        email: currentLead.email || "",
        priority: "HOT",
        status: "NEW", // ALWAYS Fresh Leads
        service: currentLead.service || "Home Buying",
        bhkType: currentLead.bhkType || currentLead.bhk_type || "2 BHK",
        bhk_type: currentLead.bhkType || currentLead.bhk_type || "2 BHK",
        location: currentLead.location || "Mumbai",
        source: "Direct Inbound Call",
        timeAgo: "Just now",
        createdAt: new Date().toISOString(),
        callCount: 0,
        notes: currentLead.notes ? `${currentLead.notes} (Inbound Call Disconnected/Declined)` : "Inbound caller rang agent. Call disconnected/declined. Follow up immediately."
      };

      setLeads(prev => {
        const filtered = prev.filter(l => l.id !== declinedLead.id && l.phone !== declinedLead.phone);
        const updated = [declinedLead, ...filtered];
        saveStoredLeads(updated);
        return updated;
      });

      syncWithFrappeBackend("create_lead", declinedLead);
      handleSetTab("fresh");
      showToast(`⚡ Call disconnected - Inbound lead '${declinedLead.name}' added to Fresh Leads!`);
    }
  };

  const handleClaimLeads = () => {
    setShowClaimModal(true);
  };

  const handleConfirmClaim = async (selectedLeadObjs, ptsUsed) => {
    const currentPoints = metrics?.rewardPoints ?? 2400;
    const currentUsed = metrics?.usedPoints ?? 0;
    const currentUnclaimed = metrics?.unclaimedCount ?? 5;

    const leadCount = Array.isArray(selectedLeadObjs) ? selectedLeadObjs.length : selectedLeadObjs;
    const newBalance = Math.max(0, currentPoints - ptsUsed);
    const newUsed = currentUsed + ptsUsed;
    const newUnclaimed = Math.max(0, currentUnclaimed - leadCount);

    const updatedMetrics = {
      ...metrics,
      rewardPoints: newBalance,
      usedPoints: newUsed,
      unclaimedCount: newUnclaimed
    };

    setMetrics(updatedMetrics);
    saveStoredMetrics(updatedMetrics);

    const poolData = Array.isArray(selectedLeadObjs) ? selectedLeadObjs : [
      { name: "Kiran Bhat", bhk: "2 BHK", location: "Andheri West" },
      { name: "Siddharth Malhotra", bhk: "3 BHK", location: "Lokhandwala" },
      { name: "Ananya Panday", bhk: "2 BHK", location: "Bandra Sea View" },
      { name: "Vikramaditya Roy", bhk: "4 BHK", location: "Worli Sea Face" },
      { name: "Radhika Merchant", bhk: "3 BHK Luxury", location: "Thane West" }
    ];

    const newlyClaimedLeads = poolData.slice(0, leadCount).map((item, idx) => ({
      id: `CLAIMED-00${idx + 1}`,
      name: item.name,
      lead_name: item.name,
      phone: item.phone || `+91 98200 ${12345 + idx * 111}`,
      email: `${item.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      service: item.service || "Home Buying",
      bhkType: item.bhk || item.bhkType || "2 BHK",
      bhk_type: item.bhk || item.bhkType || "2 BHK",
      location: item.location || "Mumbai",
      priority: "HOT",
      status: "NEW",
      timeAgo: "Just Claimed",
      callCount: 0,
      assigned_to: userProfile?.id || "shyampandey1104@gmail.com",
      notes: "Claimed using Reward Points via CRM Pool"
    }));

    const updatedLeadsList = [...newlyClaimedLeads, ...leads];
    setLeads(updatedLeadsList);
    saveStoredLeads(updatedLeadsList);

    try {
      await claimLeadsApi(newlyClaimedLeads.map(l => l.id), ptsUsed);
    } catch (e) {
      console.log("[Frappe Claim API Notice] Offline fallback active.");
    }

    showToast(`🎉 ${leadCount} Fresh Leads claimed successfully! (${ptsUsed} Points deducted. Balance: ${newBalance} Pts)`);
  };

  const handleTestLeadCreated = (newLead) => {
    if (!newLead) return;
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveStoredLeads(updated);
    showToast(`🎉 Inbound Lead '${newLead.name}' ingested via ${newLead.source}!`);
  };

  const handleLeadUpdated = (updatedLead) => {
    if (!updatedLead) return;
    const updated = leads.map(l => l.id === updatedLead.id ? { ...l, ...updatedLead } : l);
    setLeads(updated);
    saveStoredLeads(updated);
    showToast(`✅ Lead '${updatedLead.name}' updated successfully!`);
  };

  const handleLeadDeleted = (deletedLeadId) => {
    const updated = leads.filter(l => l.id !== deletedLeadId);
    setLeads(updated);
    saveStoredLeads(updated);
    showToast(`🗑️ Lead deleted successfully!`);
  };

  const renderContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <PerformanceView
            metrics={metrics}
            leads={leads}
            onCallLead={handleCallLead}
            onStartCalling={() => setCurrentTab("fresh")}
            onClaimLeads={handleClaimLeads}
            onOpenColdDialer={() => setShowColdDialer(true)}
          />
        );
      case "actions":
        return (
          <TodaysActionsView
            leads={leads}
            onSelectAction={(tab) => setCurrentTab(tab)}
            onOpenColdDialer={() => setShowColdDialer(true)}
            showToast={showToast}
          />
        );
      case "fresh":
        return (
          <FreshLeadsView
            leads={leads}
            onCallLead={handleCallLead}
            onSendReport={(lead) => setReportLead(lead)}
            showToast={showToast}
            onLeadCreated={(newLead) => {
              const updated = [newLead, ...leads.filter(l => l.id !== newLead.id)];
              setLeads(updated);
              saveStoredLeads(updated);
              showToast(`🎉 Fresh Lead '${newLead.name}' created successfully!`);
              fetchCrmLeads().then((data) => {
                if (data && data.length > 0) setLeads(data);
              });
            }}
            onLeadUpdated={handleLeadUpdated}
            onLeadDeleted={handleLeadDeleted}
            onLeadsImported={(importedLeads) => {
              const updated = [...importedLeads, ...leads];
              setLeads(updated);
              saveStoredLeads(updated);
              showToast(`🎉 Successfully imported ${importedLeads.length} leads from Excel!`);
            }}
          />
        );
      case "followup":
        return (
          <FollowUpsView
            leads={leads}
            onCallLead={handleCallLead}
            onLeadUpdated={handleLeadUpdated}
            onLeadDeleted={handleLeadDeleted}
            showToast={showToast}
          />
        );
      case "properties":
        return (
          <PropertiesView
            showToast={showToast}
            onShareProperty={(prop) => {
              const highlightsText = prop.highlights && Array.isArray(prop.highlights) ? prop.highlights.map(h => `✔️ ${h}`).join("\n") : "";
              const fullPitch = `✨ *${prop.title}* – ${prop.location}\nBy *${prop.builder}*\n\n🏡 *Configurations:* ${prop.bhk}\n📐 *Carpet Area:* ${prop.carpet}\n💰 *Price:* ${prop.priceRange || prop.price}\n\n⭐ *Highlights:*\n${highlightsText}\n\n📞 Book your exclusive site visit today!\n*Dream Homes Real Estate*`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullPitch)}`, '_blank');
              showToast(`📲 WhatsApp sharing link opened for '${prop.title}'!`);
            }}
          />
        );
      case "activities":
        return (
          <ActivitiesView showToast={showToast} />
        );
      default:
        return (
          <PerformanceView
            metrics={metrics}
            onStartCalling={() => setCurrentTab("fresh")}
            onClaimLeads={handleClaimLeads}
            onOpenColdDialer={() => setShowColdDialer(true)}
            showToast={showToast}
          />
        );
    }
  };

  const renderModals = () => (
    <>
      {/* Active Call Dialer Modal */}
      {activeCallLead && (
        <DialerModal
          lead={activeCallLead}
          onClose={() => setActiveCallLead(null)}
          onSaveCall={handleSaveCall}
          showToast={showToast}
        />
      )}

      {/* Inbound Call Simulated Modal */}
      {incomingCallLead && (
        <InboundCallModal
          lead={incomingCallLead}
          userProfile={userProfile}
          onAccept={handleAcceptIncomingCall}
          onReject={handleRejectIncomingCall}
          onDecline={handleRejectIncomingCall}
        />
      )}

      {/* WhatsApp Report Generator Modal */}
      {reportLead && (
        <WhatsAppReportModal
          lead={reportLead}
          onClose={() => setReportLead(null)}
        />
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setShowNotificationsModal(false)}
          onCallLead={(lead) => {
            setShowNotificationsModal(false);
            if (lead) handleCallLead(lead);
          }}
          onWhatsAppLead={(lead) => {
            setShowNotificationsModal(false);
            if (lead) setReportLead(lead);
          }}
          onClearAll={() => {
            setNotifications([]);
            clearAllNotificationsApi();
          }}
          onMarkRead={(id) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            markNotificationReadApi(id);
          }}
        />
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          userProfile={userProfile}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}

      {/* Cold Calling & Meeting Modal */}
      {showColdDialer && (
        <ColdCallingModal
          isOpen={showColdDialer}
          onClose={() => setShowColdDialer(false)}
          onLogCall={handleCallLead}
        />
      )}

      {/* Work Attendance Modal */}
      {showAttendanceModal && (
        <WorkAttendanceModal
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
          currentUser={userProfile}
        />
      )}

      {/* Live Google Map Meeting Location Modal */}
      {showLocationModal && (
        <MeetingLocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          clientName="Client"
          initialLocation="Andheri West Sales Office"
        />
      )}

      {/* Stories & Highlights Showcase Modal */}
      {showStoriesModal && (
        <StoriesHighlightsModal
          isOpen={showStoriesModal}
          onClose={() => setShowStoriesModal(false)}
        />
      )}

      {/* Real Estate Financial Calculator Modal */}
      {showCalculatorModal && (
        <RealEstateCalculatorModal
          isOpen={showCalculatorModal}
          onClose={() => setShowCalculatorModal(false)}
        />
      )}

      {/* Install App on Phone Modal */}
      {showInstallModal && (
        <InstallAppModal
          isOpen={showInstallModal}
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Digital Business Card Modal */}
      {showBusinessCardModal && (
        <BusinessCardModal
          isOpen={showBusinessCardModal}
          onClose={() => setShowBusinessCardModal(false)}
          currentUser={userProfile}
        />
      )}

      {/* TCF Form Modal */}
      {showTCFModal && (
        <TCFModal
          isOpen={showTCFModal}
          onClose={() => setShowTCFModal(false)}
        />
      )}

      {/* MCF Form Modal */}
      {showMCFModal && (
        <MCFModal
          isOpen={showMCFModal}
          onClose={() => setShowMCFModal(false)}
        />
      )}

      {/* Claim Fresh Leads Modal */}
      {showClaimModal && (
        <ClaimLeadsModal
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onConfirmClaim={handleConfirmClaim}
        />
      )}

      {/* ChatGPT AI Assistant Modal */}
      {showGptModal && (
        <GptAssistantModal
          isOpen={showGptModal}
          onClose={() => setShowGptModal(false)}
          currentUser={userProfile}
        />
      )}

      {/* Lead Webhook & Social Integrations Modal */}
      {showIntegrationsModal && (
        <IntegrationsModal
          isOpen={showIntegrationsModal}
          onClose={() => setShowIntegrationsModal(false)}
          onTestLeadCreated={handleTestLeadCreated}
          onOrgProfileUpdated={(newProf) => setOrgProfile(prev => ({ ...prev, ...newProf }))}
        />
      )}
    </>
  );

  if (!isAuthenticated) {
    return (
      <div className={isRealMobile ? "native-mobile-app-shell" : "app-container"} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (viewMode === "admin") {
    return (
      <div className={isRealMobile ? "native-mobile-app-shell" : "app-container"}>
        <Header
          currentTab={currentTab}
          setTab={handleSetTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSimulateInbound={simulateSocialInboundLead}
          unreadCount={unreadCount}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          userProfile={userProfile}
          onOpenProfile={() => setShowProfileModal(true)}
          orgProfile={orgProfile}
        />
        <main className="main-content-container" style={{ padding: isRealMobile ? "0.5rem" : "1.5rem" }}>
          <AdminPortal userProfile={userProfile} onSwitchToTelecaller={() => setViewMode("telecaller")} />
        </main>
        {renderModals()}
      </div>
    );
  }

  const handleDirectCall = () => {
    const targetLead = leads.find(l => l.status === "FOLLOWUP_TODAY" || l.status === "OVERDUE" || l.status === "NEW") || leads[0];
    if (targetLead) {
      handleCallLead(targetLead);
    } else {
      setShowColdDialer(true);
    }
  };

  if (isRealMobile) {
    return (
      <div className="native-mobile-app-shell">
        <MobileHeader
          unreadCount={unreadCount}
          onDirectCall={handleDirectCall}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          userProfile={userProfile}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSidebar={() => setShowSidebar(true)}
          onOpenIntegrations={() => setShowIntegrationsModal(true)}
          onOpenInstallApp={() => setShowInstallModal(true)}
          onSimulateInbound={simulateSocialInboundLead}
          orgProfile={orgProfile}
        />

        <div className="phone-screen-content">
          {renderContent()}
        </div>

        <MobileBottomNav currentTab={currentTab} setTab={handleSetTab} />

        {/* Slide-out Sidebar Drawer */}
        <SidebarDrawer
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          currentUser={userProfile}
          onNavigate={(tab) => {
            if (tab === "tcf-list" || tab === "mcf-list" || tab === "announcements") {
              handleSetTab("activities");
            } else {
              handleSetTab("properties");
            }
          }}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAttendance={() => setShowAttendanceModal(true)}
          onOpenBusinessCard={() => setShowBusinessCardModal(true)}
          onOpenTCF={() => setShowTCFModal(true)}
          onOpenMCF={() => setShowMCFModal(true)}
          onOpenGpt={() => setShowGptModal(true)}
          onOpenLocation={() => setShowLocationModal(true)}
          onOpenStories={() => setShowStoriesModal(true)}
          onOpenCalculator={() => setShowCalculatorModal(true)}
          onOpenInstallApp={() => setShowInstallModal(true)}
          onSimulateInbound={simulateSocialInboundLead}
        />

        {renderModals()}

        {toastMsg && (
          <div className="toast-notification">
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={isRealMobile ? "native-mobile-app-shell" : "mobile-frame-wrapper"} style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
      <div className={isRealMobile ? "native-mobile-app-shell" : "phone-device-container"} style={{ width: isRealMobile ? "100%" : "412px", height: isRealMobile ? "100vh" : "890px", maxHeight: isRealMobile ? "100vh" : "95vh", background: "#ffffff", borderRadius: isRealMobile ? "0" : "36px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", boxShadow: isRealMobile ? "none" : "0 25px 60px rgba(0,0,0,0.7)" }}>
        
        {!isRealMobile && (
          <div className="phone-status-bar" style={{ background: "#ffffff", height: "36px", padding: "0 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>
            <span>9:41</span>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={14} />
            </div>
          </div>
        )}

        <MobileHeader
          unreadCount={unreadCount}
          onDirectCall={handleDirectCall}
          onOpenNotifications={() => setShowNotificationsModal(true)}
          userProfile={userProfile}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenSidebar={() => setShowSidebar(true)}
          onOpenIntegrations={() => setShowIntegrationsModal(true)}
          onOpenInstallApp={() => setShowInstallModal(true)}
          onSimulateInbound={simulateSocialInboundLead}
          orgProfile={orgProfile}
        />

        <div className="phone-screen-content" style={{ flex: 1, overflowY: "auto" }}>
          {renderContent()}
        </div>

        <MobileBottomNav currentTab={currentTab} setTab={handleSetTab} />

        {/* Slide-out Sidebar Drawer */}
        <SidebarDrawer
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          currentUser={userProfile}
          onNavigate={(tab) => {
            if (tab === "tcf-list" || tab === "mcf-list" || tab === "announcements") {
              handleSetTab("activities");
            } else {
              handleSetTab("properties");
            }
          }}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenAttendance={() => setShowAttendanceModal(true)}
          onOpenBusinessCard={() => setShowBusinessCardModal(true)}
          onOpenTCF={() => setShowTCFModal(true)}
          onOpenMCF={() => setShowMCFModal(true)}
          onOpenGpt={() => setShowGptModal(true)}
          onOpenLocation={() => setShowLocationModal(true)}
          onOpenStories={() => setShowStoriesModal(true)}
          onOpenCalculator={() => setShowCalculatorModal(true)}
          onOpenInstallApp={() => setShowInstallModal(true)}
          onSimulateInbound={simulateSocialInboundLead}
        />

        {renderModals()}

        {toastMsg && (
          <div 
            style={{
              position: "fixed",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 999999,
              maxWidth: "340px",
              width: "90%",
              background: "rgba(15, 23, 42, 0.95)",
              color: "#ffffff",
              padding: "0.6rem 1rem",
              borderRadius: "9999px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)",
              fontSize: "0.8125rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.15)",
              pointerEvents: "none"
            }}
          >
            <span>{toastMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
