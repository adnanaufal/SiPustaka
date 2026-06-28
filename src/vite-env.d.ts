/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_MIDTRANS_CLIENT_KEY: string;
  readonly VITE_RAJAONGKIR_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Midtrans Snap global type
interface Window {
  snap: {
    pay: (
      token: string,
      options?: {
        onSuccess?: (result: MidtransResult) => void;
        onPending?: (result: MidtransResult) => void;
        onError?: (result: MidtransResult) => void;
        onClose?: () => void;
      }
    ) => void;
    hide: () => void;
  };
}

interface MidtransResult {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  payment_type: string;
  status_code: string;
  status_message: string;
  gross_amount: string;
  fraud_status?: string;
}
