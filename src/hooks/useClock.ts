import { useEffect, useState } from 'react'

const REFRESH_MS = 1000

/** Live wall-clock in a given time zone, e.g. "12:03:41 PM" or "3:31 PM". */
export function useClock(timeZone: string, withSeconds = true): string {
  const format = () =>
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      ...(withSeconds ? { second: '2-digit' as const } : {}),
      timeZone,
    }).format(new Date())

  const [time, setTime] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setTime(format()), REFRESH_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZone, withSeconds])

  return time
}
