// Copyright (c) 2025, samwadini and contributors
// Woman Case - Custom Activity Timeline (Fixed - uses server-side API)

frappe.ui.form.on("Woman Case", {
    refresh: function (frm) {
        if (!frm.is_new()) {
            render_case_timeline(frm);
        }
    }
});

function render_case_timeline(frm) {
    // Purani timeline remove karo
    $(frm.wrapper).find(".custom-case-timeline").remove();

    // Timeline container
    let $container = $(`
        <div class="custom-case-timeline" style="
            margin: 20px 15px 30px;
            padding: 20px;
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        ">
            <div style="
                font-size: 14px;
                font-weight: 600;
                color: #1a202c;
                margin-bottom: 18px;
                display: flex;
                align-items: center;
                gap: 8px;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 12px;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Case Activity Timeline
            </div>
            <div class="tl-loading" style="color:#94a3b8;font-size:13px;text-align:center;padding:16px 0;">
                <span>⏳ Loading timeline...</span>
            </div>
        </div>
    `);

    $(frm.wrapper).find(".form-page").append($container);

    // Server-side API call — no permission issues
    frappe.call({
        method: "get_woman_case_timeline",
        args: { case_name: frm.doc.name },
        callback: function (r) {
            $container.find(".tl-loading").remove();
            if (r.message && r.message.length > 0) {
                render_events($container, r.message);
            } else {
                $container.append(`<div style="color:#94a3b8;font-size:13px;text-align:center;padding:12px 0;">No activity recorded yet.</div>`);
            }
        },
        error: function () {
            $container.find(".tl-loading").html('<span style="color:#ef4444;">⚠️ Could not load timeline.</span>');
        }
    });
}

function render_events($container, events) {
    let $tl = $(`<div style="position:relative;padding-left:34px;"></div>`);

    // Vertical line
    $tl.append(`<div style="
        position:absolute;left:12px;top:10px;bottom:10px;
        width:2px;background:#e2e8f0;border-radius:2px;
    "></div>`);

    events.forEach(function (ev, idx) {
        let time_ago = frappe.datetime.prettyDate(ev.date);
        let full_date = ev.date ? ev.date.substring(0, 16).replace("T", " ") : "";
        let is_last = idx === events.length - 1;

        let link_html = "";
        if (ev.link && ev.link_label && ev.doctype) {
            link_html = `
                <a href="${ev.link}"
                   style="font-size:11px;color:#6366f1;text-decoration:none;
                          background:#eef2ff;padding:2px 10px;border-radius:12px;
                          display:inline-block;margin-top:5px;font-weight:500;
                          border:1px solid #c7d2fe;"
                   onclick="frappe.set_route('Form','${ev.doctype}','${ev.link_label}');return false;">
                    🔗 ${ev.link_label}
                </a>`;
        }

        let user_html = ev.user
            ? `<span style="font-size:10px;color:#94a3b8;"> · ${ev.user.split("@")[0]}</span>`
            : "";

        let $item = $(`
            <div style="
                position:relative;
                margin-bottom:${is_last ? 0 : 16}px;
                background:#f8fafc;
                border:1px solid #e8edf2;
                border-radius:8px;
                padding:10px 14px;
                ${ev.link ? 'cursor:pointer;' : ''}
                transition:all 0.15s ease;
            ">
                <!-- Dot on timeline -->
                <div style="
                    position:absolute;left:-27px;top:13px;
                    width:16px;height:16px;border-radius:50%;
                    background:${ev.color};
                    display:flex;align-items:center;justify-content:center;
                    font-size:9px;border:2px solid #fff;
                    box-shadow:0 0 0 2px ${ev.color}40;
                ">${ev.icon}</div>

                <!-- Row: title + time -->
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:0;">
                        <span style="font-size:13px;font-weight:600;color:#1e293b;">${ev.title}</span>
                        ${user_html}
                        <div style="font-size:12px;color:#64748b;margin-top:3px;line-height:1.4;">${ev.description}</div>
                        ${link_html}
                    </div>
                    <div title="${full_date}" style="
                        font-size:11px;color:#94a3b8;white-space:nowrap;
                        background:#fff;padding:2px 8px;border-radius:12px;
                        border:1px solid #e2e8f0;flex-shrink:0;margin-top:1px;
                    ">🕒 ${time_ago}</div>
                </div>
            </div>
        `);

        // Clickable redirect for documents
        if (ev.link && ev.link_label && ev.doctype) {
            $item.on("click", function (e) {
                if (!$(e.target).is("a")) {
                    frappe.set_route("Form", ev.doctype, ev.link_label);
                }
            }).hover(
                function () { $(this).css({ "background": "#eff6ff", "border-color": "#bfdbfe" }); },
                function () { $(this).css({ "background": "#f8fafc", "border-color": "#e8edf2" }); }
            );
        }

        $tl.append($item);
    });

    $container.append($tl);
}
