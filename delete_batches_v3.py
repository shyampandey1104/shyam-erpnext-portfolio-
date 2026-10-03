import frappe
from frappe.model.delete_doc import get_linked_docs

def cleanup_and_delete_batches():
    batches_to_delete = ['Afternnoon-Batch', 'Afternoon-Batch', 'Morning-Batch']
    for batch_name in batches_to_delete:
        if not frappe.db.exists('Batches', batch_name):
            print(f'Batch {batch_name} does not exist.')
            continue
            
        print(f'Processing {batch_name}...')
        
        # 1. Unhook all links
        links = get_linked_docs('Batches', batch_name)
        if links:
            print(f'Found links for {batch_name}:')
            for dt, docs in links.items():
                print(f'  Unhooking from {dt}...')
                for docname in docs:
                    try:
                        # Skip if it's the document itself (shouldn't happen in linked_docs for other types)
                        if dt == 'Batches' and docname == batch_name:
                            continue
                            
                        meta = frappe.get_meta(dt)
                        link_fields = [f.fieldname for f in meta.fields if f.fieldtype == 'Link' and f.options == 'Batches']
                        
                        doc = frappe.get_doc(dt, docname)
                        modified = False
                        for field in link_fields:
                            if doc.get(field) == batch_name:
                                doc.set(field, None)
                                modified = True
                        
                        if modified:
                            # Use db_set to avoid validation/cancellation loops if possible
                            # or just save with ignore_permissions and ignore_version
                            doc.save(ignore_permissions=True, ignore_version=True)
                            print(f'    Unhooked {batch_name} from {dt} {docname}')
                    except Exception as ex:
                        print(f'    Failed to unhook from {dt} {docname}: {str(ex)}')

        # 2. Cancel and Delete
        try:
            doc = frappe.get_doc('Batches', batch_name)
            if doc.docstatus == 1: # Submitted
                print(f'  Cancelling {batch_name}...')
                doc.cancel()
            
            print(f'  Deleting {batch_name}...')
            frappe.delete_doc('Batches', batch_name, ignore_missing=True, force=True)
            frappe.db.commit()
            print(f'Successfully deleted {batch_name}')
        except Exception as e:
            print(f'Error deleting {batch_name}: {str(e)}')
            frappe.db.rollback()

cleanup_and_delete_batches()
