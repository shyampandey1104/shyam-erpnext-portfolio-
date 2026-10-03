import frappe

def seed():
    # 1. Leads
    leads = [
        {"name": "Vikram Malhotra", "phone": "+91 98205 91823", "email": "vikram.m@gmail.com", "priority": "HOT", "status": "NEW", "bhk_type": "3 BHK", "location": "Bandra West, Mumbai", "source": "Direct Inbound Call", "notes": "Interested in 3 BHK Sea-facing in Bandra under 4.5 Cr."},
        {"name": "Pooja Sharma", "phone": "+91 98190 22334", "email": "pooja.s@gmail.com", "priority": "HOT", "status": "NEW", "bhk_type": "2 BHK", "location": "Andheri West, Mumbai", "source": "Website Inbound", "notes": "Looking for ready possession 2 BHK near Metro station."},
        {"name": "Aarav Sharma", "phone": "+91 98765 43210", "email": "aarav.sharma@gmail.com", "priority": "WARM", "status": "FOLLOWUP_TODAY", "bhk_type": "2 BHK", "location": "Lokhandwala, Andheri", "source": "Instagram Ad", "notes": "Budget 1.8 Cr. Site visit scheduled for Purva Estrella."},
        {"name": "Meera Patel", "phone": "+91 98921 00987", "email": "meera.p@gmail.com", "priority": "HOT", "status": "FOLLOWUP_TODAY", "bhk_type": "3 BHK Luxury", "location": "Wadala, Mumbai", "source": "Facebook Lead Gen", "notes": "Interested in Godrej Horizon Wadala."},
        {"name": "Rajesh Gupta", "phone": "+91 98201 55667", "email": "rajesh.gupta@gmail.com", "priority": "COLD", "status": "NEW", "bhk_type": "1 BHK", "location": "Borivali East", "source": "99acres", "notes": "Investment buyer looking for pre-launch discounts."}
    ]
    for l in leads:
        if not frappe.db.exists("Real Estate Lead", {"phone": l["phone"]}):
            doc = frappe.new_doc("Real Estate Lead")
            doc.lead_name = l["name"]
            doc.phone = l["phone"]
            doc.email = l["email"]
            doc.priority = l["priority"]
            doc.status = l["status"]
            doc.bhk_type = l["bhk_type"]
            doc.location = l["location"]
            doc.source = l["source"]
            doc.notes = l["notes"]
            doc.insert(ignore_permissions=True)

    # 2. Focus Projects
    projects = [
        {
            "title": "Srishti Oasis",
            "builder": "Srishti Group",
            "location": "Bhandup West, Mumbai (Direct GMLR Access)",
            "price_range": "₹ 1.08 Cr - ₹ 2.26 Cr (All Inclusive)",
            "bhk": "1, 2 & 3 BHK Sun-Deck Residences",
            "carpet": "425 - 910 sq.ft.",
            "tag": "Direct GMLR Access",
            "img": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "video_url": "https://youtube.com/watch?v=srishti_oasis_tour",
            "brochure_file": "Srishti_Oasis_Brochure.pdf",
            "highlights": "Mumbai 1st project with direct GMLR access, 36-Storey tower, 50+ Amenities, 12 Months Holiday EMI (MahaRERA: P51800051004)"
        },
        {
            "title": "Oberoi Sky City",
            "builder": "Oberoi Realty",
            "location": "Borivali East, Western Express Highway",
            "price_range": "₹ 2.45 Cr - ₹ 5.80 Cr",
            "bhk": "2, 3 & 4 BHK Luxury Residences",
            "carpet": "850 - 1750 sq.ft.",
            "tag": "Metro Connectivity",
            "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            "video_url": "https://youtube.com/watch?v=oberoi_sky_city",
            "brochure_file": "Oberoi_SkyCity_Brochure.pdf",
            "highlights": "Direct WEH access, Grand 50,000 sq.ft Clubhouse, Private Theatre, Olympic Size Pool"
        },
        {
            "title": "Godrej Horizon",
            "builder": "Godrej Properties",
            "location": "Wadala, South Central Mumbai",
            "price_range": "₹ 2.85 Cr - ₹ 4.20 Cr",
            "bhk": "2 & 3 BHK Sky Condos",
            "carpet": "750 - 1250 sq.ft.",
            "tag": "Sky Lounge & Deck",
            "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "video_url": "https://youtube.com/watch?v=godrej_horizon",
            "brochure_file": "Godrej_Horizon_Brochure.pdf",
            "highlights": "5-tier security, 0.5 km from Monorail, 10 mins to BKC via connector"
        }
    ]
    for p in projects:
        if not frappe.db.exists("Focus Project", p["title"]):
            doc = frappe.new_doc("Focus Project")
            for k, v in p.items():
                setattr(doc, k, v)
            doc.insert(ignore_permissions=True)

    # 3. Activity Schedules
    activities = [
        {
            "title": "Site Visit: Kalpataru Vian",
            "client_name": "Priyanka Iyer",
            "client_phone": "+91 98450 77123",
            "activity_type": "Site Visit",
            "status": "Confirmed",
            "location": "Andheri West",
            "schedule_time": "Today, 4:00 PM",
            "notes": "Family visit confirmed with sample flat walkthrough."
        },
        {
            "title": "Site Visit: Purva Estrella",
            "client_name": "Aarav Sharma",
            "client_phone": "+91 98205 91823",
            "activity_type": "Site Visit",
            "status": "Scheduled",
            "location": "Lokhandwala",
            "schedule_time": "Tomorrow, 11:30 AM",
            "notes": "2 BHK budget 1.8 Cr discussion."
        },
        {
            "title": "Site Visit: Godrej Horizon",
            "client_name": "Meera Patel",
            "client_phone": "+91 98921 00987",
            "activity_type": "Site Visit",
            "status": "Pending",
            "location": "Wadala",
            "schedule_time": "14 Aug, 2:30 PM",
            "notes": "Re-confirm timing on morning call."
        }
    ]
    for a in activities:
        if not frappe.db.exists("Activity Schedule", {"title": a["title"]}):
            doc = frappe.new_doc("Activity Schedule")
            for k, v in a.items():
                setattr(doc, k, v)
            doc.insert(ignore_permissions=True)

    frappe.db.commit()
    return "All real estate data successfully seeded into Frappe MariaDB!"
