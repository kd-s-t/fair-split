'use client'

import AuthOverlay from '@/components/AuthOverlay'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import { useUser } from '@/hooks/useUser'
import RightSidebar from '@/modules/chat/RightSidebar'
import { BotMessageSquare } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import { Provider, useSelector } from 'react-redux'
import { RootState, store } from '../lib/redux/store'
import { AnimatePresence, motion } from 'framer-motion'


function ClientLayoutContent({ children }: { children: ReactNode }) {

  const { principal, name } = useUser()

  const title = useSelector((state: RootState) => state.layout.title)
  const subtitle = useSelector((state: RootState) => state.layout.subtitle)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)

  // No need to prevent body scroll for overlay sidebar

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="grid grid-cols-10 grid-rows-[auto_1fr] h-screen w-screen overflow-hidden p-5">
      {/* Left Sidebar - spans both rows */}
      <div className="col-span-1 row-span-2">
        <Sidebar />
      </div>
      
      {/* Header - row 1, columns 2-10 */}
      <div className="col-span-9 row-span-1 overflow-hidden  p-5">
        <Header
          title={title}
          subtitle={subtitle}
          user={{
            principalId: principal ?? '',
            name: name || undefined,
          }}
        />
      </div>
      
      {/* Main Content + AI Assistant Container - row 2, columns 2-10 */}
      <div className="col-span-9 row-span-1 overflow-hidden p-5" >
        <div className="flex h-full">
          {/* Main Content - flex-1 when AI closed, flex-[8] when AI open */}
          <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'flex-[8]' : 'flex-1'}`}>
            <div className="h-full m-5 overflow-auto min-w-0">{children}</div>
          </div>
          
          {/* AI Assistant - slides in from right */}
          <AnimatePresence>
            {isRightSidebarOpen && (
              <motion.div
                initial={{ transform: 'translateX(100%)' }}
                animate={{ transform: 'translateX(0%)' }}
                exit={{ transform: 'translateX(100%)' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[20%] flex-shrink-0 overflow-hidden"
              >
                <RightSidebar isOpen={isRightSidebarOpen} onToggle={toggleRightSidebar} />
              </motion.div>
            )}
          </AnimatePresence>
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