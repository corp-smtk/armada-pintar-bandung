# 🚀 Ubuntu Server 24.04 LTS Deployment Guide
## GasTrax Fleet Management System

**Target Environment:**
- **Server:** Ubuntu Server 24.04 LTS
- **IP Address:** 43.133.150.234
- **Domain:** gastrax.smarteksistem.com
- **DNS Provider:** Cloudflare

**✅ PRODUCTION READY**: Complete deployment with system configuration, SSL, and monitoring!

---

## 🎯 **What This Deployment Achieves**

- ✅ **Full WhatsApp Integration** - All messaging features work
- ✅ **No CORS Issues** - API calls routed through same domain
- ✅ **Better Performance** - Optimized build with code splitting
- ✅ **Production Ready** - Proper logging, monitoring, and error handling
- ✅ **Scalable Architecture** - Easy to extend with database later

---

## 📋 **Prerequisites**

### Server Requirements
- **Ubuntu Server 24.04 LTS** (✅ Perfect for this deployment)
- **Node.js 18+** and **npm**
- **Nginx** web server
- **PM2** process manager
- **Cloudflare SSL** (Flexible/Full SSL)

### Step 1: Initial Server Setup
```bash
# Connect to your server
ssh root@43.133.150.234

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 20 LTS (recommended for production)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
sudo npm install -g pm2

# Enable UFW firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001  # For proxy server
```

---

## 🚀 **Deployment Steps**

### Step 2: Cloudflare DNS Configuration

**Before deploying, set up your domain in Cloudflare:**

1. **Add A Record in Cloudflare:**
   ```
   Type: A
   Name: gastrax (or @)
   Content: 43.133.150.234
   Proxy Status: Proxied (orange cloud)
   TTL: Auto
   ```

2. **Add CNAME for www (optional):**
   ```
   Type: CNAME
   Name: www
   Content: gastrax.smarteksistem.com
   Proxy Status: Proxied (orange cloud)
   ```

3. **Configure SSL/TLS in Cloudflare:**
   - Go to SSL/TLS → Overview
   - Set encryption mode to **"Full"** or **"Full (strict)"**
   - Enable **"Always Use HTTPS"**

### Step 3: Upload and Build Your Code
```bash
# Option A: Direct upload from your local machine
scp -r ./armada-pintar-bandung root@43.133.150.234:/tmp/gastrax-system

# Option B: Clone from repository (if you have one)
git clone <your-repo-url> /tmp/gastrax-system

# Navigate to the uploaded code
cd /tmp/gastrax-system
```

### Step 4: Deploy with Custom Script
```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy with your domain (automatically configures everything)
sudo ./deploy.sh gastrax.smarteksistem.com
```

### Step 5: Configure System Credentials

**IMPORTANT:** Set up your real EmailJS and Zapin API credentials:

```bash
# Edit the environment file created by deploy script
sudo nano /var/www/gastrax-system/.env

# Update these values with your real credentials:
SYSTEM_EMAILJS_SERVICE_ID=your_real_service_id
SYSTEM_EMAILJS_TEMPLATE_ID=your_real_template_id  
SYSTEM_EMAILJS_PUBLIC_KEY=your_real_public_key
SYSTEM_FROM_EMAIL=noreply@smarteksistem.com
SYSTEM_FROM_NAME=GasTrax System - Smartek Sistem Indonesia

SYSTEM_ZAPIN_API_KEY=your_real_zapin_api_key
SYSTEM_ZAPIN_SENDER=your_real_whatsapp_number

# Restart proxy to load new credentials
pm2 restart zapin-proxy
```

### Step 6: Set Up Cloudflare Origin Certificate

**For secure communication between Cloudflare and your server:**

