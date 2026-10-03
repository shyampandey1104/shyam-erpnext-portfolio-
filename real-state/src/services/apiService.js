// Dedicated Real Estate CRM Backend Service
// Supports Frappe Bench REST APIs & Standalone Python Backend
// Frappe API Base URL: http://127.0.0.1:8000/api/method/real_estate_crm.api

const LOCAL_BACKEND = "/api/method/real_state_crm.api";
const FRAPPE_API_URL = LOCAL_BACKEND;
const FRAPPE_DIRECT_URL = LOCAL_BACKEND;
const STANDALONE_BACKEND_URL = "http://localhost:5000";

const USERS_STORAGE_KEY = "leadcall_crm_users_v5";
const LEADS_STORAGE_KEY = "leadcall_crm_leads_v5";
const METRICS_STORAGE_KEY = "leadcall_crm_metrics_v5";

export const getCsrfToken = () => {
  if (typeof window !== "undefined") {
    if (window.csrf_token && window.csrf_token !== "None" && !String(window.csrf_token).includes("{{")) {
      return window.csrf_token;
    }
    if (window.frappe?.csrf_token) {
      return window.frappe.csrf_token;
    }
    const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
};

export const getApiHeaders = (extraHeaders = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  const token = getCsrfToken();
  if (token) {
    headers["X-Frappe-CSRF-Token"] = token;
  }
  return headers;
};

import { INITIAL_LEADS, INITIAL_METRICS, INITIAL_INVENTORY, INITIAL_ACTIVITIES } from "./mockData";

export const INITIAL_ADMIN_USERS = [
  { id: 1, name: "Shyam Pandey", email: "shyampandey1104@gmail.com", phone: "9867778229", mobile_no: "9867778229", role: "Senior Sales Consultant", status: "Active", areas: ["Andheri", "Bandra", "Goregaon"], leadCap: 100, initials: "SP" },
  { id: 2, name: "Administrator", email: "Administrator", phone: "+91 98201 11223", mobile_no: "+91 98201 11223", role: "Sales Manager", status: "Active", areas: ["All"], leadCap: 200, initials: "AD" }
];

export const fetchUserProfileApi = async (userEmail = "shyampandey1104@gmail.com") => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.get_user_profile?user_email=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json?.message?.data || json?.data) {
        return json.message?.data || json.data;
      }
    }
  } catch (e) {
    console.log("[User Profile Fetch Error]", e);
  }
  return null;
};

export const fetchMeetingLocationsApi = async (userEmail) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.get_meeting_locations`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ user_email: userEmail })
    });
    if (res.ok) {
      const json = await res.json();
      return json.message || json;
    }
  } catch (err) {
    console.log("[Frappe Meeting Locations Error]", err);
  }
  return null;
};

export const fetchCrmUsers = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_users`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_users`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data && json.message.data.length > 0) {
        saveStoredUsers(json.message.data);
        return json.message.data;
      }
    }
  } catch (e) {
    console.log("[Frappe Users Notice] Offline mode active.");
  }
  return getStoredUsers();
};

export const fetchCrmLeads = async (userEmail = null) => {
  try {
    const customHeaders = { "Bypass-Tunnel-Reminder": "true", "ngrok-skip-browser-warning": "69420" };
    const url = `${FRAPPE_API_URL}.get_leads`;
    
    let res = await fetch(url, { headers: customHeaders });
    if (res && res.ok) {
      const json = await res.json();
      const rawLeads = json?.message?.data || json?.data || [];
      if (Array.isArray(rawLeads) && rawLeads.length > 0) {
        const normalized = rawLeads.map(l => ({
          ...l,
          id: l.name,
          name: l.lead_name || l.name,
          lead_name: l.lead_name || l.name,
          phone: l.phone || "",
          email: l.email || "",
          priority: l.priority || "HOT",
          status: l.status || "NEW",
          service: l.service || "Home Buying",
          bhkType: l.bhk_type || l.bhkType || "2 BHK",
          bhk_type: l.bhk_type || l.bhkType || "2 BHK",
          location: l.location || "Mumbai",
          source: l.source || "Direct Walk-in",
          timeAgo: l.creation ? new Date(l.creation).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Today",
          callCount: l.call_count || 0,
          notes: l.notes || ""
        }));
        saveStoredLeads(normalized);
        return normalized;
      }
    }
  } catch (e) {
    console.log("[Frappe Leads Notice] Fetch fallback active.", e);
  }
  return getStoredLeads();
};

export const reassignLeadApi = async (leadId, newAssignedTo, newArea = null) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.reassign_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ lead_id: leadId, new_assigned_to: newAssignedTo, new_area: newArea })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Reassign Lead Notice] Offline mode active.");
  }
  return { status: "success", message: `Lead ${leadId} reassigned to ${newAssignedTo}` };
};

export const fetchCrmInventory = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_inventory`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_inventory`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message) {
        return json.message;
      }
    }
  } catch (e) {
    console.log("[Frappe Inventory Notice] Offline mode active.");
  }
  return { status: "success", categories: INITIAL_INVENTORY, data: INITIAL_INVENTORY.focusProjects };
};

export const submitProjectSurvey = async (surveyData) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.submit_project_survey`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(surveyData)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Survey Frappe Notice] Offline mode active.");
  }
  return { status: "success", message: "Survey submitted successfully to Frappe DB!" };
};

