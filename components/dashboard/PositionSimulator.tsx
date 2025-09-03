"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { usePositions } from "@/lib/positions-context"
import type { Position } from "@/lib/positions"
import { getEthPriceWithFallback, type PriceWithTimestamp } from "@/lib/coingecko-api"

interface SimulationResult {
  position: Position
  simulationDatetime: string
  simulationPrice: number
  variationPercent: number
  profitLoss: number
  durationHours: number
  priceSource: string
  priceFetchedAt: string
}

export function PositionSimulator() {
  const { positions } = usePositions()
  const openPositions = positions.filter(p => p.status === "OPEN")
  const [selectedPositionId, setSelectedPositionId] = useState("")
  const [simulationDatetime, setSimulationDatetime] = useState(() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })
  const [manualPrice] = useState("")
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // No need to fetch positions - they come from context

  const selectedPosition = openPositions.find((p) => p.id === selectedPositionId)

  const handleSimulate = async () => {
    if (!selectedPosition) {
      setError("Please select a position to simulate")
      return
    }

    setIsLoading(true)
    setError("")
    setSimulationResult(null)

    try {
      let priceData: PriceWithTimestamp

      if (manualPrice) {
        const price = Number.parseFloat(manualPrice)
        if (isNaN(price) || price <= 0) {
          throw new Error("Please enter a valid price")
        }
        priceData = {
          price,
          fetched_at: new Date().toISOString(),
          source: "manual",
        }
      } else {
        const utcDatetime = new Date(simulationDatetime).toISOString()
        priceData = await getEthPriceWithFallback(utcDatetime)
      }

      // Calculate simulation results
      const variationPercent = ((priceData.price - selectedPosition.priceUsd) / selectedPosition.priceUsd) * 100
      // Only BUY positions supported - calculate profit/loss accordingly
      const profitLoss = priceData.price - selectedPosition.priceUsd
      
      const durationHours =
        (new Date(simulationDatetime).getTime() - new Date(selectedPosition.openedAt).getTime()) / (1000 * 60 * 60)

      setSimulationResult({
        position: selectedPosition,
        simulationDatetime: new Date(simulationDatetime).toISOString(),
        simulationPrice: priceData.price,
        variationPercent,
        profitLoss,
        durationHours,
        priceSource: priceData.source,
        priceFetchedAt: priceData.fetched_at,
      })
    } catch (err) {
      if (err instanceof Error && err.message === "API_FAILED") {
        setError("CoinGecko API failed. Please enter price manually.")
      } else {
        setError(err instanceof Error ? err.message : "Failed to simulate position")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const formatted = percentage.toFixed(2)
    return percentage > 0 ? `+${formatted}%` : `${formatted}%`
  }

  if (openPositions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--app-foreground-muted)]">No open positions to simulate</p>
        <p className="text-sm text-[var(--app-foreground-muted)] mt-1">Open a position first to use the simulator</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-[var(--app-foreground)] mb-1">Position Simulator</h4>
          <p className="text-sm text-[var(--app-foreground-muted)]">
            Simulate potential variations for open positions without closing them
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Select Position */}
        <div>
          <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
            Select Open Position
          </label>
          <select
            value={selectedPositionId}
            onChange={(e) => setSelectedPositionId(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-card-bg)] text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
          >
            <option value="">Choose a position to simulate</option>
            {openPositions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.side} - ${position.priceUsd.toLocaleString()} (
                {new Date(position.openedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {selectedPosition && (
          <div className="p-3 bg-[var(--app-gray)] rounded-lg">
            <h4 className="font-medium text-[var(--app-foreground)] mb-2">Position Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-[var(--app-foreground-muted)]">
              <div>Type: {selectedPosition.side}</div>
              <div>Open Time: {new Date(selectedPosition.openedAt).toLocaleString()}</div>
              <div>Open Price: ${selectedPosition.priceUsd.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Simulation Date & Time */}
        <div>
          <label className="block text-sm font-medium text-[var(--app-foreground)] mb-2">
            Simulation Date & Time
          </label>
          <input
            type="datetime-local"
            value={simulationDatetime}
            onChange={(e) => setSimulationDatetime(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--app-card-border)] rounded-lg bg-[var(--app-card-bg)] text-[var(--app-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
          />
        </div>

        {/* Simulation Price */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulate}
              disabled={isLoading || !selectedPosition}
            >
              {isLoading ? "Simulating..." : "Simulate"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
        )}

        {simulationResult && (
          <div className="p-4 bg-[var(--app-gray)] rounded-lg border">
            <h4 className="font-medium text-[var(--app-foreground)] mb-3">Simulation Result</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Position:</span>
                  <div className="font-medium">{simulationResult.position.side}</div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Simulation Time:</span>
                  <div className="font-medium">
                    {new Date(simulationResult.simulationDatetime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Open Price:</span>
                  <div className="font-medium">${simulationResult.position.priceUsd.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Simulation Price:</span>
                  <div className="font-medium">${simulationResult.simulationPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Variation:</span>
                  <div className={`font-medium ${
                    simulationResult.variationPercent >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatPercentage(simulationResult.variationPercent)}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Profit/Loss:</span>
                  <div className={`font-medium ${
                    simulationResult.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {formatCurrency(simulationResult.profitLoss)}
                  </div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Duration:</span>
                  <div className="font-medium">{simulationResult.durationHours.toFixed(1)} hours</div>
                </div>
                <div>
                  <span className="text-[var(--app-foreground-muted)]">Price Source:</span>
                  <div className="font-medium">{simulationResult.priceSource.replace("_", " ")}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
