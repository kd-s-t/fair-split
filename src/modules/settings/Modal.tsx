"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUserName } from "@/lib/redux/userSlice";
import { useAppSelector } from "@/lib/redux/store";
import { Principal } from "@dfinity/principal";
import type { RootState } from "@/lib/redux/store";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { useAuth } from "@/contexts/auth-context";

import { SettingsModalProps } from './types';

export default function EditNameModal({
  open,
  onClose,

  onNameSaved,
}: SettingsModalProps) {
  const name = useAppSelector((state: RootState) => state.user.name);
  const [nameInput, setNameInput] = useState(name || "");
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const principal = useAppSelector((state: RootState) => state.user.principal);
  const { authClient } = useAuth();

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      if (!principal) throw new Error("No principal found");
      if (!authClient) throw new Error("No auth client found");
      const actor = await createSplitDappActor();
      
      // Save both name and username
      await actor.setNickname(Principal.fromText(principal), nameInput);
      const username = nameInput.toLowerCase().replace(/\s+/g, '');
      await actor.setUsername(Principal.fromText(principal), username);
      
      toast.success("Profile updated successfully!");
      dispatch(setUserName(nameInput));
      onClose();
      if (onNameSaved) onNameSaved();
    } finally {
      setIsSaving(false);
    }
  };



  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#212121] border border-[#303333] rounded-xl w-[540px] max-w-[90vw] max-h-[90vh] overflow-hidden shadow-lg"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#303333]">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-semibold">Edit profile</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <p className="text-[#A1A1A1] text-sm mt-2">
            Make changes to your profile here. Click save when you&apos;re done.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Name</label>
              <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                  placeholder="Enter your nickname"
                />
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                <input
                  type="text"
                  value={`@${nameInput.toLowerCase().replace(/\s+/g, '')}`}
                  readOnly
                  className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#303333] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white border border-[#7A7A7A] rounded-md hover:bg-[#2A2A2A] transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveName}
            className="bg-[#FEB64D] text-[#0D0D0D] px-4 py-2 rounded-md hover:bg-[#FEB64D]/90 transition-colors font-semibold flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            ) : null}
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