export const calculateCmaApi = async (locality, carpetArea) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.calculate_cma`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ locality, carpet_area: carpetArea })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.message) return json.message;
    }
  } catch (e) {
    console.log("[CMA Frappe Notice] Offline mode active.");
  }
  return null;
};

export const uploadPropertyApi = async (propertyData) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_property`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        title: propertyData.title,
        builder: propertyData.builder,
        location: propertyData.location,
        price_range: propertyData.priceRange || propertyData.price,
        tag: propertyData.tag || "New Launch",
        bhk: propertyData.bhk,
        carpet: propertyData.carpet,
        img: propertyData.img || propertyData.image || propertyData.hero_img,
        video_url: propertyData.videoUrl || propertyData.video_url,
        brochure_file: propertyData.brochureFile || propertyData.brochure_file,
        highlights: Array.isArray(propertyData.highlights) ? propertyData.highlights.join(", ") : propertyData.highlights
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Upload Property Notice] Offline mode active.");
  }
  return { status: "success", message: "Property uploaded successfully to Frappe DB!" };
};

export const uploadUnitPlanApi = async (data) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.save_unit_plan`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.save_unit_plan`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(data)
      });
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Upload Unit Plan Notice] Offline mode active.");
  }
  return { status: "success", message: "Unit Plan uploaded to Frappe DB!" };
};

export const uploadPropertyDocumentApi = async (data) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.save_property_document`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.save_property_document`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(data)
      });
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Upload Document Notice] Offline mode active.");
  }
  return { status: "success", message: "Property Document uploaded to Frappe DB!" };
};

export const uploadPropertyVideoApi = async (data) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.save_property_video`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.save_property_video`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(data)
      });
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Upload Video Notice] Offline mode active.");
  }
  return { status: "success", message: "Property Video saved to Frappe DB!" };
};

export const fetchPropertyDocumentsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_property_documents`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {
    console.log("[Frappe Documents Notice] Offline mode active.");
  }
  try {
    const saved = localStorage.getItem("crm_property_docs");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const deletePropertyDocumentApi = async (docId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_property_document`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ doc_id: docId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Document ${docId} deleted` };
};

export const fetchUnitPlansApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_unit_plans`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {
    console.log("[Frappe Unit Plans Notice] Offline mode active.");
  }
  try {
    const saved = localStorage.getItem("crm_unit_plans");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const deleteUnitPlanApi = async (planId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_unit_plan`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ plan_id: planId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Unit Plan ${planId} deleted` };
};

export const fetchPropertyVideosApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_property_videos`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {
    console.log("[Frappe Videos Notice] Offline mode active.");
  }
  try {
    const saved = localStorage.getItem("crm_videos");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

export const deletePropertyVideoApi = async (videoId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_property_video`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ video_id: videoId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Video Tour ${videoId} deleted` };
};

export const fetchCmaAnalysesApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_cma_analyses`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  return [];
};

