"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { Tabs } from "@/components/ui/Tabs"
import { OpenPositionForm } from "./OpenPositionForm"
import { ClosePositionForm } from "./ClosePositionForm"
import { PositionSimulator } from "./PositionSimulator"

export function PositionManager() {
  const [activeTab, setActiveTab] = useState("open")

  return (
    <Card title="Position Management">
      <p className="text-sm text-[var(--app-foreground-muted)] mb-4">
        Open new positions, close existing ones, or simulate variations
      </p>
      <Tabs
        items={[
          { key: "open", label: "Open Position" },
          { key: "close", label: "Close Position" },
          { key: "simulate", label: "Simulate" },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      />
      <div className="mt-4">
        {activeTab === "open" && <OpenPositionForm />}
        {activeTab === "close" && <ClosePositionForm />}
        {activeTab === "simulate" && <PositionSimulator />}
      </div>
    </Card>
  )
}
