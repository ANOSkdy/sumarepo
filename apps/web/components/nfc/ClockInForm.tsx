"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ClockInFormProps {
  machineid: string
  workOptions: string[]
}

export function ClockInForm({ machineid, workOptions }: ClockInFormProps) {
  const router = useRouter()
  const [selectedWork, setSelectedWork] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClockIn = async () => {
    if (!selectedWork) {
      setError("作業内容を選択してください。")
      return
    }
    setIsSubmitting(true)
    setError(null)

    const getLocation = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
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
          workDescription: selectedWork,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "送信に失敗しました。")
      }

      alert("記録しました")
      router.refresh()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "不明なエラーが発生しました。";
      setError(errorMessage)
      alert(`エラーが発生しました: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl">出勤記録</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="work-select">作業内容</Label>
          <Select onValueChange={setSelectedWork} value={selectedWork}>
            <SelectTrigger id="work-select">
              <SelectValue placeholder="作業内容を選択..." />
            </SelectTrigger>
            <SelectContent>
              {workOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={handleClockIn}
          disabled={isSubmitting || !selectedWork}
          className="w-full bg-primary text-white hover:bg-primary/90 transition-transform duration-150 hover:scale-[1.02]"
        >
          {isSubmitting ? "記録中..." : "出勤を記録する"}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </CardContent>
    </Card>
  )
}