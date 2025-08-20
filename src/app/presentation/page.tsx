import PresentationEscrowDetails from '@/modules/escrow/PresentationEscrowDetails';
import { Typography } from '@/components/ui/typography';

export default function PresentationPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Typography variant="h1" className="text-white">
            SplitSafe Escrow Demo
          </Typography>
          <Typography variant="large" className="text-[#9F9F9F]">
            Native Bitcoin Escrow Execution via Internet Computer
          </Typography>
        </div>

        {/* Demo Component */}
        <PresentationEscrowDetails />

        {/* Additional Info */}
        <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-6">
          <Typography variant="large" className="text-white mb-4">
            Key Features Demonstrated
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#2B2B2B] p-4 rounded-lg">
              <Typography variant="base" className="text-[#FEB64D] font-semibold mb-2">
                Native Bitcoin
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                Direct Bitcoin transactions without bridges or wrapped tokens
              </Typography>
            </div>
            <div className="bg-[#2B2B2B] p-4 rounded-lg">
              <Typography variant="base" className="text-[#FEB64D] font-semibold mb-2">
                Threshold ECDSA
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                Secure multi-signature execution with distributed key management
              </Typography>
            </div>
            <div className="bg-[#2B2B2B] p-4 rounded-lg">
              <Typography variant="base" className="text-[#FEB64D] font-semibold mb-2">
                Automated Execution
              </Typography>
              <Typography variant="small" className="text-[#9F9F9F]">
                No human intervention required for escrow release
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
