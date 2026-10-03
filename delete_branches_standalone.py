import frappe
import os
import sys

# Change directory to bench to ensure paths are correct
bench_path = "/home/frappe/frappe-bench"
os.chdir(bench_path)
sys.path.append(os.path.join(bench_path, "apps/frappe"))
sys.path.append(os.path.join(bench_path, "apps/erpnext")) # Just in case

import frappe
from frappe.model.delete_doc import get_linked_docs

# Initialize frappe
frappe.init(site="aas.com")
frappe.connect()

def cleanup_and_delete_branches():
    branches_to_delete = ['Dewas', 'Indore']
    for branch_name in branches_to_delete:
        if not frappe.db.exists('Branches', branch_name):
            print(f'Branch {branch_name} does not exist.')
            continue
            
        print(f'Processing {branch_name}...')
        
        # Find linked documents
        links = get_linked_docs('Branches', branch_name)
        if links:
            print(f'Found links for {branch_name}:')
            for dt, docs in links.items():
                print(f'  {dt}: {docs}')
                for docname in docs:
                    try:
                        meta = frappe.get_meta(dt)
                        link_fields = [f.fieldname for f in meta.fields if f.fieldtype == 'Link' and f.options == 'Branches']
                        
                        doc = frappe.get_doc(dt, docname)
                        for field in link_fields:
                            if doc.get(field) == branch_name:
                                doc.set(field, None)
                        doc.save(ignore_permissions=True)
                        print(f'    Unhooked {branch_name} from {dt} {docname}')
                    except Exception as ex:
                        print(f'    Failed to unhook from {dt} {docname}: {str(ex)}')

        # Now delete
        try:
            frappe.delete_doc('Branches', branch_name, ignore_missing=True, force=True)
            frappe.db.commit()
            print(f'Successfully deleted {branch_name}')
        except Exception as e:
            print(f'Error deleting {branch_name}: {str(e)}')

cleanup_and_delete_branches()
frappe.destroy()
