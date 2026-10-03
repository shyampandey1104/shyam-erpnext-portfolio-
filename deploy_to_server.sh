#!/bin/bash

# ========================================
# Frappe Bench Setup Script - Remote Server
# Server: 103.192.198.227
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frappe Bench Setup - Remote Server${NC}"
echo -e "${GREEN}========================================${NC}"

# Variables
SITE_NAME="samwadini.com"
DB_NAME="_544fdc92f18494e6"
DB_PASSWORD="wwv2HF6eUISEiiTK"
BENCH_PATH="/home/frappe/frappe-bench"
APPS=("frappe" "erpnext" "hrms" "samwadini")

# Step 1: Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root!${NC}"
   exit 1
fi

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-dev \
    python3-pip \
    git \
    curl \
    wget \
    redis-server \
    mariadb-server \
    mariadb-client \
    nodejs \
    npm \
    wkhtmltopdf \
    libjpeg62-turbo \
    libopenjp2-7 \
    libtiff5 \
    fontconfig \
    libfreetype6 \
    libjasper1 \
    libpng16-16 \
    libx11-6 \
    xfonts-75dpi \
    xfonts-encodings \
    xfonts-utils

echo -e "${YELLOW}Step 3: Creating frappe user...${NC}"
if ! id -u frappe > /dev/null 2>&1; then
    useradd -m -s /bin/bash frappe
    echo "frappe user created"
else
    echo "frappe user already exists"
fi

echo -e "${YELLOW}Step 4: Creating bench directory...${NC}"
mkdir -p $BENCH_PATH
chown frappe:frappe $BENCH_PATH

echo -e "${YELLOW}Step 5: Initializing Frappe Bench...${NC}"
sudo -u frappe bash << 'SUDOEOF'
cd /home/frappe/frappe-bench

# Create virtual environment
python3.11 -m venv env
source env/bin/activate

# Install frappe-bench
pip install --upgrade pip setuptools wheel
pip install frappe-bench

# Initialize bench
bench init --frappe-branch version-15 . --no-procfile

echo "Bench initialized successfully"
SUDOEOF

echo -e "${YELLOW}Step 6: Creating new site...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

# Create site with custom database name
bench new-site $SITE_NAME \
    --db-type mariadb \
    --admin-password Admin@12345 \
    --no-mariadb-user

echo "Site created successfully"
SUDOEOF

echo -e "${YELLOW}Step 7: Configuring site_config.json...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH

cat > sites/$SITE_NAME/site_config.json << 'JSONEOF'
{
    "db_name": "$DB_NAME",
    "db_password": "$DB_PASSWORD",
    "db_type": "mariadb",
    "developer_mode": 1,
    "server_script_enabled": 1,
    "enable_server_scripts": 1,
    "user_type_doctype_limit": {
        "employee_self_service": 40
    }
}
JSONEOF

echo "site_config.json configured"
SUDOEOF

echo -e "${YELLOW}Step 8: Configuring common_site_config.json...${NC}"
sudo -u frappe bash << 'SUDOEOF'
cd /home/frappe/frappe-bench

cat > sites/common_site_config.json << 'JSONEOF'
{
    "background_workers": 2,
    "default_site": "samwadini.com",
    "developer_mode": 1,
    "frappe_user": "frappe",
    "gunicorn_workers": 4,
    "live_reload": true,
    "redis_cache": "redis://127.0.0.1:6379/1",
    "redis_queue": "redis://127.0.0.1:6379/2",
    "redis_socketio": "redis://127.0.0.1:6379/3",
    "server_script_enabled": 1,
    "enable_server_scripts": 1,
    "socketio_port": 9000,
    "webserver_port": 8000,
    "allow_cors": "*"
}
JSONEOF

echo "common_site_config.json configured"
SUDOEOF

echo -e "${YELLOW}Step 9: Getting apps...${NC}"
sudo -u frappe bash << 'SUDOEOF'
cd /home/frappe/frappe-bench
source env/bin/activate

# Get necessary apps
bench get-app erpnext --branch version-15
bench get-app hrms --branch master
bench get-app samwadini https://github.com/Shyamkumar-Pandey/samwadini.git || echo "samwadini app not found, skipping"

echo "Apps fetched"
SUDOEOF

echo -e "${YELLOW}Step 10: Installing apps on site...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench --site $SITE_NAME install-app frappe
bench --site $SITE_NAME install-app erpnext
bench --site $SITE_NAME install-app hrms
bench --site $SITE_NAME install-app samwadini 2>/dev/null || echo "samwadini installation note: may need manual setup"

echo "Apps installed"
SUDOEOF

echo -e "${YELLOW}Step 11: Running migrations...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench --site $SITE_NAME migrate

echo "Migrations completed"
SUDOEOF

echo -e "${YELLOW}Step 12: Building assets...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench build

echo "Assets built"
SUDOEOF

echo -e "${YELLOW}Step 13: Clearing caches...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench clear-cache
bench clear-website-cache

echo "Caches cleared"
SUDOEOF

echo -e "${YELLOW}Step 14: Setting up Procfile...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench setup procfile

echo "Procfile created"
SUDOEOF

echo -e "${YELLOW}Step 15: Setting up Supervisor (for production)...${NC}"
sudo -u frappe bash << SUDOEOF
cd $BENCH_PATH
source env/bin/activate

bench setup supervisor --user frappe 2>/dev/null || echo "Supervisor setup - may need manual configuration"

echo "Supervisor configured"
SUDOEOF

# Create systemd service for Redis
echo -e "${YELLOW}Step 16: Setting up Redis...${NC}"
systemctl enable redis-server
systemctl restart redis-server

# Fix permissions
echo -e "${YELLOW}Step 17: Fixing permissions...${NC}"
chown -R frappe:frappe $BENCH_PATH
chmod -R 755 $BENCH_PATH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Site Details:${NC}"
echo "  Site Name: $SITE_NAME"
echo "  Database: $DB_NAME"
echo "  Bench Path: $BENCH_PATH"
echo ""
echo -e "${YELLOW}Developer Mode: ${GREEN}ENABLED${NC}"
echo -e "${YELLOW}Server Scripts: ${GREEN}ENABLED${NC}"
echo ""
echo -e "${YELLOW}Access your site:${NC}"
echo "  http://$SITE_NAME:8000"
echo "  http://103.192.198.227:8000"
echo ""
echo -e "${YELLOW}Start development:${NC}"
echo "  cd $BENCH_PATH"
echo "  source env/bin/activate"
echo "  bench start"
echo ""
echo -e "${YELLOW}Start production (with Supervisor):${NC}"
echo "  sudo systemctl start supervisor"
echo ""
echo -e "${YELLOW}Admin Login:${NC}"
echo "  Username: Administrator"
echo "  Password: Admin@12345"
echo ""
echo -e "${GREEN}========================================${NC}"
