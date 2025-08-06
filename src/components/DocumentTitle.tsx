"use client"

import { useEffect } from 'react'

export default function DocumentTitle() {
  useEffect(() => {
    // Set the document title for staging environment
    document.title = 'Safe Split Local'
  }, [])

  return null
} 