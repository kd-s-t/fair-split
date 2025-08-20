'use client'

import AuthOverlay from '@/components/AuthOverlay'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import { useUser } from '@/hooks/useUser'
import RightSidebar from '@/modules/chat/RightSidebar'
import { BotMessageSquare } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Provider, useSelector } from 'react-redux'
import { RootState, store } from '../lib/redux/store'
import { AnimatePresence, motion } from 'framer-motion'


function ClientLayoutContent({ children }: { children: ReactNode }) {

  const { principal, name } = useUser()

  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

  // No need to prevent body scroll for overlay sidebar

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
        <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Sidebar */}
      <div className={`${isLeftSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 p-5 transition-all duration-300`} data-section="sidebar">
        <Sidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0" data-section="header">
          <Header
            title={title}
            subtitle={subtitle}
            user={{
              principalId: principal ?? '',
              name: name || undefined,
            }}
          />
        </div>
        
        {/* Main Content + AI Assistant Container */}
        <div className="flex-1 overflow-hidden" data-section="main-content">
          <div className="flex h-full">
            {/* Main Content - flex-1 when AI closed, flex-[8] when AI open */}
            <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'flex-[8]' : 'flex-1'}`} data-section="content">
              <div className="h-full min-w-0 overflow-y-auto p-8 pr-10">{children}</div>
            </div>
            
            {/* AI Assistant - slides in from right */}
            <AnimatePresence>
              {isRightSidebarOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-80 flex-shrink-0 overflow-hidden"
                  data-section="right-sidebar"
                >
                  <RightSidebar onToggle={toggleRightSidebar} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Chat Button - fixed position */}
      {!isRightSidebarOpen && (
        <button
          onClick={toggleRightSidebar}
          className="fixed right-4 bottom-10 z-50 bg-[#FEB64D] rounded-full py-3 px-3 shadow-lg hover:shadow-xl hover:bg-[#FEA52D] hover:scale-105 transition-all duration-200 cursor-pointer"
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