import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, "leads_db.json");

// Initial seed leads if DB does not exist
const INITIAL_LEADS = [
  {
    id: "LEAD-0037",
    name: "Test Lead Mobile",
    phone: "+919876543210",
    email: "",
    priority: "HOT",
    status: "NEW",
    service: "Home Buying",
    bhkType: "2 BHK",
    location: "Mumbai",
    source: "Direct Walk-in",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Recently Added",
    callCount: 0,
    notes: ""
  },
  {
    id: "LEAD-0036",
    name: "Papa",
    phone: "+919833359249",
    email: "",
    priority: "HOT",
    status: "NEW",
    service: "Home Buying",
    bhkType: "2 BHK",
    location: "Mumbai",
    source: "Direct Walk-in",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Recently Added",
    callCount: 0,
    notes: ""
  },
  {
    id: "LEAD-0035",
    name: "Rohan Varma (Website Form)",
    phone: "+91 98210 99887",
    email: "",
    priority: "HOT",
    status: "FOLLOWUP_TODAY",
    service: "Home Buying",
    bhkType: "2 BHK",
    location: "Mumbai",
    source: "Website Webhook (dreamhomes42.com)",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Recently Added",
    callCount: 3,
    notes: "Inbound Website Form Submission from dreamhomes42.com/contact"
  },
  {
    id: "LEAD-0034",
    name: "Aarav Sharma (YouTube)",
    phone: "+91 98211 77889",
    email: "",
    priority: "HOT",
    status: "NEW",
    service: "Home Buying",
    bhkType: "2 BHK",
    location: "Mumbai",
    source: "YouTube Channel",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Recently Added",
    callCount: 0,
    notes: "Inquiry for Kalpataru Vian 3D Tour"
  },
  {
    id: "LEAD-0033",
    name: "Manish Malhotra (FB Ad)",
    phone: "+91 98209 44332",
    email: "",
    priority: "HOT",
    status: "NEW",
    service: "Home Buying",
    bhkType: "2 BHK",
    location: "Mumbai",
    source: "Facebook Ads",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Recently Added",
    callCount: 0,
    notes: "Inbound lead via Facebook Instant Lead Ad"
  }
];

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Read DB error", e);
  }
  return INITIAL_LEADS;
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Write DB error", e);
  }
}

// Health check
app.get("/", (req, res) => {
  res.send({ status: "online", message: "Dream Homes CRM Cloud Backend is Live 24/7!" });
});

// REST API Endpoints matching Frappe structure
app.all("/api/method/real_estate_crm.real_estate_crm.api.get_leads", (req, res) => {
  const leads = readDb();
  res.json({ message: { status: "success", data: leads } });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.save_lead", (req, res) => {
  const body = req.body || {};
  const name = body.name || body.lead_name;
  const phone = body.phone;

  if (!name || !phone) {
    return res.status(400).json({ status: "error", message: "Name and Phone required" });
  }

  const leads = readDb();
  let leadId = body.lead_id;

  if (!leadId || leadId.startsWith("LEAD-17")) {
    const nextNum = leads.length + 38;
    leadId = `LEAD-00${nextNum}`;
  }

  const newLead = {
    id: leadId,
    name: name,
    phone: phone,
    email: body.email || "",
    priority: body.priority || "HOT",
    status: body.status || "NEW",
    service: body.service || "Home Buying",
    bhkType: body.bhk_type || body.bhkType || "2 BHK",
    location: body.location || "Mumbai",
    source: body.source || "Direct Walk-in",
    assignedTo: "shyampandey1104@gmail.com",
    assignedArea: "Andheri",
    timeAgo: "Just Now",
    callCount: 0,
    notes: body.notes || ""
  };

  const existingIndex = leads.findIndex(l => l.id === leadId || (l.phone === phone && l.name === name));
  if (existingIndex >= 0) {
    leads[existingIndex] = { ...leads[existingIndex], ...newLead };
  } else {
    leads.unshift(newLead);
  }

  writeDb(leads);
  res.json({ message: { status: "success", lead_id: leadId } });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.log_call", (req, res) => {
  const body = req.body || {};
  const leadId = body.lead_id || body.leadId;
  const outcome = body.outcome || body.status || "Connected";
  const duration = body.duration || "00:00";
  const notes = body.notes || "";
  const bhkType = body.bhk_type || body.bhkType;
  const callbackTime = body.callback_time || body.followupDate;

  const leads = readDb();
  const existingIndex = leads.findIndex(l => l.id === leadId);
  if (existingIndex >= 0) {
    const lead = leads[existingIndex];
    let newStatus = lead.status;
    if (outcome === "Deal Closed (Won)") {
      newStatus = "CLOSED";
    } else if (callbackTime) {
      newStatus = "FOLLOWUP_TODAY";
    } else {
      newStatus = "FOLLOWUP";
    }
    leads[existingIndex] = {
      ...lead,
      callCount: (lead.callCount || 0) + 1,
      status: newStatus,
      bhkType: bhkType || lead.bhkType,
      notes: notes || lead.notes,
      callbackTime: callbackTime || lead.callbackTime,
      history: [
        {
          date: "Just now",
          outcome: outcome,
          duration: duration,
          note: notes || `Outcome: ${outcome}`,
          recordingUrl: body.recordedAudioUrl || body.recordingUrl || body.recording_url || ""
        },
        ...(Array.isArray(lead.history) ? lead.history : [])
      ]
    };
    writeDb(leads);
  }
  res.json({ message: { status: "success", message: "Call logged successfully" } });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.delete_lead", (req, res) => {
  const body = req.body || {};
  const leadId = body.lead_id || body.leadId || req.query.lead_id;
  if (!leadId) {
    return res.status(400).json({ status: "error", message: "lead_id is required" });
  }
  let leads = readDb();
  leads = leads.filter(l => l.id !== leadId);
  writeDb(leads);
  res.json({ message: { status: "success", message: `Lead ${leadId} deleted successfully` } });
});

