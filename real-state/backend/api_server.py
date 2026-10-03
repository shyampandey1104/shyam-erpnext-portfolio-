"""
Standalone Microservice for Social Media (Facebook/Instagram/Website) Webhooks & Inbound Call Integration
"""

import http.server
import socketserver
import json

PORT = 8080

class WebhookHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
            print("Received Lead Webhook Payload:", payload)
            
            # Response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {"status": "success", "message": "Lead ingested successfully"}
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == "__main__":
    print(f"🚀 Real Estate Webhook & Inbound Call Server running on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), WebhookHandler) as httpd:
        httpd.serve_forever()
