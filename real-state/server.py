# -*- coding: utf-8 -*-
"""
Standalone Real Estate Telecaller CRM Backend Server
Port: 5000 (http://localhost:5000)
Location: /Users/shyamkumarpandey/samwadini/real-state/server.py
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import urllib.parse

DB_FILE = os.path.join(os.path.dirname(__file__), "real_estate_db.json")

def load_db():
    if not os.path.exists(DB_FILE):
        initial_data = {
            "users": [
                {"id": 1, "name": "Rahul Sharma", "email": "rahul.sharma@leadcallcrm.in", "phone": "+91 98200 44556", "role": "Telecaller", "status": "Active", "areas": ["Andheri", "Bandra"], "leadCap": 50, "initials": "RS"},
                {"id": 2, "name": "Rajesh Kumar", "email": "rajesh@saarva.com", "phone": "+91 98201 11223", "role": "Telecaller", "status": "Active", "areas": ["Andheri", "Bandra"], "leadCap": 50, "initials": "RK"},
                {"id": 3, "name": "Priya Sharma", "email": "priya@saarva.com", "phone": "+91 98920 33445", "role": "Telecaller", "status": "Active", "areas": ["Powai", "Thane"], "leadCap": 45, "initials": "PS"},
                {"id": 4, "name": "Amit Patel", "email": "amit@saarva.com", "phone": "+91 98111 22334", "role": "Mining Caller", "status": "Active", "areas": ["Navi Mumbai"], "leadCap": 30, "initials": "AP"},
                {"id": 5, "name": "Ibrahim", "email": "ibrahim@leadcallcrm.in", "phone": "+91 98900 11223", "role": "Sales Manager", "status": "Active", "areas": ["All"], "leadCap": 200, "initials": "IB"}
            ],
            "leads": [
                {
                    "id": "LEAD-0007",
                    "name": "Rajesh Kumar",
                    "phone": "+91 98201 44521",
                    "email": "rajesh.k@gmail.com",
                    "priority": "HOT",
                    "status": "NEW",
                    "service": "Home Buying",
                    "bhkType": "3 BHK",
                    "location": "Andheri",
                    "source": "Google Ads",
                    "timeAgo": "38 minutes ago",
                    "callCount": 0,
                    "notes": "Interested in 3BHK flat purchase in Andheri West.",
                    "history": []
                },
                {
                    "id": "LEAD-0033",
                    "name": "Kiran Bhat",
                    "phone": "+91 98700 12345",
                    "email": "kiran.bhat@yahoo.com",
                    "priority": "HOT",
                    "status": "NEW",
                    "service": "Site Visit Booking",
                    "bhkType": "2 BHK",
                    "location": "Navi Mumbai",
                    "source": "Google Ads",
                    "timeAgo": "about 3 hours ago",
                    "callCount": 0,
                    "notes": "Looking for site visit for 2BHK flat.",
                    "history": []
                }
            ],
            "call_logs": [],
            "builder_projects": [
                {"id": 1, "builder": "Lodha Group", "projectName": "Lodha Woods", "location": "Kandivali East", "bhk": "3 BHK", "carpetArea": "1,150 sq ft", "launchPrice": "₹ 2.15 Cr", "discountOffer": "5% Festive Off", "bookingToken": "₹ 2.00 Lakh"},
                {"id": 2, "builder": "Godrej Properties", "projectName": "Godrej Emerald", "location": "Thane West", "bhk": "2 BHK", "carpetArea": "780 sq ft", "launchPrice": "₹ 1.28 Cr", "discountOffer": "Spot Discount ₹ 3.5 Lakhs", "bookingToken": "₹ 1.00 Lakh"}
            ]
        }
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2)
        return initial_data

    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

class StandaloneCRMHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        db = load_db()
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/leads":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(db["leads"]).encode("utf-8"))

        elif path == "/api/users":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(db["users"]).encode("utf-8"))

        elif path == "/api/builder-projects":
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(db["builder_projects"]).encode("utf-8"))

        else:
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "service": "LeadCall Real Estate CRM Backend"}).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        payload = json.loads(body) if body else {}

        db = load_db()
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        if path == "/api/register-user":
            user_data = payload.get("user_data", payload)
            db["users"].append(user_data)
            save_db(db)
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "User registered in CRM Database", "user": user_data}).encode("utf-8"))

        elif path == "/api/log-call":
            lead_id = payload.get("lead_id")
            for lead in db["leads"]:
                if lead["id"] == lead_id:
                    lead["callCount"] = (lead.get("callCount", 0)) + 1
                    if payload.get("bhk_type"):
                        lead["bhkType"] = payload["bhk_type"]
                    if payload.get("notes"):
                        lead["notes"] = payload["notes"]
                    if payload.get("outcome") == "Deal Closed (Won)":
                        lead["status"] = "CLOSED"
                    elif payload.get("followup_date"):
                        lead["status"] = "FOLLOWUP_TODAY"
                        lead["callbackTime"] = payload["followup_date"]
                    else:
                        lead["status"] = "FOLLOWUP"
            db["call_logs"].append(payload)
            save_db(db)
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Call logged in CRM Database"}).encode("utf-8"))

        elif path == "/api/save-lead":
            lead_data = payload.get("lead_data", payload)
            db["leads"].insert(0, lead_data)
            save_db(db)
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Lead saved in CRM Database"}).encode("utf-8"))

        else:
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": "Action processed"}).encode("utf-8"))

def run_standalone_server(port=5000):
    server_address = ("", port)
    httpd = HTTPServer(server_address, StandaloneCRMHandler)
    print(f"🚀 Standalone Real Estate CRM Backend Server running at http://localhost:{port}/")
    httpd.serve_forever()

if __name__ == "__main__":
    run_standalone_server()
