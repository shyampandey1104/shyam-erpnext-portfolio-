import frappe

@frappe.whitelist()
def get_user_branch():
    user = frappe.session.user
    if not user or user == 'Guest':
        return None
    # Get all branches from the Table MultiSelect child table
    branches = frappe.db.get_all(
        'User Branch',
        filters={'parent': user, 'parenttype': 'User', 'parentfield': 'branch'},
        fields=['branch'],
        order_by='idx asc'
    )
    branch_list = [b.branch for b in branches if b.branch]
    if not branch_list:
        return None
    # Return single branch if only one, list if multiple
    return branch_list


@frappe.whitelist()
def get_niit_attendance(student_id, batch_id=None):
    """
    Fetch attendance records for a NIIT student.
    Approach: Find sessions by batch, check student attendance in each SAR.
    Falls back to direct student table lookup if batch not provided.
    """
    if not student_id:
        return []

    result = []

    if batch_id:
        # Get all sessions for this batch
        sessions = frappe.db.get_all(
            "Session",
            filters={"batch_id": batch_id},
            fields=["name", "session_date", "subject_id", "facilitator_user_id"],
            order_by="session_date desc",
            limit=500
        )

        for session in sessions:
            # Find SAR for this session
            sar_list = frappe.db.get_all(
                "Samwadini Attendance Request",
                filters={"custom_session": session.name},
                fields=["name"],
                limit=1
            )

            if sar_list:
                sar_name = sar_list[0].name
                # Check if student is in this SAR's student table
                st_row = frappe.db.get_value(
                    "Student Table",
                    {"parent": sar_name, "sudent": student_id},
                    ["attendance_status"],
                    as_dict=True
                )
                status = "Present" if (st_row and st_row.attendance_status) else "Absent"
            else:
                status = "-"

            result.append({
                "attendance_date": str(session.session_date) if session.session_date else "",
                "session_id": session.name,
                "subject_id": session.subject_id or "",
                "conducted_by": session.facilitator_user_id or "",
                "status": status
            })
    else:
        # Fallback: direct student table lookup
        rows = frappe.db.sql("""
            SELECT st.parent, st.attendance_status,
                   sar.from_date, sar.custom_session, sar.custom_batch
            FROM `tabStudent Table` st
            JOIN `tabSamwadini Attendance Request` sar ON sar.name = st.parent
            WHERE st.sudent = %(student_id)s
            ORDER BY sar.from_date DESC
            LIMIT 500
        """, {"student_id": student_id}, as_dict=True)

        for row in rows:
            session_data = {}
            if row.custom_session:
                session_data = frappe.db.get_value(
                    "Session", row.custom_session,
                    ["subject_id", "facilitator_user_id"],
                    as_dict=True
                ) or {}

            result.append({
                "attendance_date": str(row.from_date) if row.from_date else "",
                "session_id": row.custom_session or "",
                "subject_id": session_data.get("subject_id", ""),
                "conducted_by": session_data.get("facilitator_user_id", ""),
                "status": "Present" if row.attendance_status else "Absent"
            })

    return result


@frappe.whitelist()
def get_niit_assessments(student_id):
    """
    Fetch assessment records for a student from Assessment doctype.
    """
    if not student_id:
        return []

    records = frappe.db.get_all(
        "Assessment",
        filters={"student_id": student_id},
        fields=["name", "assessment_date", "subject_id", "type", "score", "total_marks", "grade"],
        order_by="assessment_date desc",
        limit=500
    )

    return records


