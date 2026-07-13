const CHECKOUT_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (
      options: RazorpayCheckoutOptions,
    ) => {
      open: () => void;
    };
  }
}

type RazorpayCheckoutOptions = {
  key: string;
  name?: string;
  description?: string;
  subscription_id?: string;
  order_id?: string;
  amount?: number | string;
  currency?: string;
  handler?: (response: unknown) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
};

let loadPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Razorpay checkout"));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

export function useRazorpayCheckout() {
  const openCheckout = async (options: RazorpayCheckoutOptions) => {
    await loadCheckoutScript();
    if (!window.Razorpay) {
      throw new Error("Razorpay checkout failed to load");
    }
    const checkout = new window.Razorpay(options);
    checkout.open();
  };

  return { openCheckout };
}
