import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUserName } from "../lib/redux/userSlice";
import { useAppSelector } from "../lib/redux/store";
import { Principal } from "@dfinity/principal";
import type { RootState } from "../lib/redux/store";
import { createSplitDappActor } from "@/lib/icp/splitDapp";

export default function EditNameModal({
  open,
  onClose,
  principalId,
  onNameSaved,
}: {
  open: boolean;
  onClose: () => void;
  principalId: string;
  onNameSaved?: () => void;
}) {
  const name = useAppSelector((state: RootState) => state.user.name);
  const [nameInput, setNameInput] = useState(name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const principal = useAppSelector((state: RootState) => state.user.principal);

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      if (!principal) throw new Error("No principal found");
      const actor = await createSplitDappActor();
      await actor.setName(Principal.fromText(principal), nameInput);
      toast.success("Name updated successfully!");
      dispatch(setUserName(nameInput));
      onClose();
      if (onNameSaved) onNameSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(principalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="dark:bg-slate-900 p-6 rounded-xl shadow-xl w-full max-w-xs"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-2">Edit Display Name</h2>
        <div className="mb-4 flex flex-col items-start">
          <span className="text-xs text-muted-foreground mb-1">
            Principal ID
          </span>
          <div className="relative flex items-center gap-2 w-full">
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded break-all select-all border border-slate-200 dark:border-slate-700 w-full">
              {principalId}
            </span>
            <button
              type="button"
              className="p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900 border border-transparent hover:border-yellow-400 transition cursor-pointer"
              onClick={handleCopy}
              aria-label="Copy principal ID"
            >
              <Copy className="w-4 h-4 text-yellow-500" />
            </button>
            <AnimatePresence>
              {copied && (
                <motion.span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-8 bg-yellow-400 text-black px-3 py-1 rounded shadow font-semibold text-xs z-10 pointer-events-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        <input
          className="w-full border rounded px-3 py-2 mb-4"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-yellow-400 hover:bg-yellow-500 font-semibold flex items-center justify-center cursor-pointer"
            onClick={handleSaveName}
            disabled={isSaving}
          >
            {isSaving ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-black"
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
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
