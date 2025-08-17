'use client'

import React, { ReactNode, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, useAppSelector, store } from '../lib/redux/store'
import { Provider } from 'react-redux'
import { useAuth } from '@/contexts/auth-context'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import AuthOverlay from '@/components/AuthOverlay'
import RightSidebar from '@/modules/chat/RightSidebar'
import { BotMessageSquare } from 'lucide-react'


function ClientLayoutContent({ children }: { children: ReactNode }) {
  const principal = useAppSelector((state: RootState) => state.user.principal)
  const name = useAppSelector((state: RootState) => state.user.name)
  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = React.useState(false)


  // Prevent body scroll when sidebar is open
  React.useEffect(() => {
    if (isRightSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isRightSidebarOpen]);

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <main className="flex flex-col h-screen flex-1 transition-all duration-300">
        <Header
          title={title}
          subtitle={subtitle}
          user={{
            principalId: principal ?? '',
            name: name || undefined,
          }}
        />
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
      {isRightSidebarOpen && (
        <RightSidebar isOpen={isRightSidebarOpen} onToggle={toggleRightSidebar} />
      )}
      {!isRightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="fixed right-4 bottom-10 z-50 bg-[#FEB64D] rounded-full py-3 px-3"
        >
          <BotMessageSquare />
        </button>
      )}
      <AuthOverlay />
    </div>
  )
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </Provider>
  )
} 