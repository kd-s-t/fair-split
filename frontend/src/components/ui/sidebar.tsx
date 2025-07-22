'use client'

import * as React from 'react'

// Sidebar context for open/close state
const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true)
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider.')
  return ctx
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar()
  return (
    <aside className={`transition-all duration-300 h-screen bg-slate-950 text-yellow-400 flex flex-col py-6 px-4 rounded-2xl mr-6 ${open ? 'w-56' : 'w-0 overflow-hidden'}`}>
      {children}
    </aside>
  )
}

export function SidebarHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-8 flex items-center gap-2">{children}</div>
}

export function SidebarContent({ children }: { children?: React.ReactNode }) {
  return <div className="flex-1 flex flex-col gap-2">{children}</div>
}

export function SidebarFooter({ children }: { children?: React.ReactNode }) {
  return <div className="mt-auto pt-4">{children}</div>
}

export function SidebarMenu({ children }: { children?: React.ReactNode }) {
  return <ul className="flex flex-col gap-1">{children}</ul>
}

export function SidebarMenuItem({ children }: { children?: React.ReactNode }) {
  return <li>{children}</li>
}

export function SidebarMenuButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-yellow-400/20 transition-colors" {...props}>
      {children}
    </button>
  )
}

export function SidebarTrigger() {
  const { open, setOpen } = useSidebar()
  return (
    <button
      className="fixed top-4 left-4 z-50 bg-yellow-400 text-black rounded-full p-2 shadow-lg"
      onClick={() => setOpen(!open)}
      aria-label="Toggle sidebar"
      type="button"
    >
      {open ? '⏴' : '⏵'}
    </button>
  )
} 