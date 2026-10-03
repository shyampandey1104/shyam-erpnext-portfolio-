# ERPNext Reports Created for Samwadini

## Overview
Created 4 comprehensive reports with interactive charts for the Samwadini ERPNext application.

---

## 1. Branch Batchwise Attendance Report

**Location:** `samwadini/samwadini/report/branch_batchwise_attendance/`

**Purpose:** Track attendance across branches and batches

**Features:**
- Shows total sessions, students, present/absent counts
- Calculates attendance percentage
- **Chart Type:** Stacked Bar Chart (Green for Present, Red for Absent)

**Filters:**
- From Date / To Date
- Branch
- Batch

**Columns:**
- Branch
- Batch
- Total Sessions
- Total Students
- Present Count
- Absent Count
- Attendance %

---

## 2. Branch Batchwise Average Marks Report

**Location:** `samwadini/samwadini/report/branch_batchwise_average_marks/`

**Purpose:** Analyze average marks performance across branches and batches

**Features:**
- Shows average scores, percentages, highest and lowest scores
- Breakdown by subject
- **Chart Type:** Bar Chart (Blue bars showing average percentage)

**Filters:**
- From Date / To Date
- Branch
- Batch
- Subject
- Assessment Type (Pretest/Posttest)

**Columns:**
- Branch
- Batch
- Subject
- Total Students
- Total Assessments
- Average Score
- Average %
- Highest Score
- Lowest Score

---

## 3. Subjectwise Average Marks Report

**Location:** `samwadini/samwadini/report/subjectwise_average_marks/`

**Purpose:** Compare performance across different subjects

**Features:**
- Shows pretest vs posttest averages
- Calculates improvement percentage
- **Chart Type:** Mixed Chart (Bars for Pretest/Posttest, Line for Overall)

**Filters:**
- From Date / To Date
- Subject
- Branch
- Batch

**Columns:**
- Subject
- Total Students
- Total Assessments
- Pretest Avg %
- Posttest Avg %
- Overall Avg %
- Improvement %
- Highest Score
- Lowest Score

**Chart Colors:**
- Yellow: Pretest Average
- Green: Posttest Average
- Blue: Overall Average (Line)

---

## 4. Staffwise Session Count Report

**Location:** `samwadini/samwadini/report/staffwise_session_count/`

**Purpose:** Track facilitator/staff workload and session statistics

**Features:**
- Shows total sessions conducted by each facilitator
- Calculates total hours and average session duration
- Shows subjects taught and batches handled
- **Chart Type:** Mixed Chart (Bars for Sessions, Line for Hours)

**Filters:**
- From Date / To Date
- Facilitator
- Subject
- Batch
- Branch

**Columns:**
- Facilitator
- Facilitator Name
- Total Sessions
- Total Hours
- Subjects Taught
- Batches Handled
- Avg Session Duration (hrs)

**Chart Colors:**
- Teal: Total Sessions (Bars)
- Orange: Total Hours (Line)

---

## How to Access Reports

1. **Start your bench** (if not already running):
   ```bash
   cd /Users/shyamkumarpandey/samwadini/frappe-bench
   bench start
   ```

2. **Login to ERPNext** at `http://samwadini.com:8000`

3. **Navigate to Reports:**
   - Go to **Samwadini** workspace
   - Click on **Reports** section
   - You should see all 4 reports listed:
     - Branch Batchwise Attendance
     - Branch Batchwise Average Marks
     - Subjectwise Average Marks
     - Staffwise Session Count

4. **View a Report:**
   - Click on any report name
   - Apply filters as needed
   - Click **Refresh** to generate the report
   - The chart will appear above the data table

---

## Technical Details

### Report Structure
Each report consists of:
- **`.json`** - Report metadata and configuration
- **`.py`** - Python script with data fetching and chart logic
- **`.js`** - JavaScript filter definitions
- **`__init__.py`** - Python package marker

### Chart Types Used
1. **Bar Chart** - For attendance and average marks comparison
2. **Mixed Chart (Bar + Line)** - For showing multiple metrics together
3. **Stacked Bar Chart** - For present/absent attendance visualization

### Data Sources
- **Session DocType** - For session and attendance data
- **Assessment DocType** - For marks and performance data
- **Batches DocType** - For batch information
- **Branches DocType** - For branch information
- **Subject DocType** - For subject information
- **User DocType** - For facilitator information

---

## Next Steps

1. **Start the bench** to make reports accessible
2. **Add sample data** if needed to test reports
3. **Customize reports** if you need additional fields or filters
4. **Add to workspace** - Reports should automatically appear in the Samwadini workspace

---

## Notes

- All reports use **Script Report** type for maximum flexibility
- Charts are interactive and responsive
- Reports support date range filtering
- All reports respect ERPNext's role-based permissions
- Reports show submitted documents only (docstatus = 1)

---

**Created:** December 12, 2025
**Module:** Samwadini
**Report Type:** Script Report with Charts
