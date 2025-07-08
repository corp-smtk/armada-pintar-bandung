# WhatsApp Reminder Functionality & Local Proxy Setup

## Overview
This document explains how to enable and use WhatsApp reminders in the Armada Pintar system, including how to set up a local proxy to bypass CORS issues when sending WhatsApp messages via the Zapin API during local development.

---

## 1. WhatsApp Reminder Functionality

### Features
- Send WhatsApp reminders using the Zapin API.
- Select WhatsApp as a channel when creating/editing reminders.
- Configure WhatsApp API key and sender number in the Reminder Settings UI.
- Test WhatsApp delivery directly from the UI with a custom recipient.

### Configuration in the App
1. **Go to Reminder Settings** in the app.
2. **Enable WhatsApp Reminders**.
3. **Enter your Zapin API Key** and **Sender Number**.
4. **(Optional) Enter a Test Recipient Number** for testing.
5. **Save the settings**.
6. **Use the 'Test WhatsApp' button** to send a test message to the recipient (or sender if recipient is empty).

### How Recipients Work
- When creating a reminder, enter WhatsApp numbers in the "Penerima" field (comma-separated for multiple recipients).
- The system will send the reminder to each number using the Zapin API.

---

## 2. Local Proxy Setup (Bypassing CORS)

### Why a Proxy is Needed
- Browsers block direct fetch requests to the Zapin API due to CORS policy.
- The proxy server receives requests from the frontend and forwards them to Zapin, avoiding CORS issues.

### Setting Up the Proxy

1. **Create a file named `zapin-proxy.cjs` in your project root:**

```js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/zapin', async (req, res) => {
  console.log('Received POST /api/zapin', req.body);
  const { api_key, sender, number, message } = req.body;
  if (!api_key || !sender || !number || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const zapinUrl = `https://zapin.my.id/send-message?api_key=${encodeURIComponent(api_key)}&sender=${encodeURIComponent(sender)}&number=${encodeURIComponent(number)}&message=${encodeURIComponent(message)}`;
  try {
    const zapinRes = await fetch(zapinUrl);
    const data = await zapinRes.json();
    console.log('Zapin API response:', data);
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Zapin proxy running on http://localhost:${PORT}/api/zapin`);
});
```

2. **Install dependencies:**
```sh
npm install express node-fetch@2 cors
```

3. **Run the proxy server:**
```sh
node zapin-proxy.cjs
```

4. **Proxy endpoint:**
- The proxy listens at `http://localhost:3001/api/zapin` and expects a POST request with JSON body:
  - `api_key`, `sender`, `number`, `message`

---

## 3. Frontend Integration
- The frontend is configured to send WhatsApp requests to the proxy endpoint (`/api/zapin`).
- The proxy forwards the request to Zapin and returns the response.
- No CORS issues occur since both frontend and proxy are on localhost.

---

## 4. Troubleshooting & Notes

### Common Issues
- **CORS errors:** Only occur if you try to call Zapin directly from the browser. Always use the proxy for local dev.
- **500 Internal Server Error:** Check the proxy terminal for error logs. Common causes:
  - Missing parameters in the POST body.
  - Network issues or Zapin API errors.
  - `fetch is not a function`: Make sure you installed `node-fetch@2` and are using `require` in `.cjs` files.
- **Cannot GET /api/zapin:** This is normal if you visit the URL in a browser (GET request). The proxy only handles POST requests.

### Security Concerns
- **Do NOT use this proxy in production as-is.**
  - The API key is exposed to anyone who can access the proxy.
  - Add authentication and restrict access if deploying beyond local dev.
- For production, send WhatsApp requests from your secure backend, not from the browser or an open proxy.

### Webhook URL
- The Zapin webhook URL is for receiving delivery status or incoming messages. It is not required for sending messages.

### Example Zapin API URL
If you want to test directly:
```
https://zapin.my.id/send-message?api_key=YOUR_API_KEY&sender=YOUR_SENDER&number=RECIPIENT_NUMBER&message=YOUR_MESSAGE
```

---

## 5. Summary Table

| Step                | What to do?                                  |
|---------------------|----------------------------------------------|
| Proxy setup         | Create `zapin-proxy.cjs`, install deps, run  |
| Frontend config     | Use POST to `http://localhost:3001/api/zapin`|
| WhatsApp settings   | Set API key, sender, test recipient in UI    |
| Test message        | Use 'Test WhatsApp' in Reminder Settings     |
| Troubleshoot        | Check proxy terminal for logs/errors         |

---

## 6. Final Notes
- This setup is for local development and testing only.
- For production, use a secure backend and never expose your API key in a public proxy.
- Always check the proxy terminal for logs and errors when debugging WhatsApp delivery. 