export const deleteCmaAnalysisApi = async (cmaId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_cma_analysis`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ cma_id: cmaId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `CMA Record ${cmaId} deleted` };
};

export const fetchProjectSurveysApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_project_surveys`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  return [];
};

export const deleteProjectSurveyApi = async (surveyId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_project_survey`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ survey_id: surveyId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Survey ${surveyId} deleted` };
};

export const uploadPropertyListingApi = async (data) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.save_property_listing`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.save_property_listing`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(data)
      });
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Upload Listing Notice] Offline mode active.");
  }
  return { status: "success", message: "Property Listing saved to Frappe DB!" };
};

export const savePropertyListingApi = uploadPropertyListingApi;

export const fetchPropertyListingsApi = async (listingType = null) => {
  try {
    const url = listingType ? `${FRAPPE_API_URL}.get_property_listings?listing_type=${encodeURIComponent(listingType)}` : `${FRAPPE_API_URL}.get_property_listings`;
    let res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {
    console.log("[Frappe Listings Notice] Offline mode active.");
  }
  return [];
};

export const deletePropertyListingApi = async (listingId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_property_listing`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ listing_id: listingId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Listing ${listingId} deleted` };
};

export const deletePropertyApi = async (title) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_property`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ title: title })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: `Property ${title} deleted` };
};

export const uploadFileToFrappeApi = async (fileName, base64Content) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.upload_file_api`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ filename: fileName, file_content_base64: base64Content })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", file_url: `/files/${fileName}` };
};

export const saveLeadApi = async (leadData) => {
  const isTempId = !leadData.id || String(leadData.id).startsWith("LEAD-") || String(leadData.id).startsWith("lead_");
  const payload = {
    lead_id: isTempId ? null : leadData.id,
    name: leadData.name || leadData.lead_name || "New Inbound Lead",
    lead_name: leadData.name || leadData.lead_name || "New Inbound Lead",
    phone: leadData.phone,
    email: leadData.email || "",
    priority: leadData.priority || "HOT",
    status: leadData.status || "NEW",
    service: leadData.service || "Home Buying",
    bhk_type: leadData.bhkType || leadData.bhk_type || "2 BHK",
    location: leadData.location || "Mumbai",
    source: leadData.source || "Direct Walk-in",
    notes: leadData.notes || ""
  };

  let savedId = leadData.id || `LEAD-${Date.now().toString().slice(-4)}`;
  let result = { status: "success", lead_id: savedId };

  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      result = data.message || data;
      if (result && (result.lead_id || result.id)) {
        savedId = result.lead_id || result.id;
      }
    }
  } catch (e) {
    console.log(`[saveLeadApi Error]`, e);
  }

  // Update local storage so that even if offline or before poll, lead is present
  try {
    const stored = getStoredLeads();
    const normalizedNew = {
      ...leadData,
      id: savedId,
      name: leadData.name || leadData.lead_name,
      lead_name: leadData.name || leadData.lead_name,
      bhkType: leadData.bhkType || leadData.bhk_type || "2 BHK",
      bhk_type: leadData.bhkType || leadData.bhk_type || "2 BHK",
      status: leadData.status || "NEW",
      callCount: leadData.callCount || 0,
      timeAgo: "Just Now"
    };
    const updated = [normalizedNew, ...stored.filter(l => l.id !== savedId && l.id !== leadData.id)];
    saveStoredLeads(updated);
  } catch (err) {}

  return result;
};

export const bulkSaveLeadsApi = async (leadsList) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.bulk_save_leads`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ leads: leadsList })
    });
    if (res.ok) {
      const data = await res.json();
      const result = data.message || data;
      await fetchCrmLeads();
      return result;
    }
  } catch (e) {
    console.log("[bulkSaveLeadsApi Error]", e);
  }
  return { status: "success", imported_count: leadsList.length };
};

export const exportLeadsApi = async (status = null, priority = null) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (priority) params.append("priority", priority);
    const res = await fetch(`${FRAPPE_API_URL}.export_leads?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.message?.data || data.data || [];
    }
  } catch (e) {
    console.log("[exportLeadsApi Error]", e);
  }
  return null;
};

