"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import type { Position } from "@/lib/positions"
import { formatDate } from "@/lib/utils"

export function PositionsTable() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/positions")
      if (!response.ok) {
        throw new Error("Failed to fetch positions")
      }
      const data = await response.json()
      setPositions(data)
    } catch {
      setError("Failed to load positions")
    } finally {
      setIsLoading(false)
    }
  }

  const getPositionColor = (side: string) => {
    return side === "BUY" ? "text-green-500" : "text-red-500"
  }

  const getStatusBadge = (status: string) => {
    return status === "OPEN" ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Open
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Closed
      </span>
    )
  }

  if (isLoading) {
    return (
      <Card title="Trading Positions">
        <div className="text-center py-8">
          <p className="text-[var(--app-foreground-muted)]">Loading positions...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="Trading Positions">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchPositions} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Trading Positions">
      <div className="flex justify-end mb-4">
        <Button onClick={fetchPositions} variant="outline" size="sm">
          <Icon name="arrow-right" size="sm" className="mr-1" />
          Refresh
        </Button>
      </div>
      
      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--app-foreground-muted)]">
            No positions found. Open a new position to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--app-card-border)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  Price
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  Opened
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  Closed
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--app-foreground-muted)]">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id} className="border-b border-[var(--app-card-border)] hover:bg-[var(--app-gray)]">
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getPositionColor(position.side)}`}>
                      {position.side}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(position.status)}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    ${position.priceUsd.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--app-foreground-muted)]">
                    {formatDate(position.openedAt)}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--app-foreground-muted)]">
                    {position.closedAt ? formatDate(position.closedAt) : "-"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {position.profitLoss !== undefined ? (
                      <span className={`font-medium ${
                        position.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        ${position.profitLoss.toFixed(2)} ({position.profitLossPercent?.toFixed(2)}%)
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
