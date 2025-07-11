# 🚀 DEPLOYMENT READY - GasTrax System

## 📋 Deployment Summary
- **Target Server**: Ubuntu Server 24.04 LTS 64bit
- **Public IP**: 43.133.150.234
- **Domain**: gastrax.smarteksistem.com (via Cloudflare DNS)
- **Branch**: gasfleet-internal-test

## ✅ Pre-Deployment Checklist

### 1. Configuration Files Ready
- ✅ `deploy.sh` - Configured for gastrax.smarteksistem.com
- ✅ `ecosystem.config.js` - PM2 configuration ready
- ✅ `nginx.conf` - Nginx configuration with Cloudflare support
- ✅ `zapin-proxy.cjs` - WhatsApp proxy service
- ✅ Environment variables configured in deploy.sh

### 2. Git Repository Status
- Current branch: `gasfleet-internal-test`
- Modified files ready for commit:
  - ENV_SETUP_GUIDE.md
  - LINUX_DEPLOYMENT_GUIDE.md
  - deploy.sh
  - package.json
  - zapin-proxy.cjs

## 🔧 Final Steps Before Push

### Step 1: Create Local .env (for testing)
Create `.env` file in project root:
```bash
# Development Environment Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:5173

# System Configuration
SYSTEM_EMAILJS_SERVICE_ID=service_gzjclqi
SYSTEM_EMAILJS_TEMPLATE_ID=template_pt3ndpf
SYSTEM_EMAILJS_PUBLIC_KEY=3IJlW5x9KGB1VmVr9
SYSTEM_FROM_EMAIL=reminder@smarteksistem.com
SYSTEM_FROM_NAME=GasTrax System - Smartek Sistem Indonesia

# WhatsApp Zapin API System Configuration
SYSTEM_ZAPIN_API_KEY=bdya98Gl2nXJ7VAKoANO2NSHurDOrR
SYSTEM_ZAPIN_SENDER=6285691232473

# Telegram Bot System Configuration
SYSTEM_TELEGRAM_BOT_TOKEN=system_telegram_bot_001
SYSTEM_TELEGRAM_CHAT_ID=@gastrax_alerts
```

### Step 2: Test Locally (Optional)
```powershell
# Test the proxy
node zapin-proxy.cjs

# Test the frontend build
npm run build
```

### Step 3: Commit and Push
```powershell
git add .
git commit -m "feat: prepare deployment for gastrax.smarteksistem.com production server"
git push origin gasfleet-internal-test
```

## 🖥️ Server Deployment Commands

### On Ubuntu Server (43.133.150.234):

#### 1. Initial Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

#### 2. Clone and Deploy
```bash
# Clone repository
cd /tmp
git clone https://github.com/your-repo/armada-pintar-bandung.git
cd armada-pintar-bandung
git checkout gasfleet-internal-test

# Run deployment script
sudo chmod +x deploy.sh
sudo ./deploy.sh gastrax.smarteksistem.com
```

#### 3. Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/gastrax-system
sudo ln -s /etc/nginx/sites-available/gastrax-system /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 4. SSL Certificate Setup (Cloudflare Origin)
```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

# Generate Cloudflare Origin Certificate (follow Cloudflare dashboard)
# Upload certificate files:
# - cloudflare-origin.crt to /etc/ssl/certs/
# - cloudflare-origin.key to /etc/ssl/private/

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/cloudflare-origin.crt
sudo chmod 600 /etc/ssl/private/cloudflare-origin.key
```

#### 5. Configure Firewall
```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 🌐 Cloudflare DNS Configuration

### A Record Setup:
- **Type**: A
- **Name**: gastrax.smarteksistem.com
- **Content**: 43.133.150.234
- **Proxy Status**: 🟠 Proxied (Orange Cloud)

### SSL/TLS Settings:
- **SSL/TLS Mode**: Full (strict)
- **Origin Server**: Generate certificate for server

## 🔍 Post-Deployment Verification

### Health Checks:
```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs gastrax-proxy

# Check nginx status
sudo systemctl status nginx

# Test endpoints
curl http://localhost:3001/health
curl https://gastrax.smarteksistem.com/health
```

### Application URLs:
- **Main Application**: https://gastrax.smarteksistem.com
- **Health Check**: https://gastrax.smarteksistem.com/health
- **API Base**: https://gastrax.smarteksistem.com/api/

## 🔧 Environment Configuration

Production environment is automatically configured in `/var/www/gastrax-system/.env` with:
- EmailJS credentials
- WhatsApp Zapin API credentials  
- Telegram bot configuration
- Production settings

## 📝 Maintenance Commands

```bash
# Restart proxy service
pm2 restart gastrax-proxy

# Update application
cd /tmp && git pull origin gasfleet-internal-test
sudo ./deploy.sh gastrax.smarteksistem.com

# View logs
pm2 logs gastrax-proxy
sudo tail -f /var/log/nginx/gastrax-system.access.log
sudo tail -f /var/log/nginx/gastrax-system.error.log
```

## 🚨 Important Notes

1. **API Key Validity**: Verify Zapin API key `bdya98Gl2nXJ7VAKoANO2NSHurDOrR` is active
2. **EmailJS Config**: Test email functionality after deployment
3. **Cloudflare**: Ensure SSL/TLS is set to "Full (strict)" mode
4. **Monitoring**: Set up monitoring for PM2 process and nginx
5. **Backups**: Deployment script automatically creates backups in `/var/backups/gastrax-system/`

## ✅ Ready for Deployment!

All configuration files are prepared and ready for production deployment to the Ubuntu server. 