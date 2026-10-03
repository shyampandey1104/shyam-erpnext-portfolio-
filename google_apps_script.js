/**
 * Google Apps Script for Shyamkumar Pandey's Portfolio Inquiry Form
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/144He4oNIEhtL8_Yj7y4d2TNy_vw5qms5bAS_NLdx9p0/edit
 * Target Email: shyampandey1104@gmail.com
 * 
 * FEATURES:
 * 1. Appends all inquiries to your Google Sheet with Email & Phone.
 * 2. Sends instant Admin Email Notification to shyampandey1104@gmail.com with 1-click WhatsApp chat link.
 * 3. Sends instant Automated Confirmation Email to the Client / Lead acknowledging their demo request!
 * 
 * STEPS TO UPDATE IN GOOGLE APPS SCRIPT:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/144He4oNIEhtL8_Yj7y4d2TNy_vw5qms5bAS_NLdx9p0/edit
 * 2. In the Google Sheet top menu, click: Extensions -> Apps Script
 * 3. Replace all existing code with this updated script.
 * 4. Click the "Save" icon.
 * 5. Click "Deploy" -> "Manage deployments" -> Click the Edit (Pencil) icon -> Choose Version: "New version" -> Click "Deploy".
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();

    // Ensure Header Row exists if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Phone / WhatsApp", "Email", "Solution Needed", "Timeline", "Workflow Details"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#FF2E93").setFontColor("#FFFFFF");
    }

    var timestamp = (e && e.parameter && e.parameter.Timestamp) ? e.parameter.Timestamp : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    var name = (e && e.parameter && e.parameter.Name) ? e.parameter.Name : "Valued Client";
    var phone = (e && e.parameter && e.parameter.Phone) ? e.parameter.Phone : "N/A";
    var email = (e && e.parameter && e.parameter.Email && e.parameter.Email !== "Not provided") ? e.parameter.Email.trim() : "";
    var solution = (e && e.parameter && e.parameter.Solution) ? e.parameter.Solution : "Custom ERP / Workflow";
    var timeline = (e && e.parameter && e.parameter.Timeline) ? e.parameter.Timeline : "Immediate";
    var workflow = (e && e.parameter && e.parameter.Workflow) ? e.parameter.Workflow : "Not specified";

    // 1. Append new row to Google Sheet
    sheet.appendRow([timestamp, name, phone, email || "N/A", solution, timeline, workflow]);

    // 2. Send instant Admin Email Notification to shyampandey1104@gmail.com
    var adminRecipient = "shyampandey1104@gmail.com";
    var adminSubject = "🚀 New ERP Demo Lead: " + name + " (" + solution + ")";
    var adminBody = 
      "You received a new demo / inquiry from your portfolio website!\n\n" +
      "-------------------------------------------\n" +
      "👤 Name: " + name + "\n" +
      "📞 Phone / WhatsApp: " + phone + "\n" +
      "📧 Email: " + (email || "Not provided") + "\n" +
      "⚙️ Solution Needed: " + solution + "\n" +
      "⏱️ Timeline: " + timeline + "\n" +
      "📝 Workflow / Details: " + workflow + "\n" +
      "📅 Time: " + timestamp + "\n" +
      "-------------------------------------------\n\n" +
      "👉 Click to Chat on WhatsApp: https://wa.me/" + phone.replace(/[^0-9]/g, '') + "\n" +
      "👉 Google Sheet: https://docs.google.com/spreadsheets/d/144He4oNIEhtL8_Yj7y4d2TNy_vw5qms5bAS_NLdx9p0/edit";

    MailApp.sendEmail(adminRecipient, adminSubject, adminBody);

    // 3. Send instant Automated Confirmation Email to the Client (if valid email provided)
    if (email && email.indexOf("@") !== -1) {
      var clientSubject = "✨ Demo Request Confirmed: " + solution + " – Shyamkumar Pandey";
      var clientHtmlBody = 
        "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #1e1e2f; max-width: 600px; margin: 0 auto; border: 2px solid #1e1e2f; border-radius: 16px; overflow: hidden; box-shadow: 6px 6px 0px #7C3AED;'>" +
          "<div style='background: linear-gradient(135deg, #FF2E93, #7C3AED); padding: 24px; color: #ffffff; text-align: center;'>" +
            "<h2 style='margin: 0; font-size: 22px;'>Thank You for Reaching Out, " + name.split(' ')[0] + "! 🚀</h2>" +
            "<p style='margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;'>Senior ERPNext Developer & Team Lead • Mumbai, India</p>" +
          "</div>" +
          "<div style='padding: 24px; background: #ffffff;'>" +
            "<p style='font-size: 15px;'>Hi <b>" + name + "</b>,</p>" +
            "<p style='font-size: 14px;'>I have received your request for <b>" + solution + "</b>.</p>" +
            "<div style='background: #FFF8EC; border-left: 4px solid #FFC700; padding: 14px; border-radius: 8px; margin: 18px 0;'>" +
              "<p style='margin: 0; font-size: 13px; font-weight: bold; color: #1e1e2f;'>📋 Request Summary:</p>" +
              "<ul style='margin: 6px 0 0 0; padding-left: 18px; font-size: 13px; color: #444;'>" +
                "<li><b>Solution:</b> " + solution + "</li>" +
                "<li><b>Timeline:</b> " + timeline + "</li>" +
                "<li><b>Contact:</b> " + phone + "</li>" +
              "</ul>" +
            "</div>" +
            "<p style='font-size: 14px;'>I am reviewing your details and will get in touch with you shortly to schedule our <b>15-minute live walkthrough</b>.</p>" +
            "<div style='text-align: center; margin: 24px 0;'>" +
              "<a href='https://wa.me/919867778229?text=" + encodeURIComponent("Hi Shyam, I just submitted a demo request for " + solution) + "' style='background: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 14px; border: 2px solid #1e1e2f;'>💬 Chat on WhatsApp Now (+91 98677 78229)</a>" +
            "</div>" +
            "<hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'/>" +
            "<p style='font-size: 12px; color: #666; margin: 0;'><b>Best regards,</b><br/>" +
            "<b>Shyamkumar Bhupendra Pandey</b><br/>" +
            "Senior ERPNext Developer • Python Specialist & Team Lead<br/>" +
            "📧 <a href='mailto:shyampandey1104@gmail.com' style='color: #7C3AED;'>shyampandey1104@gmail.com</a> | 📱 +91 98677 78229<br/>" +
            "🔗 <a href='https://linkedin.com/in/shyamkumarpandey' style='color: #0A66C2;'>linkedin.com/in/shyamkumarpandey</a></p>" +
          "</div>" +
        "</div>";

      MailApp.sendEmail({
        to: email,
        subject: clientSubject,
        htmlBody: clientHtmlBody
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("ERP Lead Webhook & Auto-Responder is active and running!");
}
