'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-6 py-3 rounded-lg shadow-lg font-sans text-base animate-fade-in-up ${
              t.type === 'success' ? 'bg-musae-ink text-musae-parchment' :
              t.type === 'error' ? 'bg-red-600 text-white' :
              'bg-white text-musae-ink border border-stone-200'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
