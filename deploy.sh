#!/bin/bash

# Fleet Management System - Linux Server Deployment Script
# This script builds and deploys the application with WhatsApp proxy support

set -e

echo "🚀 Starting deployment process..."

# Configuration
DOMAIN=${1:-"gastrax.smarteksistem.com"}
DEPLOY_DIR="/var/www/gastrax-system"
BACKUP_DIR="/var/backups/gastrax-system"

echo "📋 Deployment Configuration:"
echo "   Domain: $DOMAIN"
echo "   Deploy Directory: $DEPLOY_DIR"
echo "   Backup Directory: $BACKUP_DIR"

# Create backup of existing deployment
if [ -d "$DEPLOY_DIR" ]; then
    echo "📦 Creating backup..."
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
fi

# Install dependencies if needed
echo "📥 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
VITE_API_BASE_URL="https://$DOMAIN" VITE_ENABLE_WHATSAPP=true npm run build

# Create deployment directory
echo "📁 Setting up deployment directory..."
sudo mkdir -p "$DEPLOY_DIR"
sudo mkdir -p "$DEPLOY_DIR/logs"

# Copy built files
echo "📋 Copying application files..."
sudo cp -r dist/* "$DEPLOY_DIR/"
sudo cp zapin-proxy.cjs "$DEPLOY_DIR/"
sudo cp ecosystem.config.cjs "$DEPLOY_DIR/"
sudo cp package.json "$DEPLOY_DIR/"
sudo cp package-lock.json "$DEPLOY_DIR/"

# Copy images folder (IMPORTANT: Required for login background and other assets)
echo "📸 Copying images and assets..."
if [ -d "img" ]; then
    sudo cp -r img "$DEPLOY_DIR/"
    echo "✅ Images copied: $(ls -la img/ | wc -l) files"
    echo "📸 Image files: $(ls img/)"
else
    echo "⚠️ Warning: img folder not found in source!"
fi

# Copy public assets if they exist
if [ -d "public" ]; then
    sudo cp -r public/* "$DEPLOY_DIR/" 2>/dev/null || echo "ℹ️ No additional public assets to copy"
fi

# Update ecosystem config with correct domain
echo "⚙️ Updating configuration..."
sudo sed -i "s/yourdomain.com/$DOMAIN/g" "$DEPLOY_DIR/ecosystem.config.cjs"

# Create environment configuration
echo "📝 Creating environment file..."
sudo tee "$DEPLOY_DIR/.env" > /dev/null << EOF
# Production Environment Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
ALLOWED_ORIGINS=https://$DOMAIN

# Application Settings
APP_NAME=GasTrax Fleet Management
APP_VERSION=1.0.0

# System Configuration - IMPORTANT: Update these with your actual credentials
# EmailJS System Configuration (REQUIRED)
SYSTEM_EMAILJS_SERVICE_ID=service_gzjclqi
SYSTEM_EMAILJS_TEMPLATE_ID=template_pt3ndpf
SYSTEM_EMAILJS_PUBLIC_KEY=3IJlW5x9KGB1VmVr9
SYSTEM_FROM_EMAIL=reminder@smarteksistem.com
SYSTEM_FROM_NAME=GasTrax System - Smartek Sistem Indonesia

# WhatsApp Zapin API System Configuration (REQUIRED)
SYSTEM_ZAPIN_API_KEY=bdya98Gl2nXJ7VAKoANO2NSHurDOrR
SYSTEM_ZAPIN_SENDER=6285691232473

# Telegram Bot System Configuration (OPTIONAL)
SYSTEM_TELEGRAM_BOT_TOKEN=system_telegram_bot_001
SYSTEM_TELEGRAM_CHAT_ID=@gastrax_alerts
EOF

# Install Node.js dependencies for proxy
echo "📦 Installing proxy dependencies..."
cd "$DEPLOY_DIR"
sudo npm install --production

# Set proper permissions
echo "🔒 Setting permissions..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

# Start/restart the proxy service
echo "🔄 Managing proxy service..."
if command -v pm2 &> /dev/null; then
    pm2 delete gastrax-proxy 2>/dev/null || true
    pm2 start ecosystem.config.cjs --env production
    pm2 save
else
    echo "⚠️ PM2 not installed. Installing PM2..."
    sudo npm install -g pm2
    pm2 start ecosystem.config.cjs --env production
    pm2 save
    pm2 startup
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "🔍 Deployment verification:"
echo "🌐 Application deployed to: $DEPLOY_DIR"
echo "📊 Proxy running on: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/health"

# Verify images were deployed
echo ""
echo "📸 Image deployment verification:"
if [ -d "$DEPLOY_DIR/img" ]; then
    echo "✅ Images folder deployed successfully"
    echo "📂 Deployed images: $(ls -la $DEPLOY_DIR/img/ 2>/dev/null | wc -l) files"
    ls -la "$DEPLOY_DIR/img/" 2>/dev/null | head -5
    if [ -f "$DEPLOY_DIR/img/login-bg.png" ]; then
        echo "✅ login-bg.png deployed ($(stat -c%s $DEPLOY_DIR/img/login-bg.png 2>/dev/null || echo '?') bytes)"
    else
        echo "❌ WARNING: login-bg.png not found in deployed images!"
    fi
else
    echo "❌ WARNING: Images folder not deployed!"
fi
echo ""
echo "📋 Next steps:"
echo "   1. Configure nginx to serve the application"
echo "   2. Set up SSL certificate"
echo "   3. Update DNS to point to this server"
echo "   4. Update system credentials in $DEPLOY_DIR/.env"
echo "   5. Test all communication channels"
echo "   6. Verify images are accessible: https://$DOMAIN/img/login-bg.png"
echo ""
echo "🔧 Useful commands:"
echo "   pm2 status          - Check proxy status"
echo "   pm2 logs gastrax-proxy - View proxy logs"
echo "   pm2 restart gastrax-proxy - Restart proxy" 