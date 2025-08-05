import BitcoinIntegration from '@/components/BitcoinIntegration';

export default function BitcoinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bitcoin Integration</h1>
          <p className="text-gray-600">
            Connect your SafeSplit escrow to Bitcoin using cKBTC for secure, fast, and low-cost transactions.
          </p>
        </div>
        
        <BitcoinIntegration />
      </div>
    </div>
  );
} 