@frappe.whitelist()
def get_niit_thematic_sessions(student_id):
    """
    Fetch Thematic Expert Sessions main doctype fields for a student.
    Shows: name1, date (fallback: creation), facilitator full name, place, topics_covered.
    """
    if not student_id:
        return []

    rows = frappe.db.sql("""
        SELECT tea.parent      AS session_id,
               tea.status,
               tes.name1       AS session_title,
               tes.date        AS session_date,
               tes.creation    AS session_creation,
               tes.facilitator,
               tes.place,
               tes.topics_covered
        FROM `tabThematic Expert Sessions Attendance` tea
        JOIN `tabThematic Expert Sessions` tes ON tes.name = tea.parent
        WHERE tea.student_outreach_id = %(student_id)s
        ORDER BY tes.creation DESC
        LIMIT 500
    """, {"student_id": student_id}, as_dict=True)

    result = []
    for row in rows:
        # Resolve facilitator to full name
        facilitator_name = row.facilitator or ""
        if facilitator_name:
            fname = frappe.db.get_value("User", facilitator_name, "full_name")
            facilitator_name = fname or facilitator_name

        # Use creation date as fallback if date not filled
        if row.session_date:
            display_date = str(row.session_date)
        elif row.session_creation:
            display_date = str(row.session_creation.date())
        else:
            display_date = ""

        # Use session_id as fallback title if name1 not filled
        session_title = row.session_title or ("Session: " + str(row.session_id or ""))

        result.append({
            "session_id":       row.session_id or "",
            "session_title":    session_title,
            "session_date":     display_date,
            "facilitator_name": facilitator_name,
            "place":            row.place or "",
            "topics_covered":   row.topics_covered or "",
            "status":           row.status or "Present"
        })

    return result


@frappe.whitelist()
def get_niit_self_defence(student_id):
    """
    Fetch Self Defence sessions for a student.
    Query directly by student_id + GROUP BY to avoid duplicates
    when a student has multiple NIIT registrations.
    """
    if not student_id:
        return []

    # Find NIIT Registration names for this student
    niit_records = frappe.db.get_all(
        "NIIT Registration",
        filters={"student_id": student_id},
        fields=["name"],
        limit=50
    )
    niit_names = [n.name for n in niit_records]
    if not niit_names:
        return []

    # Use IN clause with GROUP BY to deduplicate across multiple NIIT records
    placeholders = ", ".join(["%s"] * len(niit_names))
    rows = frappe.db.sql("""
        SELECT sd.name AS session_name,
               sd.date AS session_date,
               sd.creation AS session_creation,
               sd.name_of_teacher AS teacher,
               sd.center AS center,
               MAX(sda.status) AS status
        FROM `tabSelf Defence Attendance` sda
        JOIN `tabSelf Defence` sd ON sd.name = sda.parent
        WHERE sda.niit_registration IN ({placeholders})
        GROUP BY sd.name
        ORDER BY sd.date DESC
        LIMIT 500
    """.format(placeholders=placeholders), tuple(niit_names), as_dict=True)

    result = []
    for row in rows:
        # Resolve teacher (User) to full name
        teacher_name = row.teacher or ""
        if teacher_name:
            full = frappe.db.get_value("User", teacher_name, "full_name")
            teacher_name = full or teacher_name

        # Use creation date as fallback if date not filled
        if row.session_date:
            display_date = str(row.session_date)
        elif row.session_creation:
            display_date = str(row.session_creation.date())
        else:
            display_date = ""

        result.append({
            "session_id":   row.session_name or "",
            "session_date": display_date,
            "teacher":      teacher_name,
            "center":       row.center or "",
            "status":       row.status or "Present"
        })

    return result