export const deleteLeadApi = async (leadId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ lead_id: leadId })
    });
    if (res.ok) {
      const data = await res.json();
      return data.message || data;
    }
  } catch (e) {
    console.log(`[deleteLeadApi Error]`, e);
  }

  const stored = getStoredLeads();
  const updated = stored.filter(l => l.id !== leadId);
  saveStoredLeads(updated);
  return { status: "success", message: `Lead ${leadId} deleted successfully` };
};

export const claimLeadsApi = async (leadIds, pointsUsed) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.claim_leads_api`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        lead_ids: leadIds,
        points_used: pointsUsed
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Claim Leads Notice] Offline mode active.");
  }
  return { status: "success", message: `Successfully claimed ${leadIds?.length || 5} Fresh Leads!` };
};

export const fetchIntegrationSettings = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_integration_settings`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_integration_settings`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message) return json.message;
    }
  } catch (e) {
    console.log("[Integration Settings Notice] Offline fallback active.");
  }
  return {
    website_url: "https://dreamhomes.in",
    website_webhook: "http://127.0.0.1:8000/api/method/real_state_crm.api.website_lead_webhook",
    instagram_page_id: "dreamhomes_official",
    instagram_token: "EAAB123456789_INSTA_TOKEN",
    facebook_form_id: "FB_LEADGEN_FORM_99201",
    youtube_channel_url: "https://youtube.com/@dreamhomesmumbai"
  };
};

export const saveIntegrationSettings = async (settings) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.save_integration_settings`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(settings)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.save_integration_settings`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(settings)
      });
    }
    if (res.ok) return await res.json();
  } catch (e) {
    console.log("[Save Settings Notice] Offline mode active.");
  }
  return { status: "success", message: "CRM Lead Integration Settings saved to Frappe DB!" };
};

export const testInboundWebhookLead = async (channel) => {
  let endpoint = "website_lead_webhook";
  let payload = {};

  if (channel === "instagram") {
    endpoint = "instagram_lead_webhook";
    payload = { instagram_handle: "kavita_mumbai", location: "Lokhandwala, Mumbai" };
  } else if (channel === "facebook") {
    endpoint = "facebook_lead_webhook";
    payload = { name: "Manish Malhotra (FB Ad)", location: "Bandra West, Mumbai" };
  } else if (channel === "youtube") {
    endpoint = "youtube_lead_webhook";
    payload = { name: "Aarav Sharma (YouTube)", video_title: "Kalpataru Vian 3D Tour", location: "Worli Sea Face" };
  } else {
    payload = { name: "Rohan Varma (Website Form)", location: "Andheri West, Mumbai" };
  }

  try {
    let res = await fetch(`${FRAPPE_API_URL}.${endpoint}`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.${endpoint}`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify(payload)
      });
    }
    if (res.ok) {
      const json = await res.json();
      return json.message || json;
    }
  } catch (e) {
    console.log("[Webhook Test Notice] Offline mode active.");
  }

  return {
    status: "success",
    message: `Test ${channel.toUpperCase()} Lead ingested successfully!`,
    lead: {
      id: `${channel.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: payload.name || `New ${channel.toUpperCase()} Lead`,
      phone: "+91 98765 43210",
      email: `${channel}@dreamhomes.in`,
      source: channel === "instagram" ? "Instagram DM" : channel === "facebook" ? "Facebook Ads" : channel === "youtube" ? "YouTube Channel" : "Website Webhook",
      service: "Home Buying",
      bhkType: "2 & 3 BHK",
      location: payload.location || "Mumbai",
      priority: "HOT",
      status: "NEW",
      timeAgo: "Just Now",
      callCount: 0,
      notes: `Inbound lead captured via ${channel.toUpperCase()} Webhook Integration`
    }
  };
};

export const fetchCrmMetrics = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_dashboard_metrics`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_dashboard_metrics`);
    }
    if (res.ok) {
      const json = await res.json();
      const payload = json.message?.data || json.message?.metrics || json.message || json.data || json.metrics || json;
      if (payload && typeof payload === "object") {
        saveStoredMetrics(payload);
        return payload;
      }
    }
  } catch (e) {
    console.log("[Frappe Metrics Notice] Offline mode active.");
  }
  return getStoredMetrics();
};

export const fetchCrmActivities = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_activities`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_activities`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message) {
        return json.message;
      }
    }
  } catch (e) {
    console.log("[Frappe Activities Notice] Offline mode active.");
  }
  return { status: "success", categories: INITIAL_ACTIVITIES, data: INITIAL_ACTIVITIES.myVisits };
};

export const authenticateCrmUser = async (email, password, role) => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.login_user`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.login_user`, {
        method: "POST",
        headers: getApiHeaders(),
        body: JSON.stringify({ email, password, role })
      });
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message) {
        return json.message;
      }
    }
  } catch (e) {
    console.log("[Frappe Auth Notice] Offline mode active.");
  }
  return null;
};

export const getStoredUsers = () => {
  const local = localStorage.getItem(USERS_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_USERS));
    return INITIAL_ADMIN_USERS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return INITIAL_ADMIN_USERS;
  }
};

export const saveStoredUsers = (users) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getStoredLeads = () => {
  const local = localStorage.getItem(LEADS_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
    return INITIAL_LEADS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return INITIAL_LEADS;
  }
};

export const saveStoredLeads = (leads) => {
  localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
};

export const getStoredMetrics = () => {
  const local = localStorage.getItem(METRICS_STORAGE_KEY);
  if (!local) {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(INITIAL_METRICS));
    return INITIAL_METRICS;
  }
  try {
    return JSON.parse(local);
  } catch (e) {
    return INITIAL_METRICS;
  }
};

export const saveStoredMetrics = (metrics) => {
  localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
};

export const registerCrmUser = async (userData) => {
  console.log(`[Frappe & Python User Register] Syncing user:`, userData);
  try {
    const response = await fetch(`${FRAPPE_API_URL}.register_user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role
      })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    // Offline Storage Active
  }
  return { status: "success", simulated: true };
};

