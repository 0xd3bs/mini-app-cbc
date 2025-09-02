"use client";

import { type ReactNode, useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToast,
} from '@coinbase/onchainkit/swap';

import type { Token } from "@coinbase/onchainkit/token";
import { PredictionResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";

// Re-exports for backward compatibility
export { Button } from "@/components/ui/Button";
export { Icon } from "@/components/ui/Icon";
export { Card } from "@/components/ui/Card";

// Define the tokens needed for the Buy component
const ETH_TOKEN: Token = {
  name: 'Ethereum',
  address: '', // Native token, no address
  symbol: 'ETH',
  decimals: 18,
  image: '/eth.png',
  chainId: 8453,
};

const WBTC_TOKEN: Token = {
    name: 'Wrapped BTC',
    address: '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // Address for WBTC on Base
    symbol: 'WBTC',
    decimals: 8,
    image: '/wbtc.png',
    chainId: 8453,
};

const USDC_TOKEN: Token = {
    name: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Address for USDC on Base
    symbol: 'USDC',
    decimals: 6,
    image: '/usdc.png',
    chainId: 8453,
};

const TOKEN_MAP: { [key: string]: Token } = {
  ETH: ETH_TOKEN,
  WBTC: WBTC_TOKEN,
};

// --- Popover Component ---
type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
};

