"use client"

import { useEffect } from 'react'

export default function DocumentTitle() {
  useEffect(() => {
    // Set the document title based on environment
    if (process.env.NODE_ENV === 'staging') {
      document.title = 'Safe Split Local'
    } else {
      document.title = 'SafeSplit'
    }
  }, [])

  return null
} 