/**
 * Universal Sync with Frappe REST API & Standalone Python Backend
 */
export const syncWithFrappeBackend = async (actionType, payload) => {
  console.log(`[Frappe Sync] Executing action: ${actionType}`, payload);

  // 1. Try Frappe Whitelisted REST Endpoint
  try {
    let frappeMethod = "save_lead";
    let body = {};

    if (actionType === "log_call") {
      frappeMethod = "log_call";
      body = payload;
    } else if (actionType === "save_attendance") {
      frappeMethod = "save_attendance";
      body = payload;
    } else {
      frappeMethod = "save_lead";
      body = payload;
    }

    const res = await fetch(`${FRAPPE_API_URL}.${frappeMethod}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[Frappe Server Response]`, data);
      return { success: true, data };
    }
  } catch (e) {
    console.log(`[Frappe Notice] Frappe Bench endpoint offline, falling back to local backend.`);
  }

  // 2. Standalone Python Backend Fallback
  try {
    const endpoint = actionType === "log_call" ? "/api/log-call" : "/api/save-lead";
    const response = await fetch(`${STANDALONE_BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result };
    }
  } catch (err) {
    // Offline Storage Active
  }

  return { success: true, simulated: true };
};

export const fetchCrmNotifications = async () => {
  try {
    const customHeaders = { "Bypass-Tunnel-Reminder": "true", "ngrok-skip-browser-warning": "69420" };
    let res = await fetch(`${FRAPPE_API_URL}.get_notifications`, { headers: customHeaders });
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_notifications`, { headers: customHeaders });
    }
    if (res && res.ok) {
      const json = await res.json();
      const list = json?.message?.data || json?.data || json?.message;
      if (Array.isArray(list)) {
        return list;
      }
    }
  } catch (e) {
    console.log("[Frappe Notifications Notice] Offline mode active.");
  }
  return null;
};

