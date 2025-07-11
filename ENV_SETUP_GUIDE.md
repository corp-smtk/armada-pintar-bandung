# Environment Setup Guide for Local Testing
**GasTrax Fleet Management System**

## 🎯 Overview

This guide will help you set up **real credentials** for local testing so you can send actual emails and WhatsApp messages.

## 📋 Files Created

✅ **`.env.local`** - Client-side environment variables (for React app)
✅ **`.env`** - Server-side environment variables (for proxy server)

## 🔧 Setup Steps

### Step 1: EmailJS Configuration

**1.1 Create EmailJS Account**
- Go to [https://emailjs.com](https://emailjs.com)
- Sign up for a free account
- Verify your email address

**1.2 Add Email Service**
- Click "Email Services" > "Add New Service"
- Choose your email provider (Gmail recommended)
- Follow setup instructions
- **Copy the Service ID** (e.g., `service_abc123`)

**1.3 Create Email Template**
- Click "Email Templates" > "Create New Template"
- Use this template content:

**Subject:** `{{subject}}`

**HTML Content:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1f2937;">{{subject}}</h2>
  
  <p>Dear {{to_name}},</p>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Vehicle:</strong> {{vehicle}}</p>
    <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> {{date}}</p>
    <p style="margin: 5px 0 0 0;"><strong>Days Remaining:</strong> {{days}}</p>
  </div>
  
  <div style="margin: 20px 0;">
    {{message}}
  </div>
  
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
  
  <p style="color: #6b7280; font-size: 14px;">
    Best regards,<br>
    {{from_name}}<br>
    {{company}}
  </p>
</div>
```

- **Copy the Template ID** (e.g., `template_def456`)

**1.4 Get Public Key**
- Go to "Account" > "General"
- **Copy the Public Key** (e.g., `user_ghi789`)

### Step 2: WhatsApp Zapin API Configuration

**2.1 Register at Zapin**
- Go to [https://zapin.my.id](https://zapin.my.id)
- Register for an account
- Purchase API credits if needed

**2.2 Get API Credentials**
- **Copy your API Key**
- **Copy your WhatsApp sender number** (format: 6281234567890)

### Step 3: Telegram Bot Configuration (Optional)

**3.1 Create Telegram Bot**
- Open Telegram and message [@BotFather](https://t.me/botfather)
- Send `/newbot` command
- Follow instructions to create bot
- **Copy the Bot Token**

**3.2 Set Up Chat/Channel**
- Create a Telegram group or channel for alerts
- Add your bot as admin
- **Copy the Chat ID** (for groups: `-123456789`, for channels: `@channel_name`)

### Step 4: Update Environment Variables

**4.1 Edit `.env.local` (Client-side)**
Replace these values in your `.env.local` file:

```bash
VITE_SYSTEM_EMAILJS_SERVICE_ID=service_abc123        # From EmailJS
VITE_SYSTEM_EMAILJS_TEMPLATE_ID=template_def456      # From EmailJS  
VITE_SYSTEM_EMAILJS_PUBLIC_KEY=user_ghi789           # From EmailJS
VITE_SYSTEM_FROM_EMAIL=reminder@smarteksistem.com     # Your business email
VITE_SYSTEM_FROM_NAME=Your Company Name              # Your company name

VITE_SYSTEM_ZAPIN_API_KEY=your_zapin_api_key         # From Zapin
VITE_SYSTEM_ZAPIN_SENDER=6285691232473               # Your WhatsApp number

VITE_SYSTEM_TELEGRAM_BOT_TOKEN=123456:ABC-DEF...     # From BotFather
VITE_SYSTEM_TELEGRAM_CHAT_ID=@your_channel           # Your chat/channel
```

**4.2 Edit `.env` (Server-side)**
Update the same values in your `.env` file:

```bash
SYSTEM_EMAILJS_SERVICE_ID=service_abc123
SYSTEM_EMAILJS_TEMPLATE_ID=template_def456
SYSTEM_EMAILJS_PUBLIC_KEY=user_ghi789
SYSTEM_FROM_EMAIL=reminder@smarteksistem.com
SYSTEM_FROM_NAME=Your Company Name

SYSTEM_ZAPIN_API_KEY=your_zapin_api_key
SYSTEM_ZAPIN_SENDER=6285691232473

SYSTEM_TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
SYSTEM_TELEGRAM_CHAT_ID=@your_channel
```

### Step 5: Test the Configuration

**5.1 Start the Services**
```bash
# Terminal 1: Start the proxy server
node zapin-proxy.cjs

# Terminal 2: Start the React app  
npm run dev
```

**5.2 Test in the Application**
1. Open [http://localhost:8080](http://localhost:8080)
2. Go to **Reminder Management** > **Settings**
3. Click **System Config** tab
4. You should see all services marked as "System Configured"
5. Test each service:
   - **Email**: Go to Email Settings tab and click "Test Email"
   - **WhatsApp**: Go to WhatsApp Settings tab and click "Test WhatsApp"
   - **Telegram**: Go to Telegram Settings tab and click "Test Telegram"

## 🔍 Troubleshooting

### Common Issues

**❌ "Service not configured"**
- Check that environment variables are set correctly
- Restart both servers after changing .env files
- Verify credentials are correct

**❌ Email test fails**
- Verify EmailJS service is active
- Check template variables match exactly
- Ensure email service authentication is working

**❌ WhatsApp test fails**
- Verify Zapin API key is valid and has credits
- Check WhatsApp number format (no + or spaces)
- Ensure sender number is verified with Zapin

**❌ Telegram test fails**
- Verify bot token is correct
- Check that bot is added to the channel/group
- Ensure chat ID format is correct

### Debug Tips

**Check Proxy Server Logs**
```bash
# The proxy server shows detailed logs
node zapin-proxy.cjs

# Look for error messages when testing
```

**Check Browser Console**
- Open Developer Tools (F12)
- Look for error messages in Console tab
- Check Network tab for failed API calls

**Verify Environment Variables**
```bash
# Check if variables are loaded
node -e "console.log(process.env.SYSTEM_EMAILJS_SERVICE_ID)"
```

## 🚀 Next Steps

Once everything is working locally:

1. **Document your setup** - Save your working credentials safely
2. **Test all features** - Create reminders and verify delivery
3. **Prepare for production** - Plan your production deployment
4. **Update deployment configs** - Use these same credentials for production

## 🔒 Security Notes

- ⚠️ **Never commit .env files** to version control
- ⚠️ **Keep credentials secure** and don't share them
- ⚠️ **Use different credentials** for production
- ⚠️ **Regularly rotate API keys** for security

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Verify all credentials are correct
3. Test each service individually
4. Check server and browser logs for errors

Your system is now ready for local testing with real credentials! 🎉 