"use client";

import { type ReactNode, useState, useEffect } from "react";
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

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  type = "button",
  icon,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052FF] disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-[var(--app-background)]",
    secondary:
      "bg-[var(--app-gray)] hover:bg-[var(--app-gray-dark)] text-[var(--app-foreground)]",
    outline:
      "border border-[var(--app-accent)] hover:bg-[var(--app-accent-light)] text-[var(--app-accent)]",
    ghost:
      "hover:bg-[var(--app-accent-light)] text-[var(--app-foreground-muted)]",
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-lg",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="flex items-center mr-2">{icon}</span>}
      {children}
    </button>
  );
}

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

function Card({
  title,
  children,
  className = "",
  onClick,
}: CardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden transition-all hover:shadow-xl ${className} ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
    >
      {title && (
        <div className="px-5 py-3 border-b border-[var(--app-card-border)]">
          <h3 className="text-lg font-medium text-[var(--app-foreground)]">
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
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
    setPredictionData(null);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
      }
      const response = await fetch(apiUrl, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      setPredictionData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      console.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isBuyDisabled = !isConnected || !predictionData || predictionData.prediction !== 'positive';
  const tokenToBuy = predictionData?.prediction === 'positive' && predictionData.tokenToBuy && TOKEN_MAP[predictionData.tokenToBuy]
                  ? TOKEN_MAP[predictionData.tokenToBuy] 
                  : ETH_TOKEN; // Default to ETH if no prediction

  const getOverlayMessage = () => {
    if (!isConnected) {
      return "Connect your wallet to begin.";
    }
    return "Run a positive prediction to enable buy.";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center text-xs text-[var(--app-foreground-muted)]">
        <p>
          Disclaimer: This is an experimental app. All information provided is for informational purposes only and is not financial advice. Use at your own risk.
        </p>
      </div>

      <Card title="Buy or HODL?">
        <p className="text-[var(--app-foreground-muted)] mb-4">
          Click the button to get a recommendation for your next buy.
        </p>

        <Button
          onClick={handleRunPrediction}
          disabled={isLoading || !isConnected}
          className="w-full"
        >
          {isLoading ? 'Running Prediction...' : 'Run Prediction'}
        </Button>

        {!isConnected && (
          <p className="text-[var(--app-foreground-muted)] mt-4 text-center text-xs">
            Please connect your wallet to run a prediction.
          </p>
        )}

        <div className="mt-4 text-center h-12 flex flex-col justify-center">
          {isLoading ? (
            <p className="text-[var(--app-foreground-muted)]">Running Prediction...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : predictionData ? (
            <div>
              <p className={`font-bold ${predictionData.prediction === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                Prediction: {predictionData.prediction === 'positive' ? 'Positive' : 'Negative'}
              </p>
              {predictionData.prediction === 'negative' && (
                <p className="text-sm text-[var(--app-foreground-muted)]">
                  No buy recommended at this time.
                </p>
              )}
            </div>
          ) : (
            <p>&nbsp;</p>
          )}
        </div>

        <fieldset disabled={isBuyDisabled} className="relative mt-4">
          <Swap key={swapKey}>
            <div className="swap-container">
              <div className="relative">
                <SwapAmountInput
                  label="Sell"
                  token={USDC_TOKEN}
                  type="from"
                />
              </div>
              <div className="relative">
                <SwapAmountInput
                  label="Buy"
                  token={tokenToBuy}
                  type="to"                
                />
              </div>
              <SwapButton />
              <SwapMessage />
              <SwapToast />
            </div>
          </Swap>
          {isBuyDisabled && (
            <div className="absolute inset-0 cursor-not-allowed rounded-xl bg-[var(--app-card-bg)] bg-opacity-50" />
          )}
        </fieldset>
        {isBuyDisabled && (
          <p className="mt-4 text-center text-sm text-[var(--app-foreground-muted)]">
            {getOverlayMessage()}
          </p>
        )}        
      </Card>
    </div>
  );
}


type IconProps = {
  name: "heart" | "star" | "check" | "plus" | "arrow-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Icon({ name, size = "md", className = "" }: IconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const icons = {
    heart: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Heart</title>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    star: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Star</title>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    check: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Check</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    plus: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Plus</title>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    "arrow-right": (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <title>Arrow Right</title>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
  };

  return (
    <span className={`inline-block ${sizeClasses[size]} ${className}`}>
      {icons[name]}
    </span>
  );
}




