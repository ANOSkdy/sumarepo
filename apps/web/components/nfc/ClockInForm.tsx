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
      setError("菴懈･ｭ蜀・ｮｹ繧帝∈謚槭＠縺ｦ縺上□縺輔＞縲・)
      return
    }
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
          workDescription: selectedWork,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "謇灘綾縺ｫ螟ｱ謨励＠縺ｾ縺励◆縲・)
      }

      alert("險倬鹸縺励∪縺励◆")
      router.refresh()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("荳肴・縺ｪ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆縲・)
      }
      alert("繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl">蜃ｺ蜍､謇灘綾</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="work-select">菴懈･ｭ蜀・ｮｹ</Label>
          <Select onValueChange={setSelectedWork} value={selectedWork}>
            <SelectTrigger id="work-select">
              <SelectValue placeholder="菴懈･ｭ蜀・ｮｹ繧帝∈謚・.." />
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
          {isSubmitting ? "謇灘綾荳ｭ..." : "蜃ｺ蜍､繧定ｨ倬鹸縺吶ｋ"}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </CardContent>
    </Card>
  )
}




