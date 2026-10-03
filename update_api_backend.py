import re
import os

def fix_api_counts():
    api_path = "/home/frappe/frappe-bench/apps/samwadini/samwadini/samwadini/api.py"
    with open(api_path, "r", encoding="utf-8") as f:
        c = f.read()

    new_fn = """@frappe.whitelist()
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

    # Masters
    counts['User Type'] = frappe.db.count('User Type')
    counts['Subject'] = frappe.db.count('Subject')
    counts['Student Questionnaire'] = frappe.db.count('Student Questionnaire')
        
    if branches_to_filter is not None:
        if branches_to_filter:
            in_str = get_in_list(branches_to_filter)
            counts['Branches'] = len(branches_to_filter)
            counts['User'] = frappe.db.sql(f"SELECT COUNT(DISTINCT parent) FROM `tabUser Branch` WHERE branch IN ({in_str})")[0][0] or 0
            counts['Program'] = frappe.db.count('Program', filters={'branch': ['in', branches_to_filter]})
            counts['Batches'] = frappe.db.count('Batches', filters={'branch_id': ['in', branches_to_filter]})
            counts['Assessment Type Mapping'] = frappe.db.count('Assessment Type Mapping', filters={'center': ['in', branches_to_filter]})
            
            # Forms & Records
            counts['Student Outreach'] = frappe.db.count('Student Outreach', filters={'branch_id': ['in', branches_to_filter]})
            counts['NIIT Registration'] = frappe.db.count('NIIT Registration', filters={'branch_id': ['in', branches_to_filter]})
            counts['Student Attendance'] = frappe.db.count('Student Attendance', filters={'branch_id': ['in', branches_to_filter]})
            counts['Self Defence'] = frappe.db.count('Self Defence', filters={'center': ['in', branches_to_filter]})
            counts['Thematic Expert Sessions'] = frappe.db.count('Thematic Expert Sessions', filters={'center': ['in', branches_to_filter]})
            counts['Thematic Sessions'] = counts['Thematic Expert Sessions']
            
            counts['Exposure Visits'] = frappe.db.sql(f"SELECT COUNT(DISTINCT parent) FROM `tabExposure Visits Attendance` WHERE branch_id IN ({in_str})")[0][0] or 0
            counts['Batch Enrollment'] = frappe.db.sql(f"SELECT COUNT(*) FROM `tabBatch Enrollment` WHERE batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({in_str}))")[0][0] or 0
            counts['Assessment'] = frappe.db.sql(f"SELECT COUNT(*) FROM `tabAssessment` WHERE batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({in_str}))")[0][0] or 0
            
            s_cnt = frappe.db.sql(f"SELECT COUNT(*) FROM `tabSession` WHERE batch_id IN (SELECT name FROM `tabBatches` WHERE branch_id IN ({in_str}))")[0][0] or 0
            counts['Session'] = s_cnt
            counts['Weekly Session'] = s_cnt
            
            counts['Change Maker'] = frappe.db.sql(f"SELECT COUNT(*) FROM `tabChange Maker` WHERE niit_registration IN (SELECT name FROM `tabNIIT Registration` WHERE branch_id IN ({in_str}))")[0][0] or 0
            counts['Government Scheme Linkages Student'] = frappe.db.count('Government Scheme Linkages Student', filters={'branch_id': ['in', branches_to_filter]})
            counts['Qualitative Assessment'] = frappe.db.count('Qualitative Assessment', filters={'center': ['in', branches_to_filter]})
        else:
            counts['Branches'] = 0
            for k in ['User', 'Program', 'Batches', 'Assessment Type Mapping', 'Student Outreach', 'NIIT Registration', 'Student Attendance', 'Self Defence', 'Thematic Expert Sessions', 'Thematic Sessions', 'Exposure Visits', 'Batch Enrollment', 'Assessment', 'Session', 'Weekly Session', 'Change Maker', 'Government Scheme Linkages Student', 'Qualitative Assessment']:
                counts[k] = 0
    else:
        counts['Branches'] = frappe.db.count('Branches')
        counts['User'] = frappe.db.count('User')
        counts['Program'] = frappe.db.count('Program')
        counts['Batches'] = frappe.db.count('Batches')
        counts['Assessment Type Mapping'] = frappe.db.count('Assessment Type Mapping')
        counts['Student Outreach'] = frappe.db.count('Student Outreach')
        counts['NIIT Registration'] = frappe.db.count('NIIT Registration')
        counts['Student Attendance'] = frappe.db.count('Student Attendance')
        counts['Self Defence'] = frappe.db.count('Self Defence')
        counts['Thematic Expert Sessions'] = frappe.db.count('Thematic Expert Sessions')
        counts['Thematic Sessions'] = counts['Thematic Expert Sessions']
        counts['Exposure Visits'] = frappe.db.count('Exposure Visits')
        counts['Batch Enrollment'] = frappe.db.count('Batch Enrollment')
        counts['Assessment'] = frappe.db.count('Assessment')
        counts['Session'] = frappe.db.count('Session')
        counts['Weekly Session'] = counts['Session']
        counts['Change Maker'] = frappe.db.count('Change Maker')
        counts['Government Scheme Linkages Student'] = frappe.db.count('Government Scheme Linkages Student')
        counts['Qualitative Assessment'] = frappe.db.count('Qualitative Assessment')

    user_roles = frappe.get_roles(user)
    counts['has_master_access'] = bool(user == "Administrator" or "Samwadini Master" in user_roles)
    return counts"""

    c = re.sub(r"@frappe\.whitelist\(\)\s*def get_dashboard_counts\(selected_branch=None\):.*?(?=@frappe\.whitelist\(\)\s*def get_women_dashboard_counts|\Z)", new_fn + "\n\n", c, flags=re.DOTALL)
    with open(api_path, "w", encoding="utf-8") as f:
        f.write(c)
    print("Replaced get_dashboard_counts in api.py with Branch count fix.")

if __name__ == "__main__":
    fix_api_counts()
