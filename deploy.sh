#!/bin/bash
set -e

# Load NVM (Node Version Manager) environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# If you installed Node via a different method, you can also add the standard path:
export PATH=$PATH:/usr/local/bin:/usr/bin

# PATHS
LOCAL_PROJECT_DIR="$HOME/projs_etc/kareem_sir_research_app"
REMOTE_USER="wasay"
REMOTE_IP="10.0.0.5"
REMOTE_WEB_ROOT="/var/www/kereem_sir/research_app"

cd $LOCAL_PROJECT_DIR

echo "� Step 1: Pulling latest code locally..."
git pull origin main 

echo "�️ Step 2: Building Frontend locally..."
cd frontend
npm install
npm run build

echo "� Step 3: Rsyncing Static Files to 10.0.0.5..."
# This only moves the finished 'dist' folder to the Nginx server
rsync -avz --delete dist/ $REMOTE_USER@$REMOTE_IP:$REMOTE_WEB_ROOT/

echo "� Step 4: Starting Backend Container LOCALLY..."
cd $LOCAL_PROJECT_DIR
# This runs on the home-desktop (Self)
docker compose up -d --build

echo "✅ Done! Frontend is on .5, Backend is running on Self."
