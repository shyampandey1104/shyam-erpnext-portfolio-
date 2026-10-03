// Copyright (c) 2025, samwadini and contributors
// For license information, please see license.txt

frappe.ui.form.on("Student Outreach", {
    onload: function(frm) {
        // Set dynamic query filters for batch based on branch_id and program_id
        frm.set_query('batch', function() {
            let filters = {};
            if (frm.doc.branch_id) {
                filters['branch_id'] = frm.doc.branch_id;
            }
            if (frm.doc.program_id) {
                filters['program_id'] = frm.doc.program_id;
            }
            filters['is_active'] = 1;
            return {
                filters: filters
            };
        });
    },

    refresh(frm) {
        // Hide child tables if new
        if (frm.is_new()) {
            frm.set_df_property('student_document', 'hidden', 1);
            frm.set_df_property('consent', 'hidden', 1);
            frm.dashboard.clear_headline();
        } else {
            frm.set_df_property('student_document', 'hidden', 0);
            frm.set_df_property('consent', 'hidden', 0);
            
            // Show status banner if NIIT Registration exists
            frappe.db.get_list('NIIT Registration', {
                filters: { student_id: frm.doc.name },
                limit: 1
            }).then(records => {
                if (records && records.length > 0) {
                    frm.dashboard.set_headline_alert(
                        '<div style="display: flex; align-items: center; gap: 8px;">' +
                        '<span class="indicator-pill green">NIIT Registered</span>' +
                        '<span>This student has completed NIIT Registration.</span></div>'
                    );
                } else {
                    frm.dashboard.clear_headline();
                }
            });
        }
    }
});

const update_preview = (frm, cdt, cdn, file_field, preview_field) => {
    let row = locals[cdt][cdn];
    let file_url = row[file_field];

    // Find the open grid row
    let grid_row = frm.get_field(row.parentfield).grid.grid_rows_by_docname[cdn];

    // Only update if the row is open and the field exists in the form
    if (grid_row && grid_row.grid_form && grid_row.grid_form.fields_dict[preview_field]) {
        let $wrapper = grid_row.grid_form.fields_dict[preview_field].$wrapper;
        $wrapper.empty();

        if (file_url) {
            let ext = file_url.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
                $wrapper.html(`<div style="text-align: center;"><img src="${file_url}" style="max-width: 100%; max-height: 400px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);"></div>`);
            } else if (ext === 'pdf') {
                $wrapper.html(`<iframe src="${file_url}" style="width: 100%; height: 500px; border: 1px solid #d1d5db; border-radius: 4px;"></iframe>`);
            } else {
                $wrapper.html(`<div style="padding: 10px; color: #6b7280; text-align: center; background: #f3f4f6; border-radius: 4px;">Preview not available for this file type. <a href="${file_url}" target="_blank">Download</a></div>`);
            }
        } else {
            $wrapper.html(`<div style="padding: 10px; color: #9ca3af; text-align: center;">No file attached.</div>`);
        }
    }
};

frappe.ui.form.on("Student Document", {
    form_render: function (frm, cdt, cdn) {
        update_preview(frm, cdt, cdn, "file_path", "file_preview");
    },
    file_path: function (frm, cdt, cdn) {
        update_preview(frm, cdt, cdn, "file_path", "file_preview");
    },
    student_document_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        row.student_id = frm.doc.name;
        frm.refresh_field('student_document');
    }
});

frappe.ui.form.on("Consent", {
    form_render: function (frm, cdt, cdn) {
        update_preview(frm, cdt, cdn, "pdf_file_path", "file_preview");
    },
    pdf_file_path: function (frm, cdt, cdn) {
        update_preview(frm, cdt, cdn, "pdf_file_path", "file_preview");
    },
    consent_add: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        row.student_id = frm.doc.name;
        frm.refresh_field('consent');
    }
});
