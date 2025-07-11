// Load environment variables from .env file
require('dotenv').config();

// Debug: Log which environment variables are loaded (for troubleshooting)
console.log('🔧 Environment variables loaded:');
console.log('  EMAIL CONFIG:');
console.log(`    SYSTEM_EMAILJS_SERVICE_ID: ${process.env.SYSTEM_EMAILJS_SERVICE_ID ? 'Set ✅' : 'Not set ❌'}`);
console.log(`    SYSTEM_EMAILJS_TEMPLATE_ID: ${process.env.SYSTEM_EMAILJS_TEMPLATE_ID ? 'Set ✅' : 'Not set ❌'}`);
console.log(`    SYSTEM_EMAILJS_PUBLIC_KEY: ${process.env.SYSTEM_EMAILJS_PUBLIC_KEY ? 'Set ✅' : 'Not set ❌'}`);
console.log(`    SYSTEM_FROM_EMAIL: ${process.env.SYSTEM_FROM_EMAIL || 'Using default: reminder@smarteksistem.com'}`);
console.log('  WHATSAPP CONFIG:');
console.log(`    SYSTEM_ZAPIN_API_KEY: ${process.env.SYSTEM_ZAPIN_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
console.log(`    SYSTEM_ZAPIN_SENDER: ${process.env.SYSTEM_ZAPIN_SENDER || 'Using default: 6285691232473'}`);
console.log('');

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// System configuration (in production, these come from environment variables)
const SYSTEM_CONFIG = {
  email: {
    serviceId: process.env.SYSTEM_EMAILJS_SERVICE_ID || 'service_gastrax_001',
    templateId: process.env.SYSTEM_EMAILJS_TEMPLATE_ID || 'template_gastrax_001',
    publicKey: process.env.SYSTEM_EMAILJS_PUBLIC_KEY || 'gastrax_public_key_001',
    fromEmail: process.env.SYSTEM_FROM_EMAIL || 'reminder@smarteksistem.com',
    fromName: process.env.SYSTEM_FROM_NAME || 'GasTrax System - Smartek Sistem Indonesia'
  },
  whatsapp: {
    apiKey: process.env.SYSTEM_ZAPIN_API_KEY || 'system_zapin_key_001',
    sender: process.env.SYSTEM_ZAPIN_SENDER || '6285691232473'
  },
  telegram: {
    botToken: process.env.SYSTEM_TELEGRAM_BOT_TOKEN || 'system_telegram_bot_001',
    chatId: process.env.SYSTEM_TELEGRAM_CHAT_ID || '@gastrax_alerts'
  }
};

// Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://gastrax.smarteksistem.com',
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'communication-proxy',
    timestamp: new Date().toISOString(),
    services: {
      email: 'EmailJS',
      whatsapp: 'Zapin API',
      telegram: 'Telegram Bot API'
    }
  });
});

// System configuration endpoint
app.get('/api/system-config', (req, res) => {
  res.json({
    email: {
      enabled: !!SYSTEM_CONFIG.email.serviceId,
      provider: 'EmailJS',
      fromName: SYSTEM_CONFIG.email.fromName
    },
    whatsapp: {
      enabled: !!SYSTEM_CONFIG.whatsapp.apiKey,
      provider: 'Zapin API',
      sender: SYSTEM_CONFIG.whatsapp.sender
    },
    telegram: {
      enabled: !!SYSTEM_CONFIG.telegram.botToken,
      provider: 'Telegram Bot API'
    }
  });
});

// Email sending endpoint
app.post('/api/email', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received POST /api/email`, req.body);
  
  const { to_email, subject, message, use_system_config = true } = req.body;
  
  if (!to_email || !subject || !message) {
    console.error('Missing required email fields:', { to_email: !!to_email, subject: !!subject, message: !!message });
    return res.status(400).json({ error: 'Missing required fields: to_email, subject, message' });
  }

  try {
    if (use_system_config) {
      console.log(`[${new Date().toISOString()}] Using system email configuration`);
      
      // Use system EmailJS configuration
      const emailjsUrl = 'https://api.emailjs.com/api/v1.0/email/send';
      const emailData = {
        service_id: SYSTEM_CONFIG.email.serviceId,
        template_id: SYSTEM_CONFIG.email.templateId,
        user_id: SYSTEM_CONFIG.email.publicKey,
        template_params: {
          to_email,
          subject,
          message,
          from_name: SYSTEM_CONFIG.email.fromName,
          from_email: SYSTEM_CONFIG.email.fromEmail
        }
      };

      const emailResponse = await fetch(emailjsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (emailResponse.ok) {
        console.log(`[${new Date().toISOString()}] Email sent successfully via system config`);
        res.json({ success: true, message: 'Email sent successfully' });
      } else {
        const errorText = await emailResponse.text();
        throw new Error(`EmailJS API error: ${errorText}`);
      }
    } else {
      // Forward to client-side EmailJS (existing behavior)
      res.json({ success: false, error: 'Client-side email sending not implemented in proxy' });
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Email proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/zapin', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received POST /api/zapin`, req.body);
  
  const { api_key, sender, number, message, use_system_config = true } = req.body;
  
  if (!number || !message) {
    console.error('Missing required fields:', { number: !!number, message: !!message });
    return res.status(400).json({ error: 'Missing required fields: number, message' });
  }

  try {
    let finalApiKey, finalSender;
    
    if (use_system_config) {
      console.log(`[${new Date().toISOString()}] Using system WhatsApp configuration`);
      finalApiKey = SYSTEM_CONFIG.whatsapp.apiKey;
      finalSender = SYSTEM_CONFIG.whatsapp.sender;
    } else {
      if (!api_key || !sender) {
        console.error('Missing user config fields:', { api_key: !!api_key, sender: !!sender });
        return res.status(400).json({ error: 'Missing required fields for user config: api_key, sender' });
      }
      finalApiKey = api_key;
      finalSender = sender;
    }

    const zapinUrl = `https://zapin.my.id/send-message?api_key=${encodeURIComponent(finalApiKey)}&sender=${encodeURIComponent(finalSender)}&number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}`;
    
    console.log(`[${new Date().toISOString()}] Sending to Zapin API with ${use_system_config ? 'system' : 'user'} config...`);
    const zapinRes = await fetch(zapinUrl);
    const data = await zapinRes.json();
    
    console.log(`[${new Date().toISOString()}] Zapin API response:`, data);
    res.json(data);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] WhatsApp proxy error:`, err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces for production

app.listen(PORT, HOST, () => {
  console.log(`🚀 Zapin proxy running on http://${HOST}:${PORT}`);
  console.log(`📋 Health check: http://${HOST}:${PORT}/health`);
  console.log(`📨 WhatsApp API: http://${HOST}:${PORT}/api/zapin`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});