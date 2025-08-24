"use client"

import React from 'react';
import { motion } from 'framer-motion';
import ICPAuth from '@/components/ICPAuth';
import { useAppSelector } from '@/lib/redux/store';
import type { RootState } from '@/lib/redux/store';

export default function AuthOverlay() {
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!principal) {
      const timer = setTimeout(() => setShow(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [principal]);

  if (principal || !show) return null;

  return (
    <motion.div
      className="fixed"
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <ICPAuth />
    </motion.div>
  );
} 