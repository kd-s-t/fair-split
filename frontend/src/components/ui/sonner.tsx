'use client'

import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center" // or your preferred
      richColors
      // closeButton is NOT included
      toastOptions={{
        duration: 3000,
      }}
    />
  )
}