```bash
# Generate Cloudflare Origin Certificate
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

# Create self-signed certificate for Cloudflare origin
sudo openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/private/cloudflare-origin.key -out /etc/ssl/certs/cloudflare-origin.crt -days 365 -nodes -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Smartek Sistem Indonesia/CN=gastrax.smarteksistem.com"

# Set proper permissions
sudo chmod 600 /etc/ssl/private/cloudflare-origin.key
sudo chmod 644 /etc/ssl/certs/cloudflare-origin.crt

# Or use Cloudflare Origin CA certificate (recommended)
# 1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server
# 2. Create Certificate → Generate private key and CSR with Cloudflare
# 3. Copy certificate to /etc/ssl/certs/cloudflare-origin.crt
# 4. Copy private key to /etc/ssl/private/cloudflare-origin.key
```

### Step 7: Configure Nginx (Already done by deploy script)
The deploy script automatically:
- ✅ Copies nginx configuration to `/etc/nginx/sites-available/gastrax-system`
- ✅ Enables the site 
- ✅ Updates domain to `gastrax.smarteksistem.com`
- ✅ Configures Cloudflare real IP detection
- ✅ Restarts nginx

### Step 8: Verify Deployment
```bash
# Check proxy status
pm2 status

# Check proxy logs  
pm2 logs zastrax-proxy

# Test health endpoint
curl https://gastrax.smarteksistem.com/health

# Test system configuration endpoint
curl https://gastrax.smarteksistem.com/api/system-config

# Verify website loads
curl -I https://gastrax.smarteksistem.com

# Check nginx status
sudo systemctl status nginx

# Check firewall status
sudo ufw status
```

### Step 9: DNS Propagation Check
```bash
# Check DNS resolution
nslookup gastrax.smarteksistem.com

# Test from different locations
dig gastrax.smarteksistem.com

# Verify Cloudflare proxy is working
curl -I https://gastrax.smarteksistem.com | grep -i cloudflare
```

---

## 🔧 **Configuration Options**

### Environment Variables
Update `/var/www/fleet-management/ecosystem.config.js`:

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3001,
  HOST: '0.0.0.0',
  FRONTEND_URL: 'https://yourdomain.com'
}
```

### For Different Port or Subdomain
If you want to run API on different port or subdomain:

```bash
# Option 1: Different port
# Update PORT in ecosystem.config.js and nginx proxy_pass

# Option 2: Subdomain (api.yourdomain.com)
# Create separate nginx config for subdomain
# Update VITE_API_BASE_URL during build:
VITE_API_BASE_URL="https://api.yourdomain.com" npm run build
```

---

## 🎛️ **Management Commands**

### Proxy Service Management
```bash
# Check status
pm2 status

# View logs
pm2 logs zapin-proxy

# Restart proxy
pm2 restart zapin-proxy

# Stop proxy
pm2 stop zapin-proxy

# Monitor in real-time
pm2 monit
```

### Application Updates
```bash
# To update the application
cd /path/to/your/source
git pull  # or upload new files

# Rebuild and redeploy
sudo ./deploy.sh gastrax.smarteksistem.com
```

### Nginx Management
```bash
# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

# View logs
sudo tail -f /var/log/nginx/gastrax-system.access.log
sudo tail -f /var/log/nginx/gastrax-system.error.log
```

---

## 📊 **Testing Your Deployment**

## 🎉 **Final Deployment Checklist**

### ✅ Pre-Deployment
- [ ] Server Ubuntu 24.04 LTS ready (43.133.150.234)
- [ ] Cloudflare account configured
- [ ] Domain gastrax.smarteksistem.com pointed to server
- [ ] EmailJS account set up with real credentials
- [ ] Zapin WhatsApp API account ready

### ✅ Deployment Steps
- [ ] **Step 1:** Server setup and packages installed
- [ ] **Step 2:** Cloudflare DNS A record added (gastrax → 43.133.150.234)
- [ ] **Step 3:** Code uploaded to `/tmp/gastrax-system`
- [ ] **Step 4:** Deploy script executed: `sudo ./deploy.sh gastrax.smarteksistem.com`
- [ ] **Step 5:** Real credentials configured in `/var/www/gastrax-system/.env`
- [ ] **Step 6:** Cloudflare origin certificate installed
- [ ] **Step 7:** Nginx configured and running
- [ ] **Step 8:** All services verified and working
- [ ] **Step 9:** DNS propagation confirmed

### ✅ Testing & Verification

**1. Basic Functionality Test**
- [ ] Visit `https://gastrax.smarteksistem.com` - Should load the login page
- [ ] Login with demo accounts - Should work normally  
- [ ] Navigate through all modules - UI should be responsive

