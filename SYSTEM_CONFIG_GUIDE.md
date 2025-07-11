# System Configuration Guide
**GasTrax Fleet Management System**

## Overview

The GasTrax system now comes with **built-in system configuration** that makes it work out-of-the-box without requiring users to set up their own EmailJS, Zapin WhatsApp, or Telegram accounts. This dramatically improves the user experience while maintaining security and flexibility.

## 🔒 How It Works

### 1. **System Configuration (Default)**
- Pre-configured EmailJS, Zapin WhatsApp, and Telegram credentials
- Stored securely on the server side
- Works immediately without any user setup
- Managed through environment variables

### 2. **User Override (Optional)**
- Users can configure their own credentials if desired
- User credentials take priority over system configuration
- Maintains backward compatibility

### 3. **Automatic Fallback**
- If user configuration fails, system automatically falls back to system config
- Ensures reminders are always delivered
- No interruption in service

## 🛠️ Setting Up System Configuration

### For Production Deployment

### Server-Side Configuration (for Proxy Server)

Create a `.env` file in your server directory with the following variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://yourdomain.com

# EmailJS System Configuration (for proxy server)
SYSTEM_EMAILJS_SERVICE_ID=your_emailjs_service_id
SYSTEM_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
SYSTEM_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
SYSTEM_FROM_EMAIL=noreply@yourdomain.com
SYSTEM_FROM_NAME=GasTrax System - Smartek Sistem Indonesia

# WhatsApp Zapin API System Configuration (for proxy server)
SYSTEM_ZAPIN_API_KEY=your_zapin_api_key
SYSTEM_ZAPIN_SENDER=your_whatsapp_number

# Telegram Bot System Configuration (for proxy server)
SYSTEM_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
SYSTEM_TELEGRAM_CHAT_ID=your_default_telegram_chat
```

### Client-Side Configuration (Optional)

For development or when you want to override system settings in the client, create a `.env.local` file in your project root:

```bash
# Client-side environment variables (prefixed with VITE_)
VITE_SYSTEM_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_SYSTEM_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_SYSTEM_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_SYSTEM_FROM_EMAIL=noreply@yourdomain.com
VITE_SYSTEM_FROM_NAME=GasTrax System - Smartek Sistem Indonesia

VITE_SYSTEM_ZAPIN_API_KEY=your_zapin_api_key
VITE_SYSTEM_ZAPIN_SENDER=your_whatsapp_number

VITE_SYSTEM_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_SYSTEM_TELEGRAM_CHAT_ID=your_default_telegram_chat
```

**Important:** Never commit `.env.local` files with real credentials to version control!

### Setting Up EmailJS System Account

1. **Create EmailJS Account**
   - Go to [EmailJS.com](https://emailjs.com)
   - Create a business account for your organization
   - Verify your email address

2. **Set Up Email Service**
   - Add Gmail, Outlook, or SMTP service
   - Configure authentication
   - Test the service connection

3. **Create Email Template**
   Use this template content for consistent formatting:

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

   **Template Variables:**
   - `to_name`, `to_email`, `from_name`, `subject`
   - `message`, `vehicle`, `date`, `days`
   - `company`, `reply_to`

4. **Get Credentials**
   - Copy Service ID (service_xxxxxxx)
   - Copy Template ID (template_xxxxxxx)
   - Copy Public Key (user_xxxxxxx)

### Setting Up Zapin WhatsApp API

1. **Get Zapin API Access**
   - Visit [Zapin.my.id](https://zapin.my.id)
   - Register for API access
   - Get your API key and sender number

2. **Configure WhatsApp Number**
   - Use a dedicated business WhatsApp number
   - Ensure the number is verified with Zapin
   - Test message sending functionality

### Setting Up Telegram Bot

1. **Create Telegram Bot**
   - Message @BotFather on Telegram
   - Use `/newbot` command
   - Get bot token

2. **Set Up Channel/Group**
   - Create a Telegram channel or group for alerts
   - Add your bot as admin
   - Get chat ID (starts with @ for public channels)

## 🔧 Implementation Details

### Server-Side Security
- API keys stored in environment variables
- Never exposed to client-side code
- Secure proxy server handles all API calls
- Rate limiting and error handling

### Client-Side Integration
- Automatic detection of system vs user configuration
- Seamless fallback mechanism
- Status indicators in UI
- Optional user override

### Proxy Server Features
- `/api/email` - EmailJS proxy endpoint
- `/api/zapin` - WhatsApp proxy endpoint
- `/api/system-config` - Configuration status endpoint
- Health checks and monitoring

## 📊 Benefits

### For Users
- ✅ **Works immediately** - No technical setup required
- ✅ **No confusion** - System works out-of-the-box
- ✅ **Optional customization** - Can use own credentials if desired
- ✅ **Reliable delivery** - Automatic fallback ensures messages are sent

### For Administrators
- ✅ **Centralized management** - Control all communication settings
- ✅ **Secure credentials** - API keys protected on server
- ✅ **Easy deployment** - Single configuration for all users
- ✅ **Cost control** - Use organization's API accounts

### For Developers
- ✅ **Simplified deployment** - Environment-based configuration
- ✅ **Backward compatibility** - Existing user configs still work
- ✅ **Error handling** - Robust fallback mechanisms
- ✅ **Monitoring** - Built-in health checks and logging

## 🚀 Deployment Steps

1. **Set up system accounts** (EmailJS, Zapin, Telegram)
2. **Configure environment variables** on your server
3. **Deploy the application** with the updated code
4. **Test system configuration** using the admin panel
5. **Verify all communication channels** are working
6. **Monitor logs** for any issues

## 🔍 Monitoring and Troubleshooting

### Health Checks
- Visit `/health` endpoint for service status
- Check `/api/system-config` for configuration status
- Monitor server logs for errors

### Common Issues
- **EmailJS errors**: Check service and template IDs
- **WhatsApp failures**: Verify Zapin API key and sender
- **Telegram issues**: Confirm bot token and chat ID
- **Environment variables**: Ensure all required vars are set

### Testing
- Use the System Config panel in the application
- Send test messages through each channel
- Verify fallback behavior with invalid user configs

## 📝 Security Considerations

- Never commit API keys to version control
- Use strong, unique API keys for production
- Regularly rotate credentials
- Monitor API usage and costs
- Implement rate limiting
- Use HTTPS for all communications

This system configuration approach provides the best balance of usability, security, and flexibility for the GasTrax fleet management system. 