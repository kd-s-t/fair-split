"use client";

import TransactionForm from "@/modules/escrow/TransactionForm";
import { motion } from "framer-motion";
import { useEffect, Suspense } from "react";
import { useDispatch } from "react-redux";
import { setTitle as setPageTitle, setSubtitle } from '@/lib/redux/store';
import { useSearchParams } from "next/navigation";

function EscrowPageContent() {
  const searchParams = useSearchParams();
  const editTxId = searchParams.get('edit');
  const dispatch = useDispatch();

  useEffect(() => {
    if (editTxId) {
      dispatch(setPageTitle('Edit escrow'));
      dispatch(setSubtitle('Update your escrow configuration'));
    } else {
      dispatch(setPageTitle('Create new escrow'));
      dispatch(setSubtitle('Configure your secure Bitcoin transaction'));
    }
  }, [dispatch, editTxId]);

  return (
    <>
      <motion.div
        className="flex flex-row w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TransactionForm />
      </motion.div>
    </>
  );
}

export default function EscrowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EscrowPageContent />
    </Suspense>
  );
}