// Property & Focus Inventory 5-5 Preloaded Records
app.all("/api/method/real_estate_crm.real_estate_crm.api.get_inventory", (req, res) => {
  res.json({
    message: {
      status: "success",
      categories: {
        focusProjects: [
          {
            id: "PROP-001",
            title: "Kalpataru Vian",
            builder: "Kalpataru Group",
            location: "Andheri West, Mumbai",
            priceRange: "₹ 2.15 Cr - 3.80 Cr",
            tag: "High Demand",
            bhk: "2, 3 & 4 BHK",
            carpet: "780 - 1450 sq.ft",
            highlights: ["50+ Luxury Lifestyle Amenities", "Next to Metro Line 2A", "Possession Dec 2026"],
            img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "PROP-002",
            title: "Godrej Horizon",
            builder: "Godrej Properties",
            location: "Wadala, Mumbai",
            priceRange: "₹ 2.85 Cr - 4.90 Cr",
            tag: "Sea Facing",
            bhk: "2 & 3 BHK Sky Residences",
            carpet: "820 - 1380 sq.ft",
            highlights: ["Panoramic Eastern Bay Views", "5 Mins from Eastern Freeway", "Zero Stamp Duty Offer"],
            img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "PROP-003",
            title: "Oberoi Sky City",
            builder: "Oberoi Realty",
            location: "Borivali East, Mumbai",
            priceRange: "₹ 3.40 Cr - 6.20 Cr",
            tag: "Ready Soon",
            bhk: "3 & 4 BHK Luxury",
            carpet: "1050 - 1980 sq.ft",
            highlights: ["Integrated 25-Acre Township", "Adjoining Western Express Highway", "Clubhouse & Grand Sports Complex"],
            img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "PROP-004",
            title: "Lodha Woods",
            builder: "Lodha Group",
            location: "Kandivali East, Mumbai",
            priceRange: "₹ 1.95 Cr - 3.45 Cr",
            tag: "Nature Living",
            bhk: "2 & 3 BHK",
            carpet: "710 - 1190 sq.ft",
            highlights: ["Overlooking Sanjay Gandhi National Park", "Private Forest & Zen Gardens", "Modern ICSE School in Complex"],
            img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
          },
          {
            id: "PROP-005",
            title: "Piramal Mahalaxmi",
            builder: "Piramal Realty",
            location: "Mahalaxmi, South Mumbai",
            priceRange: "₹ 4.80 Cr - 11.50 Cr",
            tag: "Ultra Luxury",
            bhk: "3, 4 BHK & Penthouses",
            carpet: "1280 - 2800 sq.ft",
            highlights: ["Lifetime Views of Racecourse & Arabian Sea", "World-Class Infinity Pool on 50th Floor", "Direct Access to Coastal Road"],
            img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
          }
        ],
        documents: [
          { id: "DOC-001", name: "Kalpataru Vian RERA Verified Brochure", fileName: "Kalpataru_Vian_Brochure.pdf", fileType: "PDF", size: "4.2 MB", date: "24 Aug 2026", category: "Brochure / Layout" },
          { id: "DOC-002", name: "Godrej Horizon Cost Sheet & Payment Schedule", fileName: "Godrej_Horizon_Cost_Sheet.docx", fileType: "DOC", size: "1.8 MB", date: "22 Aug 2026", category: "Price Sheet & Costing" },
          { id: "DOC-003", name: "Oberoi Sky City RERA Title Clearance Legal Report", fileName: "Oberoi_Title_Clearance_Certificate.pdf", fileType: "PDF", size: "5.6 MB", date: "20 Aug 2026", category: "RERA Approval" },
          { id: "DOC-004", name: "Lodha Woods Unit Specification & Agreement Specimen", fileName: "Lodha_Woods_Agreement_Format.docx", fileType: "DOC", size: "2.4 MB", date: "18 Aug 2026", category: "RERA Approval" },
          { id: "DOC-005", name: "Piramal Mahalaxmi Penthouse Luxury Presentation", fileName: "Piramal_Mahalaxmi_Deck.pdf", fileType: "PDF", size: "8.1 MB", date: "15 Aug 2026", category: "Brochure / Layout" }
        ],
        unitPlans: [
          { project: "Kalpataru Vian (2 BHK Master Plan)", area: "780 sq.ft Carpet", planImg: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80" },
          { project: "Godrej Horizon (3 BHK Sea View Layout)", area: "1180 sq.ft Carpet", planImg: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=800&q=80" },
          { project: "Oberoi Sky City (3 BHK Premium Floor)", area: "1350 sq.ft Carpet", planImg: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80" },
          { project: "Lodha Woods (2 BHK Forest View)", area: "740 sq.ft Carpet", planImg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" },
          { project: "Piramal Mahalaxmi (4 BHK Sky Villa)", area: "2450 sq.ft Carpet", planImg: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80" }
        ],
        videos: [
          { title: "Kalpataru Vian 4K Drone Tour & Sample Flat", duration: "03:45", img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", url: "https://www.youtube.com/watch?v=kXYiU_JCYtU" },
          { title: "Godrej Horizon Eastern Bay Sunset View Walkthrough", duration: "04:10", img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", url: "https://www.youtube.com/watch?v=ysz5S6PUM-U" },
          { title: "Oberoi Sky City Clubhouse & Olympic Pool Virtual Tour", duration: "05:15", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", url: "https://www.youtube.com/watch?v=jNQXAC9IVRw" },
          { title: "Lodha Woods Forest Amenities Walkthrough", duration: "03:20", img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", url: "https://www.youtube.com/watch?v=kJQP7kiw5Fk" },
          { title: "Piramal Mahalaxmi Racecourse 360 Degree View Tour", duration: "06:00", img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ" }
        ],
        myListings: [
          { id: "LST-101", property: "3 BHK Kalpataru Vian", locality: "Andheri West", price: "₹ 2.95 Cr", owner: "Sanjay Singhania", status: "Verified" },
          { id: "LST-102", property: "2 BHK Godrej Horizon", locality: "Wadala", price: "₹ 2.60 Cr", owner: "Vikram Kapoor", status: "Verified" },
          { id: "LST-103", property: "4 BHK Oberoi Sky City", locality: "Borivali East", price: "₹ 5.40 Cr", owner: "Deepika Padukone", status: "Active" },
          { id: "LST-104", property: "2 BHK Lodha Woods", locality: "Kandivali East", price: "₹ 1.88 Cr", owner: "Anil Ambani", status: "Verified" },
          { id: "LST-105", property: "Penthouse Piramal Mahalaxmi", locality: "South Mumbai", price: "₹ 12.00 Cr", owner: "Harsh Goenka", status: "Exclusive" }
        ],
        employeeListings: [
          { id: "EMP-201", property: "2 BHK Sea Pearl Apartment", locality: "Bandra West", price: "₹ 3.10 Cr", agent: "Rahul Sharma (Sr. Telecaller)", status: "Active" },
          { id: "EMP-202", property: "3 BHK Oberoi Exquisite", locality: "Goregaon East", price: "₹ 4.25 Cr", agent: "Priya Sharma", status: "Under Offer" },
          { id: "EMP-203", property: "1 BHK Rustomjee Crown", locality: "Prabhadevi", price: "₹ 2.05 Cr", agent: "Rajesh Kumar", status: "Active" },
          { id: "EMP-204", property: "3 BHK Hiranandani Gardens", locality: "Powai", price: "₹ 3.75 Cr", agent: "Amit Patel", status: "Verified" },
          { id: "EMP-205", property: "4 BHK Lodha Bellissimo", locality: "Mahalaxmi", price: "₹ 8.50 Cr", agent: "Shyam Pandey", status: "Exclusive" }
        ],
        ownerLeads: [
          { id: "OWN-301", name: "Sunil Gavaskar", property: "3 BHK Penthouse in Pali Hill", locality: "Bandra West", phone: "+91 98200 11223" },
          { id: "OWN-302", name: "Kareena Kapoor", property: "4 BHK Luxury Residence", locality: "Khar West", phone: "+91 98211 44556" },
          { id: "OWN-303", name: "Mukesh Bansal", property: "Commercial Floor Plate 5000 sqft", locality: "BKC", phone: "+91 98222 77889" },
          { id: "OWN-304", name: "Ratan Tata Estate", property: "Sea Facing Bungalow Parcel", locality: "Colaba", phone: "+91 98233 99001" },
          { id: "OWN-305", name: "Anand Mahindra", property: "2 BHK Lake View Apartment", locality: "Powai", phone: "+91 98244 55667" }
        ],
        cpListings: [
          { id: "CP-401", broker: "Knight Frank Channel Partners", property: "Kalpataru Vian 3 BHK", locality: "Andheri West", commission: "2.5% Direct Brokerage" },
          { id: "CP-402", broker: "JLL Mumbai Associates", property: "Godrej Horizon Towers", locality: "Wadala", commission: "3.0% Spot Payout" },
          { id: "CP-403", broker: "CBRE Channel Network", property: "Oberoi Sky City Phase 2", locality: "Borivali East", commission: "2.0% + Bonus Token" },
          { id: "CP-404", broker: "Square Yards Wealth", property: "Lodha Woods Forest Facing", locality: "Kandivali East", commission: "2.5% Fast Payout" },
          { id: "CP-405", broker: "PropTiger Elite Partners", property: "Piramal Mahalaxmi South Wing", locality: "Mahalaxmi", commission: "3.5% Super Incentive" }
        ]
      }
    }
  });
});

// Activity & Schedules 5-5 Preloaded Records
app.all("/api/method/real_estate_crm.real_estate_crm.api.get_activities", (req, res) => {
  res.json({
    message: {
      status: "success",
      categories: {
        myVisits: [
          { id: "VISIT-101", title: "Site Visit: Kalpataru Vian", client: "Priyanka Iyer", phone: "+91 98450 77123", date: "Today, 4:00 PM", status: "Confirmed", location: "Andheri West" },
          { id: "VISIT-102", title: "Site Visit: Godrej Horizon", client: "Aarav Sharma", phone: "+91 98205 91823", date: "Tomorrow, 11:30 AM", status: "Scheduled", location: "Wadala" },
          { id: "VISIT-103", title: "Site Visit: Oberoi Sky City", client: "Meera Patel", phone: "+91 98921 00987", date: "Tomorrow, 2:30 PM", status: "Confirmed", location: "Borivali East" },
          { id: "VISIT-104", title: "Site Visit: Lodha Woods", client: "Rohan Varma", phone: "+91 98210 99887", date: "28 Aug, 10:00 AM", status: "Pending Cab", location: "Kandivali East" },
          { id: "VISIT-105", title: "Site Visit: Piramal Mahalaxmi", client: "Kavita Deshmukh", phone: "+91 98333 44556", date: "29 Aug, 4:30 PM", status: "Confirmed", location: "South Mumbai" }
        ],
        qualifiedLeads: [
          { id: "SQL-01", name: "Rajesh Kumar (Andheri)", score: "96% Hot Match", budget: "₹ 2.80 Cr", interest: "Kalpataru Vian 3BHK", time: "10 mins ago" },
          { id: "SQL-02", name: "Deepak Reddy (BKC)", score: "94% High Intent", budget: "₹ 4.50 Cr", interest: "Godrej Horizon Bay View", time: "35 mins ago" },
          { id: "SQL-03", name: "Ananya Panday (Bandra)", score: "91% Hot Match", budget: "₹ 6.20 Cr", interest: "Oberoi Sky City 4BHK", time: "1 hour ago" },
          { id: "SQL-04", name: "Kiran Bhat (Thane)", score: "89% Pre-Approved Loan", budget: "₹ 1.90 Cr", interest: "Lodha Woods 2BHK", time: "2 hours ago" },
          { id: "SQL-05", name: "Siddharth Malhotra (Worli)", score: "98% Token Ready", budget: "₹ 9.50 Cr", interest: "Piramal Mahalaxmi Penthouse", time: "Today, 10:30 AM" }
        ],
        claimedLeads: [
          { id: "CLM-01", name: "Siddharth Malhotra", points: "50 Pts Used", source: "Facebook Luxury Ad", timeAgo: "Today, 9:15 AM" },
          { id: "CLM-02", name: "Kiran Bhat (Thane)", points: "50 Pts Used", source: "Google Inbound Search", timeAgo: "Today, 10:40 AM" },
          { id: "CLM-03", name: "Ananya Panday", points: "50 Pts Used", source: "Instagram Video Campaign", timeAgo: "Yesterday, 4:10 PM" },
          { id: "CLM-04", name: "Rohan Varma", points: "50 Pts Used", source: "Website Contact Form", timeAgo: "Yesterday, 6:30 PM" },
          { id: "CLM-05", name: "Priyanka Iyer", points: "50 Pts Used", source: "MagicBricks Verified Lead", timeAgo: "2 days ago" }
        ],
        siteVisits: [
          { id: "SCH-01", project: "Kalpataru Vian, Andheri", client: "Priyanka Iyer", slot: "Today, 4:00 PM - 5:00 PM", cab: "Driver Assigned (MH-02-BZ-4412)" },
          { id: "SCH-02", project: "Godrej Horizon, Wadala", client: "Aarav Sharma", slot: "Tomorrow, 11:30 AM - 12:30 PM", cab: "AC Sedan Cab Confirmed" },
          { id: "SCH-03", project: "Oberoi Sky City, Borivali", client: "Meera Patel", slot: "Tomorrow, 2:30 PM - 3:30 PM", cab: "Self Drive with Sales Rep" },
          { id: "SCH-04", project: "Lodha Woods, Kandivali", client: "Rohan Varma", slot: "28 Aug, 10:00 AM - 11:00 AM", cab: "Cab Logistics Pending" },
          { id: "SCH-05", project: "Piramal Mahalaxmi, South Mumbai", client: "Kavita Deshmukh", slot: "29 Aug, 4:30 PM - 5:30 PM", cab: "VIP Chauffeur Pickup (MH-01-DK-9000)" }
        ],
        meetings: [
          { id: "MTG-01", client: "Rajesh Kumar", venue: "Corporate Sales Lounge, BKC", agenda: "Final Price Negotiation & Token Booking", time: "Tomorrow, 3:00 PM" },
          { id: "MTG-02", client: "Deepak Reddy", venue: "Godrej Wadala Site Office", agenda: "Floor Layout Customization & Parking Allotment", time: "28 Aug, 11:00 AM" },
          { id: "MTG-03", client: "Ananya Panday", venue: "Oberoi Realty Head Office, Goregaon", agenda: "High-Floor Unit Selection & Payment Schedule", time: "29 Aug, 1:30 PM" },
          { id: "MTG-04", client: "Siddharth Malhotra", venue: "Piramal Mahalaxmi Sky Lounge", agenda: "Penthouse Expression of Interest (EOI) Signing", time: "30 Aug, 5:00 PM" },
          { id: "MTG-05", client: "Kiran Bhat", venue: "Lodha Woods Sales Gallery", agenda: "Bank Home Loan Approval & Down Payment Discussion", time: "31 Aug, 12:00 PM" }
        ],
        videoCalls: [
          { id: "VID-01", project: "Kalpataru Vian 3D Virtual Tour", client: "Aarav Sharma", platform: "Zoom HD Tour", time: "Today, 6:00 PM", link: "https://zoom.us/j/9820591823" },
          { id: "VID-02", project: "Godrej Horizon Sea View Walkthrough", client: "Neha Verma", platform: "Google Meet Tour", time: "Tomorrow, 4:30 PM", link: "https://meet.google.com/abc-defg-hij" },
          { id: "VID-03", project: "Oberoi Sky City Clubhouse & Drone 4K", client: "Vikram Roy", platform: "Zoom Virtual Session", time: "28 Aug, 7:00 PM", link: "https://zoom.us/j/9820591824" },
          { id: "VID-04", project: "Lodha Woods Forest Residences Tour", client: "Meera Patel", platform: "Microsoft Teams Tour", time: "29 Aug, 3:00 PM", link: "https://teams.microsoft.com/l/meetup-join" },
          { id: "VID-05", project: "Piramal Mahalaxmi 360 Arabian Sea Tour", client: "Kavita Deshmukh", platform: "Zoom VIP Private Room", time: "30 Aug, 6:30 PM", link: "https://zoom.us/j/9820591825" }
        ],
        teamMembers: [
          { name: "Rahul Sharma", role: "Sr. Telecaller", calls: 52, visits: 8, score: "96%" },
          { name: "Priya Sharma", role: "Direct Sales Specialist", calls: 46, visits: 7, score: "93%" },
          { name: "Rajesh Kumar", role: "Mining & Cold Calling Expert", calls: 41, visits: 5, score: "89%" },
          { name: "Amit Patel", role: "Telecaller", calls: 35, visits: 4, score: "85%" },
          { name: "Shyam Pandey", role: "Senior Sales Consultant", calls: 64, visits: 11, score: "99%" }
        ],
        threeMinCalls: [
          { id: "CALL-301", client: "Rajesh Kumar", duration: "04:12 mins", topic: "Kalpataru Vian 3BHK Payment Schedule Discussion", qualityScore: "9.5/10 Pitch Score" },
          { id: "CALL-302", client: "Priyanka Iyer", duration: "03:45 mins", topic: "Godrej Horizon Site Visit Confirmation & Cab Pickup", qualityScore: "9.2/10 Pitch Score" },
          { id: "CALL-303", client: "Deepak Reddy", duration: "05:20 mins", topic: "Oberoi Sky City Car Parking & Possession Date", qualityScore: "9.8/10 Pitch Score" },
          { id: "CALL-304", client: "Ananya Panday", duration: "03:50 mins", topic: "Piramal Mahalaxmi Racecourse View Unit Selection", qualityScore: "9.4/10 Pitch Score" },
          { id: "CALL-305", client: "Kiran Bhat", duration: "04:05 mins", topic: "Lodha Woods SBI Bank Home Loan Subvention Scheme", qualityScore: "9.1/10 Pitch Score" }
        ]
      }
    }
  });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.get_dashboard_metrics", (req, res) => {
  const leads = readDb();
  const total = leads.length;
  const connected = leads.filter(l => l.callCount > 0).length;
  const followup = leads.filter(l => l.status === "FOLLOWUP_TODAY" || l.status === "FOLLOWUP").length;
  const closed = leads.filter(l => l.status === "CLOSED").length;
  res.json({
    message: {
      status: "success",
      data: {
        totalLeads: total,
        connectedCalls: connected,
        followupCount: followup,
        closedDeals: closed,
        totalSiteVisits: 14,
        rewardPoints: 2400
      }
    }
  });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.get_org_profile", (req, res) => {
  res.json({
    message: {
      status: "success",
      data: {
        company_name: "Dream Homes Real Estate",
        brand_color: "#2563eb",
        logo_url: "",
        currency: "INR"
      }
    }
  });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.get_users", (req, res) => {
  res.json({
    message: {
      status: "success",
      data: [
        { email: "shyampandey1104@gmail.com", full_name: "Shyamkumar Pandey", role: "Sales Consultant" }
      ]
    }
  });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.get_notifications", (req, res) => {
  res.json({
    message: {
      status: "success",
      data: []
    }
  });
});

app.all("/api/method/real_estate_crm.real_estate_crm.api.login_user", (req, res) => {
  const { email, role } = req.body || {};
  res.json({
    message: {
      status: "success",
      user: {
        email: email || "shyampandey1104@gmail.com",
        full_name: "Shyamkumar Pandey",
        role: role || "Telecaller"
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Dream Homes Permanent Cloud Backend running on port ${PORT}`);
});