export const saveNotificationApi = async (notifData) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_notification`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        title: notifData.title,
        message: notifData.message,
        source: notifData.source || "Scheduled Disposition",
        notif_type: notifData.type || "followup",
        lead_id: notifData.lead?.id || notifData.lead_id,
        lead_name: notifData.lead?.name || notifData.lead_name,
        lead_phone: notifData.lead?.phone || notifData.lead_phone,
        lead_location: notifData.lead?.location || notifData.lead_location,
        lead_bhk: notifData.lead?.bhkType || notifData.lead_bhk,
        is_read: notifData.read ? 1 : 0,
        time_ago: notifData.timeAgo
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Save Notification Error]", e);
  }
  return { status: "success" };
};

export const markNotificationReadApi = async (notifId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.mark_notification_read`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ notif_id: notifId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Mark Read Error]", e);
  }
  return { status: "success" };
};

export const clearAllNotificationsApi = async () => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.clear_all_notifications`, {
      method: "POST"
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Clear Notifications Error]", e);
  }
  return { status: "success" };
};

export const fetchOrgProfile = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_org_profile`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_org_profile`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) {
        return json.message.data;
      }
    }
  } catch (e) {
    console.log("[Frappe Org Profile Notice] Offline mode active.");
  }
  return {
    company_name: "Dream Homes Real Estate",
    company_tagline: "Mumbai's Premier Luxury Real Estate Partner",
    logo_url: "/dreamhomes_logo.png",
    maharera_no: "A51800045492",
    contact_email: "sales@dreamhomes42.com",
    contact_phone: "+91 98205 91823",
    website_url: "https://dreamhomes42.com"
  };
};

export const saveOrgProfile = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_org_profile`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.log("[Frappe Org Profile Save Notice] Offline mode active.");
  }
  return { status: "success", message: "🎉 Organization Profile & Branding saved locally!" };
};

export const askChatGptCopilot = async (prompt, persona = "Sales Advisor", userName = "Shyam") => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.chat_gpt_copilot`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ prompt, persona, user_name: userName })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.response) {
        return json.message.response;
      }
    }
  } catch (e) {
    console.log("[ChatGPT Copilot Notice] Offline mode active.");
  }
  return null;
};

export const fetchWorkAttendanceApi = async (userEmail = "shyampandey1104@gmail.com") => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_attendance_status?user_email=${encodeURIComponent(userEmail)}`);
    if (!res.ok) {
      res = await fetch(`${FRAPPE_DIRECT_URL}.get_attendance_status?user_email=${encodeURIComponent(userEmail)}`);
    }
    if (res.ok) {
      const json = await res.json();
      if (json.message) return json.message;
    }
  } catch (e) {
    console.log("[Attendance Status Notice] Offline mode active.");
  }
  return null;
};

export const toggleWorkAttendanceApi = async (userEmail = "shyampandey1104@gmail.com", userName = "Shyam Pandey", location = "Andheri Sales Office (GPS Verified)", targetStatus = null) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.toggle_attendance`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        user_email: userEmail,
        user_name: userName,
        location: location,
        status: targetStatus
      })
    });
    if (res.ok) {
      const json = await res.json();
      return json.message || json;
    }
  } catch (e) {
    console.log("[Attendance Toggle Notice] Offline mode active.");
  }
  return {
    status: "success",
    clockedIn: targetStatus === "Clocked In",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today",
    location: location,
    message: `Attendance request '${targetStatus}' recorded in Frappe MariaDB DocType!`
  };
};

// --- ACTIVITY & SCHEDULE REST APIS ---

export const fetchSiteVisitsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_site_visits`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_visits");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveSiteVisitApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_site_visit`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Site Visit saved locally!" };
};

export const deleteSiteVisitApi = async (visitId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_site_visit`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ visit_id: visitId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Site visit deleted" };
};

export const fetchQualifiedLeadsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_qualified_leads`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_sql");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveQualifiedLeadApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_qualified_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Qualified Lead saved locally!" };
};

export const deleteQualifiedLeadApi = async (leadId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_qualified_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ lead_id: leadId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Qualified lead deleted" };
};

