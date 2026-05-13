#!/bin/bash
set -euo pipefail

# SnappyFresh Safe Deploy - BUILD ONLY + UPLOAD
# No server-side commands - safe for shared servers with multiple sites
# Next.js 15.5.14 with ISR, Image Optimization, and Fast Refresh Fixes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
SERVER_IP="169.239.182.80"
SERVER_USER="root"
REMOTE_PATH="/var/www/snappyfresh"
LOCAL_PROJECT="$SCRIPT_DIR"
DOMAIN="snappyfresh.net"

echo ""
echo "========================================"
echo "SnappyFresh Production Deploy (Safe)"
echo "========================================"
echo ""
echo "Server:       ${SERVER_USER}@${SERVER_IP}"
echo "Path:         ${REMOTE_PATH}"
echo "Domain:       ${DOMAIN}"
echo ""

# ============================================================================
# STEP 1: VALIDATE SSH CONNECTION
# ============================================================================
echo "→ Step 1: Validating SSH connection..."
if ! ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_IP} "echo 'OK'" > /dev/null 2>&1; then
    echo "✗ Cannot connect to ${SERVER_USER}@${SERVER_IP}"
    exit 1
fi
echo "✓ SSH connection OK"

# ============================================================================
# STEP 2: BUILD PRODUCTION LOCALLY
# ============================================================================
echo ""
echo "→ Step 2: Building optimized production bundle..."
cd "$LOCAL_PROJECT"

# Clean previous builds
rm -rf .next
rm -rf node_modules/.cache

# Export production environment
export NODE_ENV=production
export NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://yomilk.erpona.com:8092/api/"}
export NEXT_PUBLIC_IMAGE_CDN=${NEXT_PUBLIC_IMAGE_CDN:-"https://yomilk.erpona.com:3330"}

# Ensure dependencies installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --legacy-peer-deps 2>&1 | tail -3
fi

# Build
echo "Building Next.js bundle..."
npm run build 2>&1 | tail -15

# Verify build
if [ ! -d ".next" ]; then
    echo "✗ Build failed - .next not created"
    exit 1
fi

BUILD_SIZE=$(du -sh .next | cut -f1)
JS_FILES=$(find .next/static/chunks -name "*.js" 2>/dev/null | wc -l || echo "?")
echo "✓ Build complete (${BUILD_SIZE}, ${JS_FILES} JS chunks)"

# ============================================================================
# STEP 3: CREATE SERVER DIRECTORY (IF NEEDED)
# ============================================================================
echo ""
echo "→ Step 3: Preparing server directory..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_PATH}" || true
echo "✓ Directory ready"

# ============================================================================
# STEP 4: UPLOAD OPTIMIZED BUILD VIA RSYNC
# ============================================================================
echo ""
echo "→ Step 4: Uploading optimized build to server..."
echo "Syncing .next, package.json, and source code..."
echo ""

rsync -az --progress --stats \
    --exclude='.git' \
    --exclude='.github' \
    --exclude='.gitignore' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='.env.*.local' \
    --exclude='node_modules' \
    --exclude='.next/cache' \
    --exclude='__tests__' \
    --exclude='.turbo' \
    --exclude='*.md' \
    --exclude='deploy-to-server.sh' \
    --exclude='.DS_Store' \
    "$LOCAL_PROJECT/" "${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/" 2>&1 | tail -20

echo "✓ Build uploaded successfully"

# ============================================================================
# DEPLOYMENT COMPLETE
# ============================================================================
echo ""
echo "========================================"
echo "✓ DEPLOYMENT COMPLETE"
echo "========================================"
echo ""
echo "What was done:"
echo "  ✓ Built optimized production bundle"
echo "  ✓ Uploaded to ${REMOTE_PATH}/"
echo ""
echo "Next: YOU need to manually:"
echo "  1. SSH to server: ssh ${SERVER_USER}@${SERVER_IP}"
echo "  2. Go to app: cd ${REMOTE_PATH}"
echo "  3. Install deps: npm ci --legacy-peer-deps"
echo "  4. Create .env.local with production settings"
echo "  5. Start server: npm start (or use PM2/supervisor)"
echo ""
echo "Server Access:"
echo "  • SSH:   ssh ${SERVER_USER}@${SERVER_IP}"
echo "  • Path:  ${REMOTE_PATH}"
echo "  • Port:  3000 (configure nginx/proxy yourself)"
echo ""
echo "Uploaded files are ready at:"
echo "  ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}"
echo ""
