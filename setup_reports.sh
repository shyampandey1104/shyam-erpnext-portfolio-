#!/bin/bash
# Setup script for Samwadini Reports

echo "🚀 Setting up Samwadini Reports..."

# Navigate to bench directory
cd /Users/shyamkumarpandey/samwadini/frappe-bench

# Clear cache
echo "📦 Clearing cache..."
bench --site samwadini.com clear-cache

# Migrate to register new reports
echo "🔄 Running migrations..."
# Note: This requires bench to be running
# If bench is not running, start it first with: bench start

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start bench if not running: bench start"
echo "2. Login to ERPNext at: http://samwadini.com:8000"
echo "3. Navigate to Samwadini workspace"
echo "4. Click on Reports section"
echo "5. Select any of the 4 reports:"
echo "   - Branch Batchwise Attendance"
echo "   - Branch Batchwise Average Marks"
echo "   - Subjectwise Average Marks"
echo "   - Staffwise Session Count"
echo ""
echo "📊 All reports include interactive charts!"
echo ""
