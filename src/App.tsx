import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { CalendarDays, Trash2, Clock3, RefreshCw } from 'lucide-react' // Import the refresh icon

interface BinDayInfo {
  days: number
  colorName: 'Black' | 'Green'
  todayDate: string
  nextEventDate: string
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

const timeAgo = (timestamp: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60)) % 60

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffMinutes > 0)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

const BinDayApp = () => {
  const [data, setData] = useState<BinDayInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchBinData = async () => {
    try {
      setData(null) // Reset data before fetching
      setError(null) // Reset error before fetching
      const response = await axios.get<BinDayInfo>(import.meta.env.VITE_URL)
      setData(response.data)
      setLastUpdated(new Date()) // Update the lastUpdated state
    } catch {
      setError('Failed to load bin day data.')
    }
  }

  useEffect(() => {
    fetchBinData()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-lime-50 p-4 font-[\'Inter\'],sans">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-6 text-center border border-gray-200">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-6 tracking-tight">
          🗑️ Bin Day
          <button
            onClick={fetchBinData}
            className="ml-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </h1>
        {error && <p className="text-red-500 text-base font-medium">{error}</p>}
        {!data && !error && (
          <p className="text-gray-500 text-base">Loading...</p>
        )}
        {data && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-3 text-lg text-gray-700">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              <span>
                Today: <strong>{formatDate(data.todayDate)}</strong>
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-gray-700">
              <Trash2 className="w-5 h-5 text-emerald-600" />
              <span>
                Bin Day: <strong>{formatDate(data.nextEventDate)}</strong>
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 text-lg text-gray-700">
              <Clock3 className="w-5 h-5 text-emerald-600" />
              <span>
                Days Until: <strong>{data.days}</strong>
              </span>
            </div>
            <div
              className={`mt-4 py-3 px-6 rounded-full text-white text-lg font-semibold inline-block shadow-lg transition-all duration-300 ${
                data.colorName === 'Black'
                  ? 'bg-zinc-900 hover:bg-zinc-800'
                  : 'bg-green-600 hover:bg-green-500'
              }`}
            >
              {data.colorName} Bin
            </div>
          </div>
        )}
        {lastUpdated && (
          <p className="text-gray-400 text-sm mt-4">
            Last updated {timeAgo(lastUpdated)}
          </p>
        )}
      </div>
    </div>
  )
}

export default BinDayApp
