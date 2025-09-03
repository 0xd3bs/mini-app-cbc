"use client";

import { PositionsProvider } from "@/lib/positions-context";
import { PositionManager } from "./PositionManager";
import { PositionsTable } from "./PositionsTable";

export function Dashboard() {
  return (
    <PositionsProvider>
      <div className="space-y-6">
        <div className="text-center text-xs text-[var(--app-foreground-muted)]">
          <p>
            Professional Trading Dashboard - Manage your ETH positions and track your trading history.
          </p>
        </div>

        <PositionManager />
        
        <PositionsTable />
      </div>
    </PositionsProvider>
  );
}