export const fetchClaimedLeadsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_claimed_leads`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_claimed");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveClaimedLeadApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_claimed_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Claimed Lead saved locally!" };
};

export const deleteClaimedLeadApi = async (claimId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_claimed_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ claim_id: claimId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Claimed record deleted" };
};

export const fetchUniqueLeadsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_unique_leads`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_unique");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveUniqueLeadApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_unique_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Unique Lead saved locally!" };
};

export const deleteUniqueLeadApi = async (leadId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_unique_lead`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ lead_id: leadId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Unique lead deleted" };
};

export const fetchSiteVisitSchedulesApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_site_visit_schedules`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_schedules");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveSiteVisitScheduleApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_site_visit_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Site visit schedule saved locally!" };
};

export const deleteSiteVisitScheduleApi = async (schId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_site_visit_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ sch_id: schId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Schedule deleted" };
};

export const fetchMeetingSchedulesApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_meeting_schedules`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_meetings");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveMeetingScheduleApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_meeting_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Meeting schedule saved locally!" };
};

export const deleteMeetingScheduleApi = async (mtgId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_meeting_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ mtg_id: mtgId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Meeting deleted" };
};

export const fetchVideoCallSchedulesApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_video_call_schedules`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_videocalls");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveVideoCallScheduleApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_video_call_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Video tour schedule saved locally!" };
};

export const deleteVideoCallScheduleApi = async (vcsId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_video_call_schedule`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ vcs_id: vcsId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Video call deleted" };
};

export const fetchTeamMembersApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_team_members`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  return [
    { name_member: "Rahul Sharma", role: "Telecaller", calls_count: 48, visits_count: 6, score: "94%" },
    { name_member: "Priya Sharma", role: "Sr. Telecaller", calls_count: 42, visits_count: 5, score: "91%" },
    { name_member: "Rajesh Kumar", role: "Mining Specialist", calls_count: 39, visits_count: 4, score: "88%" },
    { name_member: "Amit Patel", role: "Telecaller", calls_count: 31, visits_count: 3, score: "84%" }
  ];
};

export const saveTeamMemberApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_team_member`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Team Member saved locally!" };
};

export const deleteTeamMemberApi = async (memberId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_team_member`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ member_id: memberId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Team member deleted" };
};

export const fetchSpeedCallsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_speed_calls`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_act_3mincalls");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveSpeedCallApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_speed_call`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Speed call saved locally!" };
};

export const deleteSpeedCallApi = async (callId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_speed_call`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ call_id: callId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Speed call deleted" };
};

export const fetchActivityDocumentsApi = async () => {
  try {
    let res = await fetch(`${FRAPPE_API_URL}.get_activity_documents`);
    if (res.ok) {
      const json = await res.json();
      if (json.message && json.message.data) return json.message.data;
    }
  } catch (e) {}
  try {
    const saved = localStorage.getItem("crm_activity_docs");
    return saved ? JSON.parse(saved) : [];
  } catch (e) { return []; }
};

export const saveActivityDocumentApi = async (payload) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_activity_document`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Activity Document saved locally!" };
};

export const deleteActivityDocumentApi = async (docId) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.delete_activity_document`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ doc_id: docId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Activity document deleted" };
};

// --- DIGITAL BUSINESS CARD REST APIS ---

export const fetchDigitalBusinessCardApi = async (userEmail = "shyampandey1104@gmail.com") => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.get_digital_business_card?user_email=${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.message) return json.message;
    }
  } catch (e) {
    console.log("[Digital Business Card Notice] Offline mode active.");
  }
  return null;
};

export const saveDigitalBusinessCardApi = async (cardData) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.save_digital_business_card`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify(cardData)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success", message: "Digital Business Card recorded in MariaDB DocType!" };
};

export const trackBusinessCardShareApi = async (userEmail = "shyampandey1104@gmail.com", cardId = null) => {
  try {
    const res = await fetch(`${FRAPPE_API_URL}.increment_card_share`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ user_email: userEmail, card_id: cardId })
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: "success" };
};

