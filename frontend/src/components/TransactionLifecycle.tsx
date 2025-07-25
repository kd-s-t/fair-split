import * as React from 'react';

interface Step {
  label: string;
  description: string;
}

interface TransactionLifecycleProps {
  currentStep: number; // 0-based index
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { label: 'Locked', description: 'Signed by ICP threshold ECDSA' },
  { label: 'Trigger Met', description: 'Escrow condition fulfilled' },
  { label: 'Splitting', description: 'Payout being distributed' },
  { label: 'Released', description: 'Funds sent to Bitcoin mainnet' },
];

export function TransactionLifecycle({ currentStep, steps = defaultSteps }: TransactionLifecycleProps) {
  return (
      <ol className="relative ml-4 mb-6">
        {steps.map((step, idx, array) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isLastIdx = idx === array.length - 1;

          return (
            <li key={step.label} className={`pl-6 pb-8 last:pb-0 relative ${isLastIdx ? '!border-none': ''} border-l-2 ${(isCurrent || isCompleted) ? 'border-[#FEB64D]' : 'border-[#424444]'} `}>
              <span className={
                [
                  'absolute -left-4 flex items-center justify-center w-7 h-7 rounded-full border-2',
                  isCompleted ? 'bg-[#181818] border-[#FEB64D]' : isCurrent ? 'bg-[#FEB64D] border-[#FEB64D]' : 'bg-[#222] border-[#444]',
                ].join(' ')
              }>
                {isCompleted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#FEB64D" strokeWidth="2" fill="none" />
                    <path d="M7 13l3 3 7-7" stroke="#FEB64D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                ) : isCurrent ? (
                  <span className="block w-3 h-3 bg-[#FEB64D] rounded-full"></span>
                ) : (
                  <span className="block w-3 h-3 bg-[#222] rounded-full"></span>
                )}
              </span>
              <div className={isCompleted || isCurrent ? 'text-white' : 'text-gray-500'}>
                <div className="font-semibold text-base">
                  {step.label}
                </div>
                <div className="text-sm text-[#9F9F9F]">
                    <span>{step.description}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
  );
} 