import frappe

def delete_branches():
    branches_to_delete = ["Dewas", "Indore"]
    for branch in branches_to_delete:
        if frappe.db.exists("Branches", branch):
            print(f"Deleting {branch}...")
            # Using delete_doc(doctype, name, ignore_permissions=True, force=True) 
            # to handle potential links if 'force' is needed, but let's try standard first with ignore_missing
            try:
                frappe.delete_doc("Branches", branch, ignore_missing=True)
                frappe.db.commit()
                print(f"Successfully deleted {branch}")
            except Exception as e:
                print(f"Error deleting {branch}: {str(e)}")
        else:
            print(f"Branch {branch} does not exist.")

delete_branches()
