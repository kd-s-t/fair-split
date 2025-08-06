"use client"

import { useEffect } from 'react'

export default function DocumentTitle() {
  useEffect(() => {
    // Set the document title based on environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    const isProduction = process.env.NODE_ENV === 'production'
    
    if (isDevelopment) {
      document.title = 'SafeSplit - Development'
    } else if (isProduction) {
      document.title = 'SafeSplit - Production'
    } else {
      document.title = 'SafeSplit'
    }
  }, [])

  return null
} 