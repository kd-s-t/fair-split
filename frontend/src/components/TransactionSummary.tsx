import { Card, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Send, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Recipient } from "@/types/Recipient";

type TransactionSummaryProps = {
  btcAmount: string;
  recipients: Recipient[];
  isLoading: boolean;
  handleInitiateEscrow: () => void;
};

const TransactionSummary = ({
  btcAmount,
  recipients,
  isLoading,
  handleInitiateEscrow,
}: TransactionSummaryProps) => {
  return (
    <div className="w-[35%] min-w-[220px]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Typography variant="h4">Escrow summary</Typography>
            <Shield color="#FEB64D" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <Typography variant="small" className="text-[#9F9F9F]">Status</Typography>
            <Badge
              variant="outline"
              className="!bg-[#48351A] !border-[#BD822D] !text-[#FEB64D] text-xs font-semibold"
            >
              Pending
            </Badge>
          </div>
          <hr className="my-5 text-[#424444]" />
          <div className="flex justify-between items-center">
            <Typography variant="small" className="text-[#9F9F9F]">Total deposit</Typography>
            <Typography variant="base">{btcAmount || "0.00000000"} BTC</Typography>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Typography variant="small" className="text-[#9F9F9F]">Recipients</Typography>
            <Typography variant="base">{recipients.length}</Typography>
          </div>
          <hr className="mt-5 mb-7 text-[#424444]" />
          <div className="flex items-center gap-2">
            <Shield size={16} color="#FEB64D" />
            <Typography variant="base" className="text-[#FEB64D]">Trustless Escrow</Typography>
          </div>

          <Typography variant="muted" className="text-[#9F9F9F]">
            Powered by Internet Computer's native Bitcoin integration. No
            bridges, no wrapped BTC.
          </Typography>

          <Button
            variant="default"
            className="w-full mt-4 text-sm text-[#0D0D0D] font-medium gap-2"
            disabled={isLoading}
            onClick={handleInitiateEscrow}
          >
            <Send size={16} />
            {isLoading ? "Processing..." : "Initiate escrow"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummary;