function Popover({ trigger, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 z-10 w-64 mt-2 origin-top-right bg-[var(--app-gray)] border border-[var(--app-card-border)] rounded-md shadow-lg">
          <div className="p-3 text-sm text-[var(--app-foreground-muted)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function Home() {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [swapKey, setSwapKey] = useState(0);

  useEffect(() => {
    // Si el usuario no está conectado, resetea el componente Swap y los datos de predicción.
    if (!isConnected) {
      setSwapKey(prevKey => prevKey + 1);
      setPredictionData(null);
    }
  }, [isConnected]);

  /**
   * Handles the click event for the "Run Prediction" button.
   * It calls the prediction API and updates the component's state.
   */
  const handleRunPrediction = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
      }

      // DOCS: This `fetch` call targets the URL specified in the `NEXT_PUBLIC_API_URL`
      // environment variable. Because this component is a Client Component ("use client"),
      // this request is made directly from the user's browser, not from the Next.js server.
      //
      // - If NEXT_PUBLIC_API_URL is an absolute URL (e.g., https://api.example.com),
      //   the browser calls that external endpoint directly.
      // - If it were a relative path (e.g., /api/prediction), the browser would call the
      //   Next.js API route at `app/api/prediction/route.ts` on the same domain.
      const response = await fetch(apiUrl, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: PredictionResponse = await response.json();

      // Conditionally reset the Swap component only if the prediction type changes
      if (predictionData && data.prediction !== predictionData.prediction) {
        setSwapKey(prevKey => prevKey + 1);
      }

      setPredictionData(data);
    } catch (err) {
      let friendlyErrorMessage = 'An unknown error occurred.';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        friendlyErrorMessage = 'Could not connect to the prediction service. Please check your internet connection and try again.';
      } else if (err instanceof Error) {
        friendlyErrorMessage = err.message;
      }
      setError(friendlyErrorMessage);
      console.error(err); // Log the original error for debugging
    } finally {
      setIsLoading(false);
    }
  };

  const isSwapDisabled = !isConnected || !predictionData || !['positive', 'negative'].includes(predictionData.prediction);
  const targetToken = predictionData?.tokenToBuy && TOKEN_MAP[predictionData.tokenToBuy]
                  ? TOKEN_MAP[predictionData.tokenToBuy]
                  : ETH_TOKEN; // Default to ETH if no prediction

  const fromToken = predictionData?.prediction === 'negative' ? targetToken : USDC_TOKEN;
  const toToken = predictionData?.prediction === 'negative' ? USDC_TOKEN : targetToken;
  const isSellAction = predictionData?.prediction === 'negative';

  const getOverlayMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to begin.";
    }
    return "Run a prediction to enable swap.";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center text-xs text-[var(--app-foreground-muted)]">
        <p>
          Disclaimer: This is an experimental app. All information provided is for informational purposes only and is not financial advice. Use at your own risk.
        </p>
      </div>

      <Card 
        title="Buy or Sell"
        titleExtra={
          <Popover
            trigger={<Icon name="help-circle" size="sm" className="text-[var(--app-foreground-muted)]" />}
          >
            <p><strong>This mini app gives you a simple prediction: BUY or SELL.</strong></p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
              <li>If <strong>BUY</strong> → you can swap USDC to ETH.</li>
              <li>If <strong>SELL</strong> → you can swap ETH to USDC.</li>
            </ul>
            <p className="mt-2 text-xs italic">Predictions are based on an 🧠 ML model.</p>
          </Popover>
        }
      >
        <p className="text-[var(--app-foreground-muted)] mb-4">
          🧠 ML model analyzes the market and tells you whether to buy or sell!
        </p>
        <p className="text-xs italic text-[var(--app-foreground-muted)] text-center mb-4">
          💡 For best results, check predictions at market close or at the same time each day.
        </p>
        {!isConnected && (
          <p className="text-[var(--app-foreground-muted)] text-center text-xs" style={{ marginTop: 'var(--space-feedback-top)', marginBottom: 'var(--space-help-bottom)' }}>
            Click the button to get a recommendation for your next action.
          </p>
        )}        

        <Button
          onClick={handleRunPrediction}
          disabled={isLoading || !isConnected}
          className="w-full"
        >
          {isLoading ? 'Running Prediction...' : 'Run Prediction'}
        </Button>

        <div className="text-center flex flex-col justify-center" style={{ height: 'var(--feedback-height)', marginTop: 'var(--space-feedback-top)' }}>
          {error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : predictionData ? (
            <div>
              <p className={`font-bold leading-tight ${predictionData.prediction === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                Prediction: {
                  predictionData.prediction === 'positive' ? 'BUY Opportunity' : 'SELL Opportunity'
                }
              </p>
              {predictionData.prediction === 'positive' && (
                <p className="text-sm leading-tight text-[var(--app-foreground-muted)]">
                  Good time to enter the market.
                </p>
              )}              
              {predictionData.prediction === 'negative' && (
                <p className="text-sm leading-tight text-[var(--app-foreground-muted)]">
                  Market signals suggest selling.
                </p>
              )}
            </div>
          ) : null}
        </div>

          <div className="w-full text-center" style={{ height: 'var(--pointer-height)' }}>
            {!isSwapDisabled && (
              <span style={{ fontSize: 'var(--pointer-font-size)' }}>👇</span>
            )}
          </div>
          <fieldset disabled={isSwapDisabled} className="relative" style={{ marginTop: 'var(--space-swap-top)' }}>
            <Swap key={swapKey}>
            <div className="swap-container">
              <div className="relative">
                <SwapAmountInput
                  label={isSellAction ? "Sell" : "Buy"}
                  token={fromToken}
                  type="from"
                />
              </div>
              <div className="relative">
                <SwapAmountInput
                  label={isSellAction ? "Receive" : "Receive"}
                  token={toToken}
                  type="to"
                />
              </div>
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </div>
          </Swap>
          {isSwapDisabled && (
            <div className="absolute inset-0 cursor-not-allowed rounded-xl bg-[var(--app-card-bg)] bg-opacity-50" />
          )}
          </fieldset>
        <div style={{ height: 'var(--overlay-helper-height)', marginTop: 'var(--space-overlay-top)' }}>
          {isSwapDisabled ? (
            <p className="text-center text-xs text-[var(--app-foreground-muted)]">
              {getOverlayMessage()}
            </p>
          ) : null}
        </div>       
      </Card>
    </div>
  );
}




