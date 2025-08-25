'use client'

import AuthOverlay from '@/components/AuthOverlay'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import { useUser } from '@/hooks/useUser'
import RightSidebar from '@/modules/chat/RightSidebar'
import { BotMessageSquare } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { RootState, store } from '../lib/redux/store'
import { AnimatePresence, motion } from 'framer-motion'
import { setCkbtcAddress, setSeiAddress } from '@/lib/redux/userSlice'
import { createSplitDappActor } from '@/lib/icp/splitDapp'
import { useEffect } from 'react'


function ClientLayoutContent({ children }: { children: ReactNode }) {

  const { principal } = useUser()
  const dispatch = useDispatch()
  const { ckbtcAddress, seiAddress } = useSelector((state: RootState) => state.user)

  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)

  // Auto-generate addresses when user is authenticated
  useEffect(() => {
    if (principal) {
      const generateAddresses = async () => {
        try {
          const actor = await createSplitDappActor();

          // Generate cKBTC address if not exists
          if (!ckbtcAddress) {
            try {
              const ckbtcResult = await actor.requestCkbtcWallet() as { ok: { btcAddress: string } } | { err: string };
              if ('ok' in ckbtcResult) {
                dispatch(setCkbtcAddress(ckbtcResult.ok.btcAddress));
              }
            } catch (error) {
              console.error('Failed to generate cKBTC address:', error);
            }
          }

          // Generate SEI address if not exists
          if (!seiAddress) {
            try {
              const seiResult = await actor.requestSeiWalletAnonymous() as { ok: { seiAddress: string } } | { err: string };
              if ('ok' in seiResult) {
                dispatch(setSeiAddress(seiResult.ok.seiAddress));
              }
            } catch (error) {
              console.error('Failed to generate SEI address:', error);
            }
          }
        } catch (error) {
          console.error('Failed to generate addresses:', error);
        }
      };

      generateAddresses();
    }
  }, [principal, ckbtcAddress, seiAddress, dispatch]);

  // No need to prevent body scroll for overlay sidebar

  const toggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen)
  }

  return (
    <div className="flex h-screen w-screen">
      {/* Left Sidebar */}
      <div className={`${isLeftSidebarOpen ? 'w-[15%]' : 'w-[5%]'} flex-shrink-0 mt-[16px] ml-[16px] transition-all duration-300`} data-section="sidebar">
        <Sidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0" data-section="header">
          <Header />
        </div>

        {/* Main Content + AI Assistant Container */}
        <div className="flex-1 overflow-hidden ml-[16px] mt-[24px] mr-[16px] mb-[16px]" data-section="main-content">
          <div className="flex h-full">
            {/* Main Content - flex-1 when AI closed, flex-[8] when AI open */}
            <div className={`transition-all duration-300 ${isRightSidebarOpen ? 'flex-[8]' : 'flex-1'}`} data-section="content">
              <div className="h-full min-w-0 overflow-y-auto">{children}</div>
            </div>

            {/* AI Assistant - slides in from right (only when authenticated) */}
            <AnimatePresence>
              {isRightSidebarOpen && principal && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 320, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-80 flex-shrink-0 overflow-hidden ml-[16px] mr-[16px] mt-[16px] mb-[16px]"
                  data-section="right-sidebar"
                >
                  <RightSidebar onToggle={toggleRightSidebar} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat Button - fixed position (only when authenticated) */}
      {!isRightSidebarOpen && principal && (
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