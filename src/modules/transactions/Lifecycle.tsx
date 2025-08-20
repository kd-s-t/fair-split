'use client'

import * as React from 'react';
import { TransactionLifecycleProps, Step } from './types';
import { Typography } from '@/components/ui/typography';
import { CircleCheck } from 'lucide-react';

const defaultSteps: Step[] = [
  { label: 'Locked', description: 'Signed by ICP threshold ECDSA' },
  { label: 'Trigger Met', description: 'Escrow condition fulfilled' },
  { label: 'Splitting', description: 'Payout being distributed' },
  { label: 'Released', description: 'Funds sent to Bitcoin mainnet' },
];

export function TransactionLifecycle({ currentStep, steps = defaultSteps }: TransactionLifecycleProps) {
  return (
    <div className="bg-[#212121] border border-[#303434] rounded-[20px] p-5 space-y-6 w-[30%]">
      {/* Banner */}
      <div className="bg-[#48342A] border border-[#BD823D] rounded-[10px] p-4">
        <Typography variant="base" className="text-white">
          Native Bitcoin Escrow — No bridges or wrapped tokens
        </Typography>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.label} className="flex items-start space-x-3">
              {/* Timeline Column */}
              <div className="flex flex-col items-center w-6">
                {/* Circle */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-[#FEB64D] border-[#FEB64D]' 
                    : 'bg-[#0D0D0D] border-[#424444]'
                }`}>
                  {isCompleted ? (
                    <CircleCheck size={16} className="text-[#0D0D0D]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#5F5F5F]"></div>
                  )}
                </div>
                
                {/* Line */}
                {!isLast && (
                  <div className={`w-0.5 h-20 mt-0 ${
                    isCompleted ? 'bg-[#FEB64D]' : 'bg-[#424444]'
                  }`}></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <Typography 
                  variant="base" 
                  className={`font-semibold ${
                    isCompleted ? 'text-white' : 'text-[#9F9F9F]'
                  }`}
                >
                  {step.label}
                </Typography>
                <Typography 
                  variant="small" 
                  className="text-[#9F9F9F] mt-2"
                >
                  {step.description}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Banner */}
      <div className="bg-[#2B2B2B] border border-[#424444] rounded-[10px] p-4">
        <Typography variant="small" className="text-[#9F9F9F]">
          This escrow is executed fully on-chain using Internet Computer. No human mediation.
        </Typography>
      </div>
    </div>
  );
} 