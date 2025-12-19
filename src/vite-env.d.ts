/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_PUBLIC_KEY: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID: string;
  readonly VITE_ALCHEMY_API: string;
  readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
