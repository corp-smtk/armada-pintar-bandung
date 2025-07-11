/// <reference types="vite/client" />

declare const __API_BASE_URL__: string;
declare const __ENABLE_WHATSAPP__: boolean;

interface ImportMetaEnv {
  // System Configuration Environment Variables
  readonly VITE_SYSTEM_EMAILJS_SERVICE_ID?: string;
  readonly VITE_SYSTEM_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_SYSTEM_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_SYSTEM_FROM_EMAIL?: string;
  readonly VITE_SYSTEM_FROM_NAME?: string;
  
  readonly VITE_SYSTEM_ZAPIN_API_KEY?: string;
  readonly VITE_SYSTEM_ZAPIN_SENDER?: string;
  
  readonly VITE_SYSTEM_TELEGRAM_BOT_TOKEN?: string;
  readonly VITE_SYSTEM_TELEGRAM_CHAT_ID?: string;
  
  // Other environment variables
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_WHATSAPP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
