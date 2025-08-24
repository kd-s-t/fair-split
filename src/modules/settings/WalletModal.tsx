import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog-new"
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Wallet Modal Component
const WalletModal = ({ isOpen, onClose, principalId }: { isOpen: boolean; onClose: () => void; principalId: string }) => {
  const { icpBalance, ckbtcAddress } = useUser();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!bg-[#212121] border border-[#303333] !w-[540px] !max-w-[90vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Wallet</DialogTitle>
          <DialogDescription>
            Your multi-chain wallet information. You can copy addresses for reference or use in transactions.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6">
          {/* ICP Principal */}
          <div>
            <Label className="block text-white">ICP Principal ID</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                  <input
                    type="text"
                    value={principalId}
                    readOnly
                    className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                    placeholder="Your ICP Principal ID"
                  />
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(principalId)}
                className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                  <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
            {icpBalance && (
              <div className="mt-2 text-sm text-[#A1A1A1]">
                Balance: {Number(icpBalance).toFixed(4)} ICP
              </div>
            )}
          </div>

          {/* ckBTC Address */}
          <div>
            <Label className="block text-white">cKBTC Address</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="bg-[#2B2B2B] border border-[#424444] rounded-md p-3">
                  <input
                    type="text"
                    value={ckbtcAddress || "No address generated"}
                    readOnly
                    className="w-full bg-transparent text-white placeholder-[#A1A1A1] outline-none"
                    placeholder="Your cKBTC address"
                  />
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(ckbtcAddress || "")}
                disabled={!ckbtcAddress}
                className="px-3 py-3 border border-[#7A7A7A] rounded-md hover:bg-[#3A3A3A] transition-colors bg-[#2A2A2A] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5.33" y="5.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                  <rect x="1.33" y="1.33" width="9.33" height="9.33" stroke="white" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="default">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletModal;