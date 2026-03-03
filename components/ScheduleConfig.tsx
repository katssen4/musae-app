'use client'

import { useState } from 'react'
import type { Platform, ScheduleFrequency } from '@/types'

// Sprint 4 : configuration du planning de publication automatique
export default function ScheduleConfig() {
  const [frequency, setFrequency] = useState<ScheduleFrequency>('3x_week')
  const [time, setTime] = useState('09:00')

  const frequencies: { value: ScheduleFrequency; label: string }[] = [
    { value: 'daily', label: 'Tous les jours' },
    { value: '3x_week', label: '3 fois par semaine' },
    { value: 'weekly', label: 'Une fois par semaine' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <label className="block font-sans text-base font-medium text-musae-ink mb-3">
          Fréquence de publication
        </label>
        <div className="grid grid-cols-1 gap-3">
          {frequencies.map((f) => (
            <label
              key={f.value}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                frequency === f.value
                  ? 'border-musae-ink bg-musae-ink/5'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value={f.value}
                checked={frequency === f.value}
                onChange={() => setFrequency(f.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  frequency === f.value ? 'border-musae-ink' : 'border-stone-300'
                }`}
              >
                {frequency === f.value && (
                  <div className="w-2 h-2 rounded-full bg-musae-ink" />
                )}
              </div>
              <span className="font-sans text-base text-musae-ink">{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="time" className="block font-sans text-base font-medium text-musae-ink mb-2">
          Heure préférée de publication
        </label>
        <input
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="input w-auto"
        />
      </div>
    </div>
  )
}
