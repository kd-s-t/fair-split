"use client"

import { useEffect } from 'react'

export default function DocumentTitle() {
  useEffect(() => {
    // Set the document title based on environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (isDevelopment) {
      document.title = 'SafeSplit - Local'
    } else {
      document.title = 'SafeSplit - Staging'
    }
  }, [])

  return null
} 