@frappe.whitelist()
def get_niit_exposure_visits(niit_registration=None, student_id=None):
    if not niit_registration and student_id:
        niit_registration = frappe.db.get_value("NIIT Registration", {"student_id": student_id}, "name")
    """
    Fetch Exposure Visits where this NIIT Registration appears in attendance.
    Only relevant when is_change_maker = 1.
    """
    if not niit_registration:
        return []

    rows = frappe.db.sql("""
        SELECT eva.parent, eva.status,
               ev.date_of_visit, ev.place_of_visits,
               ev.theme_of_visit, ev.mentors
        FROM `tabExposure Visits Attendance` eva
        JOIN `tabExposure Visits` ev ON ev.name = eva.parent
        WHERE eva.niit_registration = %(niit_reg)s
        ORDER BY ev.date_of_visit DESC
        LIMIT 500
    """, {"niit_reg": niit_registration}, as_dict=True)

    result = []
    for row in rows:
        result.append({
            "exposure_visit": row.parent,
            "date_of_visit": str(row.date_of_visit) if row.date_of_visit else "",
            "place_of_visits": row.place_of_visits or "",
            "theme_of_visit": row.theme_of_visit or "",
            "mentors": row.mentors or "",
            "status": row.status or "Present"
        })

    return result


@frappe.whitelist()
def get_dashboard_counts(selected_branch=None):
    user = frappe.session.user
    from samwadini.permissions import get_branch_filter
    user_branches = get_branch_filter(user)
    
    if selected_branch and selected_branch != "ALL":
        if user_branches and selected_branch not in user_branches:
            branches_to_filter = []
        else:
            branches_to_filter = [selected_branch]
    else:
        if user_branches:
            branches_to_filter = user_branches
        else:
            branches_to_filter = None
            
    counts = {}
    
    def get_in_list(values):
        return ", ".join([f"'{v}'" for v in values])
        
    # --- Branches ---
    if user_branches:
        counts['Branches'] = frappe.db.count('Branches', filters={'name': ['in', user_branches], 'is_active': 1})
    else:
        counts['Branches'] = frappe.db.count('Branches', filters={'is_active': 1})
        
    # --- User ---
    if branches_to_filter is not None:
        counts['User'] = frappe.db.sql(f"""
            SELECT COUNT(DISTINCT parent) FROM `tabUser Branch` 
            WHERE branch IN ({get_in_list(branches_to_filter)})
        """)[0][0] or 0
    else:
        counts['User'] = frappe.db.count('User')
        
    # --- Program ---
    if branches_to_filter is not None:
        counts['Program'] = frappe.db.count('Program', filters={'branch': ['in', branches_to_filter], 'is_active': 1})
    else:
        counts['Program'] = frappe.db.count('Program', filters={'is_active': 1})
        
    # --- Subject ---
    if branches_to_filter is not None:
        counts['Subject'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabSubject` 
            WHERE (is_active IS NULL OR is_active = 1) AND program_id IN (SELECT name FROM `tabProgram` WHERE branch IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Subject'] = frappe.db.count('Subject', filters={'is_active': 1})
        
    # --- Batches ---
    if branches_to_filter is not None:
        counts['Batches'] = frappe.db.count('Batches', filters={'branch_id': ['in', branches_to_filter], 'is_active': 1})
    else:
        counts['Batches'] = frappe.db.count('Batches', filters={'is_active': 1})
        
    # --- Batch Enrollment ---
    if branches_to_filter is not None:
        counts['Batch Enrollment'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabBatch Enrollment` 
            WHERE batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Batch Enrollment'] = frappe.db.count('Batch Enrollment')
        
    # --- Student Outreach ---
    if branches_to_filter is not None:
        counts['Student Outreach'] = frappe.db.count('Student Outreach', filters={'branch_id': ['in', branches_to_filter], 'is_active': 1})
    else:
        counts['Student Outreach'] = frappe.db.count('Student Outreach', filters={'is_active': 1})
        
    # --- NIIT Registration ---
    if branches_to_filter is not None:
        counts['NIIT Registration'] = frappe.db.count('NIIT Registration', filters={'branch_id': ['in', branches_to_filter]})
    else:
        counts['NIIT Registration'] = frappe.db.count('NIIT Registration')
        
    # --- Assessment ---
    if branches_to_filter is not None:
        counts['Assessment'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabAssessment` 
            WHERE batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Assessment'] = frappe.db.count('Assessment')
        
    # --- Session ---
    if branches_to_filter is not None:
        counts['Session'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabSession` 
            WHERE (is_active IS NULL OR is_active = 1) AND batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Session'] = frappe.db.sql("SELECT COUNT(*) FROM `tabSession` WHERE (is_active IS NULL OR is_active = 1)")[0][0] or 0

    # --- NIIT Class ---
    if branches_to_filter is not None:
        counts['NIIT Class'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabNIIT Class` 
            WHERE (is_active IS NULL OR is_active = 1) AND (center IN ({get_in_list(branches_to_filter)}) OR batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({get_in_list(branches_to_filter)})))
        """)[0][0] or 0
    else:
        counts['NIIT Class'] = frappe.db.sql("SELECT COUNT(*) FROM `tabNIIT Class` WHERE (is_active IS NULL OR is_active = 1)")[0][0] or 0
        
    # --- Samwadini Attendance Request ---
    if branches_to_filter is not None:
        counts['Samwadini Attendance Request'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabSamwadini Attendance Request` 
            WHERE custom_batch IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Samwadini Attendance Request'] = frappe.db.count('Samwadini Attendance Request')
        
    # --- Student Attendance ---
    if branches_to_filter is not None:
        counts['Student Attendance'] = frappe.db.count('Student Attendance', filters={'branch_id': ['in', branches_to_filter]})
    else:
        counts['Student Attendance'] = frappe.db.count('Student Attendance')
        
    # --- Government Scheme Linkages Student ---
    if branches_to_filter is not None:
        counts['Government Scheme Linkages Student'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabGovernment Scheme Linkages Student` 
            WHERE name_auto_field IN (SELECT name FROM `tabStudent Outreach` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Government Scheme Linkages Student'] = frappe.db.count('Government Scheme Linkages Student')
        
    # --- Exposure Visits ---
    if branches_to_filter is not None:
        counts['Exposure Visits'] = frappe.db.sql(f"""
            SELECT COUNT(DISTINCT parent) FROM `tabExposure Visits Attendance` 
            WHERE branch_id IN ({get_in_list(branches_to_filter)})
        """)[0][0] or 0
    else:
        counts['Exposure Visits'] = frappe.db.count('Exposure Visits')
        
    # --- Thematic Expert Sessions ---
    if branches_to_filter is not None:
        counts['Thematic Expert Sessions'] = frappe.db.count('Thematic Expert Sessions', filters={'center': ['in', branches_to_filter]})
    else:
        counts['Thematic Expert Sessions'] = frappe.db.count('Thematic Expert Sessions')
        
    # --- Change Maker ---
    if branches_to_filter is not None:
        counts['Change Maker'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabChange Maker` 
            WHERE niit_registration IN (SELECT name FROM `tabNIIT Registration` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Change Maker'] = frappe.db.count('Change Maker')
        
    # --- Self Defence ---
    if branches_to_filter is not None:
        counts['Self Defence'] = frappe.db.count('Self Defence', filters={'center': ['in', branches_to_filter]})
    else:
        counts['Self Defence'] = frappe.db.count('Self Defence')
        
    # --- Assessment Type Mapping ---
    if branches_to_filter is not None:
        counts['Assessment Type Mapping'] = frappe.db.count('Assessment Type Mapping', filters={'center': ['in', branches_to_filter]})
    else:
        counts['Assessment Type Mapping'] = frappe.db.count('Assessment Type Mapping')
        
    counts['Student Questionnaire'] = frappe.db.count('Student Questionnaire')
    
    return counts


@frappe.whitelist()
def get_women_dashboard_counts(selected_branch=None):
    user = frappe.session.user
    from samwadini.permissions import get_branch_filter
    user_branches = get_branch_filter(user)
    
    if selected_branch and selected_branch != "ALL":
        if user_branches and selected_branch not in user_branches:
            branches_to_filter = []
        else:
            branches_to_filter = [selected_branch]
    else:
        if user_branches:
            branches_to_filter = user_branches
        else:
            branches_to_filter = None
            
    counts = {}
    
    def get_in_list(values):
        return ", ".join([f"'{v}'" for v in values])
        
    direct_doctypes = [
        'Outreach Survey Women Profile',
        'Woman Case',
        'Registration Womens Profile Identification'
    ]
    
    for dt in direct_doctypes:
        if branches_to_filter is not None:
            counts[dt] = frappe.db.count(dt, filters={'branch_id': ['in', branches_to_filter]})
        else:
            counts[dt] = frappe.db.count(dt)
            
    if branches_to_filter is not None:
        counts['Case FollowUp'] = frappe.db.sql(f"""
            SELECT COUNT(*) FROM `tabCase FollowUp`
            WHERE legal_consultant_followup = 1
              AND woman_case_id IN (SELECT name FROM `tabWoman Case` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
        """)[0][0] or 0
    else:
        counts['Case FollowUp'] = frappe.db.count('Case FollowUp', filters={'legal_consultant_followup': 1})
        
    indirect_profile_doctypes = ['Skill Training', 'Government Scheme Linkages']
    for dt in indirect_profile_doctypes:
        if branches_to_filter is not None:
            counts[dt] = frappe.db.sql(f"""
                SELECT COUNT(*) FROM `tab{dt}`
                WHERE outreach_survey_women_profile IN (SELECT name FROM `tabOutreach Survey Women Profile` WHERE branch_id IN ({get_in_list(branches_to_filter)}))
            """)[0][0] or 0
        else:
            counts[dt] = frappe.db.count(dt)
            
    global_doctypes = [
        'Women Case Category',
        'Case Referred By',
        'Calling Data',
        'Counselling Module Questionnaire',
        'Awareness Programs',
        'Status',
        'Women Profile Questionnaire'
    ]
    for dt in global_doctypes:
        counts[dt] = frappe.db.count(dt)
        
    return counts


def sync_user_permissions(doc, method=None):
    user = doc.name
    assigned = [b.branch for b in doc.get("branch") if b.branch]
    assigned = list(set(assigned))
    
    existing = frappe.get_all(
        'User Permission',
        filters={'user': user, 'allow': 'Branches'},
        pluck='for_value'
    )
    existing = list(set(existing))
    
    if set(assigned) != set(existing):
        frappe.db.delete('User Permission', {'user': user, 'allow': 'Branches'})
        from frappe.permissions import add_user_permission
        for br in assigned:
            try:
                add_user_permission('Branches', br, user)
            except Exception as e:
                frappe.log_error(f"Error adding permission for {user} - {br}: {str(e)}")
        frappe.db.commit()


@frappe.whitelist()
def bulk_approve_attendance_requests(docnames):
    import json
    from frappe.model.workflow import apply_workflow
    
    if isinstance(docnames, str):
        docnames = json.loads(docnames)
        
    success_count = 0
    errors = []
    
    for name in docnames:
        try:
            doc = frappe.get_doc("Attendance Request", name)
            apply_workflow(doc, "Approve")
            success_count += 1
        except Exception as e:
            frappe.log_error(f"Error bulk approving Attendance Request {name}: {str(e)}")
            errors.append(f"{name}: {str(e)}")
            
    return {
        "success_count": success_count,
        "errors": errors
    }


@frappe.whitelist()
def get_student_attendance_grouped(student_id):
    if not student_id:
        return {}

    # 1. Fetch Student Attendance records
    sa_records = frappe.get_all(
        "Student Attendance",
        filters={"student": student_id, "docstatus": 1},
        fields=["name", "attendance_date", "session_id", "marked_by_user_id", "status", "batch"]
    )

    # 2. Fetch Session Attendance Request records (from Session child table)
    sar_records = frappe.db.sql("""
        SELECT 
            ar.name as name,
            s.session_date as attendance_date,
            ar.parent as session_id,
            s.owner as marked_by_user_id,
            CASE WHEN ar.present = 1 THEN 'Present' ELSE 'Absent' END as status,
            s.batch_id as batch
        FROM `tabSession Attendance Request` ar
        JOIN `tabSession` s ON s.name = ar.parent
        WHERE ar.student = %(student)s
    """, {"student": student_id}, as_dict=True)

    # Combine records, avoid duplicate session_id if present in both
    all_records = list(sa_records)
    existing_sessions = set([r.session_id for r in sa_records if r.session_id])
    for sar in sar_records:
        if not sar.session_id or sar.session_id not in existing_sessions:
            all_records.append(sar)

    # Pre-fetch session data (start_time, end_time, subject_id)
    session_ids = [a.get("session_id") for a in all_records if a.get("session_id")]
    sessions = {}
    if session_ids:
        session_data = frappe.get_all(
            "Session",
            filters={"name": ["in", session_ids]},
            fields=["name", "subject_id", "start_time", "end_time"]
        )
        for s in session_data:
            sessions[s.name] = s

    # Pre-fetch NIIT Registrations for program enrollment dates
    niit_regs = frappe.get_all("NIIT Registration", filters={"student_id": student_id}, fields=["name", "program_id", "registration_date"])

    grouped_data = {}

    for att in all_records:
        program_name = "Unknown Program"
        if att.get("batch"):
            prog = frappe.db.get_value("Batches", att.get("batch"), "program_id")
            if prog:
                program_name = prog

        if program_name not in grouped_data:
            grouped_data[program_name] = {
                "enrollment_date": None,
                "attendances": []
            }
            for reg in niit_regs:
                if reg.program_id == program_name:
                    grouped_data[program_name]["enrollment_date"] = str(reg.registration_date) if reg.registration_date else None
                    break

        if att.get("attendance_date"):
            att["attendance_date"] = str(att["attendance_date"])

        # Calculate session hours from start_time and end_time
        hours = 0
        if att.get("session_id") and att["session_id"] in sessions:
            s = sessions[att["session_id"]]
            att["session_subject"] = s.get("subject_id")
            t1 = s.get("start_time")
            t2 = s.get("end_time")
            if t1 and t2:
                try:
                    if hasattr(t1, 'total_seconds') and hasattr(t2, 'total_seconds'):
                        diff = (t2 - t1).total_seconds()
                    else:
                        from frappe.utils import time_diff_in_hours
                        diff = time_diff_in_hours(str(t2), str(t1)) * 3600
                    if diff > 0:
                        hours = round(diff / 3600.0, 1)
                except Exception:
                    pass

        att["hours"] = hours
        grouped_data[program_name]["attendances"].append(att)

    return grouped_data


@frappe.whitelist()
def get_student_assessment_grouped(student_id):
    assessments = frappe.get_all(
        "Assessment",
        filters={"student_id": student_id, "docstatus": 1},
        fields=["name as assessment_id", "assessment_date", "subject_id", "type", "score", "total_marks", "grade", "batch_id"]
    )
    
    # Pre-fetch NIIT Registrations
    niit_regs = frappe.get_all("NIIT Registration", filters={"student_id": student_id}, fields=["name", "program_id", "registration_date"])
    
    grouped_data = {}
    
    for ass in assessments:
        program_name = "Unknown Program"
        if ass.get("batch_id"):
            prog = frappe.db.get_value("Batches", ass.get("batch_id"), "program_id")
            if prog:
                program_name = prog
                
        if program_name not in grouped_data:
            grouped_data[program_name] = {
                "enrollment_date": None,
                "assessments": []
            }
            
            for reg in niit_regs:
                if reg.program_id == program_name:
                    grouped_data[program_name]["enrollment_date"] = str(reg.registration_date) if reg.registration_date else None
                    break
            
        if ass.get("assessment_date"):
            ass["assessment_date"] = str(ass["assessment_date"])
            
        grouped_data[program_name]["assessments"].append(ass)
        
    return grouped_data




def _get_possible_profile_ids(woman_profile_id):
    if not woman_profile_id:
        return []
    possible = [woman_profile_id]
    prof = frappe.db.get_value("Outreach Survey Women Profile", woman_profile_id, ["name", "name_of_women", "full_name"], as_dict=True)
    if prof:
        if prof.get("name_of_women"): possible.append(prof.get("name_of_women"))
        if prof.get("full_name"): possible.append(prof.get("full_name"))
    return list(set([p for p in possible if p]))

@frappe.whitelist(allow_guest=True)
def get_woman_profile_cases(woman_profile_id):
    p_ids = _get_possible_profile_ids(woman_profile_id)
    if not p_ids:
        return []
    cases = frappe.get_all("Woman Case",
        filters={"woman_profile_id": ["in", p_ids]},
        fields=["name", "case_number", "branch_id", "status", "category_id", "opened_at", "creation"],
        order_by="creation desc"
    )
    return cases

@frappe.whitelist(allow_guest=True)
def get_woman_profile_registrations(woman_profile_id):
    p_ids = _get_possible_profile_ids(woman_profile_id)
    if not p_ids:
        return []
    return frappe.get_all("Registration Womens Profile Identification",
        filters={"woman_profile_id": ["in", p_ids]},
        fields=["name", "case_id", "branch_id", "name1", "contact_number", "case_category", "captured_at", "creation"],
        order_by="creation desc"
    )

@frappe.whitelist(allow_guest=True)
def get_woman_profile_skill_trainings(woman_profile_id):
    p_ids = _get_possible_profile_ids(woman_profile_id)
    if not p_ids:
        return []
    return frappe.get_all("Skill Training",
        filters={"outreach_survey_women_profile": ["in", p_ids]},
        fields=["name", "skill_training", "creation"],
        order_by="creation desc"
    )

@frappe.whitelist(allow_guest=True)
def get_woman_profile_scheme_linkages(woman_profile_id):
    p_ids = _get_possible_profile_ids(woman_profile_id)
    if not p_ids:
        return []
    return frappe.get_all("Government Scheme Linkages",
        filters={"outreach_survey_women_profile": ["in", p_ids]},
        fields=["name", "name1", "date", "document_received", "creation"],
        order_by="creation desc"
    )


@frappe.whitelist(allow_guest=True)
def get_customers(limit=10, featured_only=0):
    """
    Fetch Customer list / testimonials formatted for web cards.
    Endpoint: /api/method/samwadini.samwadini.api.get_customers
           or /api/method/samwadini.api.get_customers
    """
    try:
        filters = {"disabled": 0}
        if frappe.utils.cint(featured_only):
            filters["custom_is_featured"] = 1

        fields = [
            "name",
            "customer_name",
            "image",
            "customer_details",
            "email_id",
            "mobile_no",
            "customer_type",
            "customer_group",
            "territory"
        ]

        meta = frappe.get_meta("Customer")
        if meta.has_field("custom_testimonial"):
            fields.append("custom_testimonial")
        if meta.has_field("custom_rating"):
            fields.append("custom_rating")
        if meta.has_field("custom_handle"):
            fields.append("custom_handle")
        if meta.has_field("custom_is_featured"):
            fields.append("custom_is_featured")

        customers = frappe.get_all(
            "Customer",
            filters=filters,
            fields=fields,
            limit_page_length=frappe.utils.cint(limit) or 10,
            order_by="creation desc"
        )

        result = []
        for c in customers:
            testimonial = c.get("custom_testimonial") or c.get("customer_details") or ""
            rating = c.get("custom_rating") or 5
            handle = c.get("custom_handle") or (f"@{c.customer_name.lower().replace(' ', '')}" if c.customer_name else "")

            result.append({
                "id": c.name,
                "name": c.name,
                "customer_name": c.customer_name,
                "image": c.image or "",
                "handle": handle,
                "testimonial": testimonial,
                "rating": rating,
                "email_id": c.email_id or "",
                "mobile_no": c.mobile_no or "",
                "customer_group": c.customer_group or "",
                "territory": c.territory or "",
                "is_featured": c.get("custom_is_featured", 1)
            })

        return {
            "status": "success",
            "message": "Customers fetched successfully",
            "data": result,
            "total": len(result)
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_customers error")
        return {
            "status": "error",
            "message": str(e),
            "data": []
        }


@frappe.whitelist(allow_guest=True)
def get_satisfied_customers(limit=10):
    """
    Alias endpoint specifically for Satisfied Customers / Testimonials section.
    Endpoint: /api/method/samwadini.api.get_satisfied_customers
    """
    return get_customers(limit=limit, featured_only=0)


@frappe.whitelist()
def setup_customer_custom_fields():
    """
    Create custom fields for Customer DocType if not already created.
    Fields: custom_testimonial, custom_rating, custom_handle, custom_is_featured
    """
    custom_fields = {
        "Customer": [
            {
                "fieldname": "custom_testimonial_section",
                "label": "Testimonials & Feedback",
                "fieldtype": "Section Break",
                "insert_after": "disabled"
            },
            {
                "fieldname": "custom_testimonial",
                "label": "Testimonial / Review",
                "fieldtype": "Small Text",
                "insert_after": "custom_testimonial_section"
            },
            {
                "fieldname": "custom_rating",
                "label": "Rating (Stars 1-5)",
                "fieldtype": "Int",
                "default": 5,
                "insert_after": "custom_testimonial"
            },
            {
                "fieldname": "custom_handle",
                "label": "Handle / Designation",
                "fieldtype": "Data",
                "insert_after": "custom_rating"
            },
            {
                "fieldname": "custom_is_featured",
                "label": "Show on Website (Featured)",
                "fieldtype": "Check",
                "default": 1,
                "insert_after": "custom_handle"
            }
        ]
    }
    from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
    create_custom_fields(custom_fields)
    return {"status": "success", "message": "Customer Custom Fields created successfully"}



@frappe.whitelist()
def get_student_qualitative_assessments(student_id=None):
    if not student_id:
        return []
    records = frappe.get_all(
        "Qualitative Assessment",
        filters={"student": student_id, "docstatus": ["<", 2]},
        fields=["name", "student", "student_name", "type", "date", "total_score", "center", "batch"],
        order_by="date asc"
    )
    return records

@frappe.whitelist()
def get_batch_enrolled_students(batch_name=None):
    if not batch_name:
        return []
    enrollments = frappe.get_all(
        "Batch Enrollment",
        filters={"batch_id": batch_name, "is_active": 1, "docstatus": ["<", 2]},
        fields=["name", "student_id", "enrolled_at"]
    )
    students = []
    for e in enrollments:
        if e.student_id:
            st = frappe.db.get_value(
                "Student Outreach",
                e.student_id,
                ["name", "first_name", "last_name", "gender", "primary_contact", "date_of_survey"],
                as_dict=True
            )
            if st:
                first_name = (st.first_name or "").strip()
                last_name = (st.last_name or "").strip()
                st["applicant_name"] = f"{first_name} {last_name}".strip()
                st["student_id"] = e.student_id
                st["registration_date"] = st.get("date_of_survey")
                students.append(st)
    return students

@frappe.whitelist()
def bulk_delete_records(doctype=None, names=None):
    if isinstance(names, str):
        names = json.loads(names)
    if not doctype or not names:
        return {"deleted": 0}
    count = 0
    for n in names:
        frappe.delete_doc(doctype, n, ignore_permissions=True)
        count += 1
    frappe.db.commit()
    return {"deleted": count}