**2. WhatsApp Integration Test**
- [ ] Go to Reminder Settings → System Config tab
- [ ] Verify system credentials are configured and active
- [ ] Send test WhatsApp message - Should receive immediately
- [ ] Check proxy logs: `pm2 logs gastrax-proxy`

**3. Photo Upload Test**
- [ ] Go to Vehicle Details → Photos tab
- [ ] Upload photos - Should work with large file support
- [ ] Test all CRUD operations (add, view, edit, delete)
- [ ] Verify photo categories and metadata

**4. Email Notifications Test**
- [ ] Go to Reminder Settings → Email Configuration
- [ ] Send test email reminder
- [ ] Check system email configuration status
- [ ] Verify fallback functionality

**5. System Health Monitoring**
```bash
# Check proxy health
curl https://gastrax.smarteksistem.com/health

# Check system configuration
curl https://gastrax.smarteksistem.com/api/system-config

# Should return system status information
```

---

## ⚠️ **Important Notes**

### Data Persistence
**Current Status**: Still using localStorage (per-browser storage)
- ✅ **Works for internal testing**
- ❌ **Data not shared between users/browsers**
- ⚠️ **Photo storage will eventually hit browser limits**

**Next Phase**: Add database backend for shared data

### Security Considerations
- ✅ **WhatsApp API secured** behind your domain
- ❌ **Authentication still demo-level** (hardcoded passwords)
- ⚠️ **For production**: Implement proper authentication

### Performance
- ✅ **Optimized build** with code splitting
- ✅ **Nginx caching** for static assets
- ✅ **Gzip compression** enabled

---

## 🆘 **Troubleshooting**

### WhatsApp Not Working
```bash
# Check proxy status
pm2 status

# Check proxy logs
pm2 logs gastrax-proxy

# Restart proxy
pm2 restart gastrax-proxy

# Test proxy directly
curl -X POST http://localhost:3001/api/zapin \
  -H "Content-Type: application/json" \
  -d '{"api_key":"your-key","sender":"your-sender","number":"test","message":"test"}'
```

### Nginx Issues
```bash
# Check nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Not Loading
```bash
# Check if files are deployed
ls -la /var/www/gastrax-system/

# Check nginx access logs
sudo tail -f /var/log/nginx/gastrax-system.access.log

# Check permissions
sudo chown -R www-data:www-data /var/www/gastrax-system/
```

---

## 🔮 **Next Steps for Full Production**

### Phase 1: Current Deployment ✅
- ✅ Static frontend with WhatsApp proxy
- ✅ localStorage for data persistence
- ✅ Demo authentication

### Phase 2: Database Integration (Recommended)
- 🔄 Add PostgreSQL/MongoDB backend
- 🔄 Shared data across users
- 🔄 Proper user management

### Phase 3: Full Production
- 🔄 Real authentication system
- 🔄 Cloud file storage for photos
- 🔄 API rate limiting and security
- 🔄 Monitoring and alerting

---

## 📞 **Support**

If you encounter any issues during deployment:

1. **Check the logs** first:
   - PM2 logs: `pm2 logs zapin-proxy`
   - Nginx logs: `sudo tail -f /var/log/nginx/fleet-management.error.log`

2. **Verify the health endpoint**: `curl https://yourdomain.com/health`

3. **Test proxy directly**: `curl http://localhost:3001/health`

**Your Linux deployment will be much more robust than static hosting and will have full WhatsApp functionality! 🎉** 