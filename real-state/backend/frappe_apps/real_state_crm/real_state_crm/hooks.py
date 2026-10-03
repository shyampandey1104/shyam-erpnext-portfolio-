app_name = "real_state_crm"
app_title = "Real State Crm"
app_publisher = "Shyam Pandey"
app_description = "Dream Homes Real Estate CRM"
app_email = "shyampandey1104@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "real_state_crm",
# 		"logo": "/assets/real_state_crm/logo.png",
# 		"title": "Real State Crm",
# 		"route": "/real_state_crm",
# 		"has_permission": "real_state_crm.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/real_state_crm/css/real_state_crm.css"
# app_include_js = "/assets/real_state_crm/js/real_state_crm.js"

# include js, css files in header of web template
# web_include_css = "/assets/real_state_crm/css/real_state_crm.css"
# web_include_js = "/assets/real_state_crm/js/real_state_crm.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "real_state_crm/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "real_state_crm/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
home_page = "crm"
website_route_rules = [
	{"from_route": "/crm/<path:app_path>", "to_route": "crm"},
]

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "real_state_crm.utils.jinja_methods",
# 	"filters": "real_state_crm.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "real_state_crm.install.before_install"
# after_install = "real_state_crm.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "real_state_crm.uninstall.before_uninstall"
# after_uninstall = "real_state_crm.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "real_state_crm.utils.before_app_install"
# after_app_install = "real_state_crm.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "real_state_crm.utils.before_app_uninstall"
# after_app_uninstall = "real_state_crm.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "real_state_crm.notifications.get_notification_config"

# Awesome Bar
# -----------
# Extra search results: list of dicts with label, description, route, index.
# route: ["List", "ToDo"], "/desk/docs/some/page", or "https://example.com"
# awesomebar_search = ["real_state_crm.search.awesomebar_results"]

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"real_state_crm.tasks.all"
# 	],
# 	"daily": [
# 		"real_state_crm.tasks.daily"
# 	],
# 	"hourly": [
# 		"real_state_crm.tasks.hourly"
# 	],
# 	"weekly": [
# 		"real_state_crm.tasks.weekly"
# 	],
# 	"monthly": [
# 		"real_state_crm.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "real_state_crm.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "real_state_crm.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "real_state_crm.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["real_state_crm.utils.before_request"]
# after_request = ["real_state_crm.utils.after_request"]

# Job Events
# ----------
# before_job = ["real_state_crm.utils.before_job"]
# after_job = ["real_state_crm.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"real_state_crm.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

# Translation
# ------------
# List of apps whose translatable strings should be excluded from this app's translations.
# ignore_translatable_strings_from = []

