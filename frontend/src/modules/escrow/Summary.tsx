import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionDialog from '@/modules/escrow/Dialog';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TransactionSummaryProps } from './types';

const TransactionSummary = ({
  btcAmount,
  recipients,
  isLoading,
  handleInitiateEscrow,
  showDialog,
  setShowDialog,
  newTxId,
  isEditMode = false,
}: TransactionSummaryProps) => {
  const router = useRouter();
  return (
    <div className="w-[35%] min-w-[220px]">
      <TransactionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        amount={btcAmount}
        onDone={() => {
          setShowDialog(false);
          if (newTxId) {
            router.push(`/transactions/${newTxId}`);
          } else {
            router.push('/transactions');
          }
        }}
      />
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Typography variant="large">Escrow summary</Typography>
            <Shield color="#FEB64D" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="text-[#9F9F9F]">
              Status
            </Typography>
            <Badge
              variant="outline"
              className="!bg-[#48351A] !border-[#BD822D] !text-[#FEB64D]"
            >
              Pending
            </Badge>
          </div>
          <hr className="my-5 text-[#424444]" />
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-[#9F9F9F]">
              Total deposit
            </Typography>
            <Typography variant="base">
              {btcAmount || "0.00000000"} BTC
            </Typography>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Typography variant="small" className="text-[#9F9F9F]">
              Recipients
            </Typography>
            <Typography variant="base">{recipients.length}</Typography>
          </div>
          <hr className="mt-5 mb-7 text-[#424444]" />
          <div className="flex items-center gap-2">
            <Shield size={16} color="#FEB64D" />
            <Typography variant="base" className="text-[#FEB64D]">
              Trustless Escrow
            </Typography>
          </div>

          <Typography variant="muted" className="text-[#9F9F9F]">
            Powered by Internet Computer&apos;s native Bitcoin integration. No
            bridges, no wrapped BTC.
          </Typography>

          <motion.div
            className="relative overflow-hidden w-full mt-4"
          >
            <Button
              variant="default"
              className="w-full text-sm"
              disabled={isLoading}
              onClick={handleInitiateEscrow}
            >
              <Send size={16} />
              {isLoading ? "Processing..." : isEditMode ? "Update escrow" : "Initiate escrow"}
            </Button>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
                delay: 2,
              }}
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummary;
