import { ClockInForm } from "@/components/nfc/ClockInForm"
import { ClockOutView } from "@/components/nfc/ClockOutView"
import { headers } from "next/headers"

// Force dynamic rendering and server-side fetching
export const dynamic = "force-dynamic"

type NfcPageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

async function getNfcConfig(machineid: string) {
  // On the server, we need to use an absolute URL.
  // We can construct it from the request headers.
  const host = headers().get("host")
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const url = `${protocol}://${host}/api/nfc/config?machineid=${machineid}`

  const res = await fetch(url, { cache: "no-store" }) // No caching for real-time data

  if (!res.ok) {
    // This will be caught by the error boundary
    throw new Error("Failed to fetch NFC config")
  }

  return res.json()
}

export default async function NfcPage({ searchParams }: NfcPageProps) {
  const machineid = searchParams?.machineid

  if (typeof machineid !== "string" || !machineid) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-base p-4">
        <div className="text-red-500">
          <h1 className="text-2xl font-bold">エラー</h1>
          <p>machineidが指定されていません。</p>
        </div>
      </main>
    )
  }

  try {
    const data = await getNfcConfig(machineid)

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-base p-4">
        {data.isClockedIn ? (
          <ClockOutView machineid={machineid} clockInInfo={data.clockInInfo} />
        ) : (
          <ClockInForm machineid={machineid} workOptions={data.workOptions} />
        )}
      </main>
    )
  } catch (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-base p-4">
        <div className="text-red-500">
          <h1 className="text-2xl font-bold">エラー</h1>
          <p>データの取得に失敗しました。ページを再読み込みしてください。</p>
        </div>
      </main>
    )
  }
}