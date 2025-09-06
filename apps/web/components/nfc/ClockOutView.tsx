"use client"

import * as React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ClockOutViewProps {
  machineid: string
  clockInInfo: {
    userName: string
    siteName: string
    machineName: string
    workDescription: string
  }
}

interface InfoLineProps {
  icon: string
  label: string
  value: string
}

const InfoLine: React.FC<InfoLineProps> = ({ icon, label, value }) => (
  <div className="flex items-center space-x-4">
    <Image src={icon} alt={`${label} icon`} width={24} height={24} />
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  </div>
)

export function ClockOutView({ machineid, clockInInfo }: ClockOutViewProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClockOut = async () => {
    setIsSubmitting(true)
    setError(null)

    const getLocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
    }

    try {
      const position = await getLocation()
      const { latitude, longitude, accuracy } = position.coords

      const response = await fetch("/api/nfc/record", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          machineid,
          latitude,
          longitude,
          accuracy,
          clientTimestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "退勤に失敗しました、E)
      }

      alert("記録しました")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("不�Eなエラーが発生しました、E)
      }
      alert("エラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl">退勤打刻</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <InfoLine icon="/user.svg" label="ユーザー吁E value={clockInInfo.userName} />
          <InfoLine icon="/map-pin.svg" label="現場吁E value={clockInInfo.siteName} />
          <InfoLine icon="/truck.svg" label="機械吁E value={clockInInfo.machineName} />
          <InfoLine icon="/clipboard-list.svg" label="作業冁E��" value={clockInInfo.workDescription} />
        </div>
        <Button
          onClick={handleClockOut}
          disabled={isSubmitting}
          className="w-full bg-accent-2 text-white hover:bg-accent-2/90"
        >
          {isSubmitting ? "退勤中..." : "退勤する"}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </CardContent>
    </Card>
  )
}

