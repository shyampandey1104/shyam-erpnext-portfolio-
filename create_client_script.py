import frappe

script_code = """frappe.ui.form.on("Woman Registration Form", {
    woman_profile_id: function (frm) {
        if (frm.doc.woman_profile_id) {
            frappe.db.get_value(
                "Woman Profile",
                frm.doc.woman_profile_id,
                "branch_id",
                function (data) {
                    if (data && data.branch_id) {
                        frm.set_value("branch_id", data.branch_id);
                        frappe.show_alert({
                            message: __("Branch auto-selected: ") + data.branch_id,
                            indicator: "green"
                        }, 3);
                    }
                }
            );
        } else {
            frm.set_value("branch_id", null);
        }
    }
});"""

# Check if script already exists
existing = frappe.db.exists("Client Script", {"dt": "Woman Registration Form"})

if existing:
    doc = frappe.get_doc("Client Script", existing)
    doc.script = script_code
    doc.enabled = 1
    doc.save()
    print("Updated existing Client Script:", doc.name)
else:
    doc = frappe.new_doc("Client Script")
    doc.dt = "Woman Registration Form"
    doc.script_type = "Client"
    doc.enabled = 1
    doc.script = script_code
    doc.insert()
    print("Created new Client Script:", doc.name)

frappe.db.commit()
print("Done!")
