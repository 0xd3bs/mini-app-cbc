"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { usePositions } from "@/lib/positions-context"
import type { Position } from "@/lib/positions"
import { formatDuration } from "@/lib/utils"

export function PositionsTable() {
  const { positions, isLoading, error, refreshPositions } = usePositions()

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

  const calculateDuration = (position: Position): string => {
    try {
      const openedAt = new Date(position.openedAt)
      const closedAt = position.closedAt ? new Date(position.closedAt) : new Date()
      
      if (isNaN(openedAt.getTime()) || isNaN(closedAt.getTime())) {
        return "-"
      }
      
      const durationHours = (closedAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60)
      
      if (durationHours < 0) {
        return "-"
      }
      
      return formatDuration(durationHours)
    } catch {
      return "-"
    }
  }

  const formatPercentage = (percentage: number) => {
    const formatted = percentage.toFixed(2)
    return percentage > 0 ? `+${formatted}%` : `${formatted}%`
  }

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-green-600"
    if (variation < 0) return "text-red-600"
    return "text-[var(--app-foreground-muted)]"
  }

  const formatDateOnly = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Date"
      }
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatTimeOnly = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Invalid Time"
      }
      
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    } catch {
      return "Invalid Time"
    }
  }

  // 🎯 NEW: Combined Performance function
  const getPerformanceSummary = (position: Position) => {
    const duration = calculateDuration(position)
    const hasVariation = position.profitLossPercent !== undefined
    
    if (duration === "-" && !hasVariation) {
      return <span className="text-[var(--app-foreground-muted)] text-xs">-</span>
    }

    const variationColor = hasVariation ? getVariationColor(position.profitLossPercent!) : "text-[var(--app-foreground-muted)]"
    const variationText = hasVariation ? formatPercentage(position.profitLossPercent!) : "-"

    return (
      <div className="flex flex-col gap-0.5">
        <div className="text-xs text-[var(--app-foreground-muted)] leading-tight">
          {duration}
        </div>
        <div className={`text-xs font-medium leading-tight ${variationColor}`}>
          {variationText}
        </div>
      </div>
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
          <Button onClick={refreshPositions} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card title="Trading Positions">
      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--app-foreground-muted)]">
            No positions found. Open a new position to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* 🎯 OPTIMIZED: Mobile-first table with Open/Closed columns */}
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[var(--app-card-border)]">
                <th className="text-left py-2 px-1 text-xs font-medium text-[var(--app-foreground-muted)]">
                  Open
                </th>
                <th className="text-left py-2 px-1 text-xs font-medium text-[var(--app-foreground-muted)]">
                  Close
                </th>
                <th className="text-left py-2 px-1 text-xs font-medium text-[var(--app-foreground-muted)]">
                  Status
                </th>
                {/* 🎯 NEW: Combined Performance column */}
                <th className="text-left py-2 px-1 text-xs font-medium text-[var(--app-foreground-muted)]">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id} className="border-b border-[var(--app-card-border)] hover:bg-[var(--app-gray)]">
                  {/* 🎯 Open Date & Time */}
                  <td className="py-2 px-1">
                    <div className="text-xs">
                      <div className="font-medium text-[var(--app-foreground)]">
                        {formatDateOnly(position.openedAt)}
                      </div>
                      <div className="text-[var(--app-foreground-muted)]">
                        {formatTimeOnly(position.openedAt)}
                      </div>
                    </div>
                  </td>
                  
                  {/* 🎯 Close Date & Time */}
                  <td className="py-2 px-1">
                    {position.closedAt ? (
                      <div className="text-xs">
                        <div className="font-medium text-[var(--app-foreground)]">
                          {formatDateOnly(position.closedAt)}
                        </div>
                        <div className="text-[var(--app-foreground-muted)]">
                          {formatTimeOnly(position.closedAt)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--app-foreground-muted)]">-</span>
                    )}
                  </td>
                  
                  <td className="py-2 px-1">
                    {getStatusBadge(position.status)}
                  </td>
                  
                  {/* 🎯 NEW: Combined Performance column */}
                  <td className="py-2 px-1">
                    {getPerformanceSummary(position)}
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