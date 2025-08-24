import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog-new";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsModalProps } from "./types";
import { useDispatch } from "react-redux";
import { setUserName } from "@/lib/redux/userSlice";
import { Principal } from "@dfinity/principal";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-dropdown-menu";

// Wallet Modal Component
const EditProfileModal = ({ open, onClose, onNameSaved }: SettingsModalProps) => {
  const { name, principal } = useUser();
  const { authClient } = useAuth();
  const [nameInput, setNameInput] = useState(name || "");
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();

  // Update input field when modal opens or name changes
  useEffect(() => {
    if (open) {
      setNameInput(name || "");
    }
  }, [open, name]);

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!bg-[#212121] border border-[#303333] !w-[456px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription className="text-[#A1A1AA]">
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <Separator className="my-1 bg-[#424444] h-0.25" />

        {/* Content */}
        <div className="space-y-4">
          {/* Name Input */}
          <div>
            <Label className="block text-white">Name</Label>
            <div className="bg-[#353535] border border-[#505050] rounded-md p-3">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-transparent text-white placeholder-[#B0B0B0] outline-none"
                placeholder="Enter your nickname"
              />
            </div>
          </div>

          {/* Username Input */}
          <div>
            <Label className="block">Username</Label>
            <div className="bg-[#353535] border border-[#505050] rounded-md p-3">
              <input
                type="text"
                value={`@${nameInput.toLowerCase().replace(/\s+/g, '')}`}
                readOnly
                className="w-full bg-transparent text-white placeholder-[#B0B0B0] outline-none"
                placeholder="@username"
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse justify-between">
          <div className="flex-1 flex justify-start">
            <Button type="submit" onClick={handleSaveName} disabled={isSaving}>
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
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
};

export default EditProfileModal;