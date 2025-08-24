"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Sparkles, Bitcoin, Bot } from "lucide-react";
import { Typography } from '@/components/ui/typography';
import { Badge } from '@/components/ui/badge';
import { UseFormReturn } from "react-hook-form";
import z from 'zod';
import { escrowFormSchema } from '@/validation/escrow';
import { parseUserMessageWithAI } from '@/lib/messaging/aiParser';
import { handleNavigation, executeNavigation } from '@/lib/messaging/navigationService';
import { convertCurrencyToBTC } from '@/lib/utils';
import { toast } from 'sonner';

type FormData = z.infer<typeof escrowFormSchema>;

interface Recipient {
  name: string;
  percentage: number;
  amount: number;
  address: string;
}

interface AiGeneratedSetup {
  title: string;
  totalAmount: number;
  recipients: Recipient[];
}

interface AIAssistantProps {
  form: UseFormReturn<FormData>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ form }) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [setup, setSetup] = useState<AiGeneratedSetup | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  const generateSplit = async () => {
    if (!description.trim()) {
      toast.error("Please describe your payment split");
      return;
    }

    setIsGenerating(true);

    try {
      // Use the existing AI parser to understand the user's description
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

      const parsedAction = await parseUserMessageWithAI(description, apiKey);

      if (parsedAction && parsedAction.type === 'create_escrow') {
        // Extract information from the AI parsed action
        let totalAmount = parseFloat(parsedAction.amount) || 0.03;
        const recipients = parsedAction.recipients || [];

        // If we have original currency, use real-time conversion instead of AI's static conversion
        if (parsedAction.originalCurrency) {
          const currencyMatch = parsedAction.originalCurrency.match(/(\$|€|£|¥)(\d+(?:\.\d{1,2})?)/);
          if (currencyMatch) {
            const currencySymbol = currencyMatch[1];
            const currencyAmount = parseFloat(currencyMatch[2]);
            // Use real-time conversion
            totalAmount = parseFloat(await convertCurrencyToBTC(currencyAmount, currencySymbol));
          }
        }

        // Use custom title if provided, otherwise generate based on recipients
        const title = parsedAction.title || (recipients.length > 0
          ? `${recipients.length} Recipient${recipients.length > 1 ? 's' : ''} Payment`
          : "Payment Split");

        // Create recipient objects with equal distribution
        const recipientObjects: Recipient[] = recipients.map((recipient, index) => {
          const percentage = Math.floor(100 / recipients.length);
          const amount = (percentage / 100) * totalAmount;

          return {
            name: `Recipient ${index + 1}`,
            percentage,
            amount,
            address: recipient // This will be the ICP principal ID
          };
        });

        // Handle remainder for equal distribution
        if (recipientObjects.length > 0) {
          const totalAssigned = recipientObjects.reduce((sum, r) => sum + r.percentage, 0);
          const remainder = 100 - totalAssigned;
          if (remainder > 0) {
            recipientObjects[0].percentage += remainder;
            recipientObjects[0].amount = (recipientObjects[0].percentage / 100) * totalAmount;
          }
        }

        const generatedSetup: AiGeneratedSetup = {
          title,
          totalAmount,
          recipients: recipientObjects
        };

        setSetup(generatedSetup);

        toast.success("AI generated setup ready!");
      } else if (parsedAction && parsedAction.type === 'navigate') {
        // Handle navigation requests
        const navigation = handleNavigation(parsedAction);
        executeNavigation(navigation);

      } else {
        // Fallback to local parsing if AI doesn't work
        const parsed = await parseDescription(description);
        setSetup(parsed);
        toast.success("Setup generated using local parser");
      }
    } catch (error) {
      console.error('Error generating split:', error);
      // Fallback to local parsing
      const parsed = await parseDescription(description);
      setSetup(parsed);
      toast.success("Setup generated using local parser");
    } finally {
      setIsGenerating(false);
    }
  };

  const parseDescription = async (desc: string): Promise<AiGeneratedSetup> => {
    // Extract amount and check for currency conversion
    let totalAmount = 0.03;

    // Check for currency amounts first
    const currencyMatch = desc.match(/(\$|€|£|¥)(\d+(?:\.\d{1,2})?)/);
    if (currencyMatch) {
      const currencySymbol = currencyMatch[1];
      const currencyAmount = parseFloat(currencyMatch[2]);

      // Convert currency to BTC using centralized function
      totalAmount = parseFloat(await convertCurrencyToBTC(currencyAmount, currencySymbol));
    } else {
      // Extract BTC amount
      const amountMatch = desc.match(/(\d+\.?\d*)\s*btc/i);
      totalAmount = amountMatch ? parseFloat(amountMatch[1]) : 0.03;
    }

    // Extract recipients - look for ICP principals or addresses
    const recipients: Recipient[] = [];

    // Pattern 1: Look for ICP principals (long alphanumeric strings with hyphens)
    const icpPrincipalMatches = desc.match(/[a-zA-Z0-9\-]{20,}/g);

    if (icpPrincipalMatches) {
      icpPrincipalMatches.forEach((principal, index) => {
        // Skip if it looks like a number or short string
        if (principal.length < 20 || /^\d+$/.test(principal)) return;

        recipients.push({
          name: `Recipient ${index + 1}`,
          percentage: Math.floor(100 / icpPrincipalMatches.length),
          amount: (Math.floor(100 / icpPrincipalMatches.length) / 100) * totalAmount,
          address: principal
        });
      });
    }

    // Pattern 2: Look for percentage patterns
    const recipientMatches = desc.match(/(\d+)%\s*to\s+(\w+)/g);
    if (recipientMatches) {
      recipientMatches.forEach(match => {
        const percentageMatch = match.match(/(\d+)%\s*to\s+(\w+)/);
        if (percentageMatch) {
          const percentage = parseInt(percentageMatch[1]);
          const name = percentageMatch[2];
          const amount = (percentage / 100) * totalAmount;

          recipients.push({
            name,
            percentage,
            amount,
            address: ""
          });
        }
      });
    }

    // Handle equal distribution only if we have recipients but no percentages were specified
    if (recipients.length > 0) {
      // Check if any recipient has a percentage > 0 (meaning percentages were parsed)
      const hasPercentages = recipients.some(r => r.percentage > 0);
      
      if (!hasPercentages) {
        // Only apply equal distribution if no percentages were found
        const equalPercentage = Math.floor(100 / recipients.length);
        const remainder = 100 - (equalPercentage * recipients.length);

        recipients.forEach((recipient, index) => {
          recipient.percentage = equalPercentage + (index === 0 ? remainder : 0);
          recipient.amount = (recipient.percentage / 100) * totalAmount;
        });
      } else {
        // Update amounts based on the parsed percentages
        recipients.forEach((recipient) => {
          recipient.amount = (recipient.percentage / 100) * totalAmount;
        });
      }
    }

    // Extract title if provided, otherwise generate based on recipients
    let title = "Payment Split";

    // Look for title pattern: "title <title_text>" or words at the end that aren't ICP principals
    const titleMatch = desc.match(/title\s+(\w+)/i);
    if (titleMatch) {
      title = titleMatch[1];
    } else {
      // Look for words at the end that aren't ICP principals or numbers
      const words = desc.split(/[,\s]+/).filter(word => word.trim());
      
      // Find the last sequence of words that aren't ICP principals
                 const titleWords = [];
      for (let i = words.length - 1; i >= 0; i--) {
        const word = words[i];
        // Check if the word is not an ICP principal (doesn't contain hyphens and is short)
        if (word && !word.includes('-') && word.length < 20 && !/^\d+$/.test(word)) {
          titleWords.unshift(word);
        } else {
          break; // Stop when we hit an ICP principal or number
        }
      }
      
      if (titleWords.length > 0) {
        title = titleWords.join(' ');
      } else if (recipients.length > 0) {
        title = `${recipients.length} Recipient${recipients.length > 1 ? 's' : ''} Payment`;
      }
    }

    return {
      title,
      totalAmount,
      recipients
    };
  };

  const handleConfirmSetup = () => {
    if (setup) {
      form.setValue("title", setup.title);
      form.setValue("btcAmount", setup.totalAmount.toString());

      // Set recipients
      const formRecipients = setup.recipients.map((recipient, index) => ({
        id: `recipient-${index + 1}`,
        name: recipient.name,
        principal: recipient.address, // Use the address field for ICP principal
        percentage: recipient.percentage
      }));

      form.setValue("recipients", formRecipients);

      setSetup(null);
      setDescription("");
      setIsAccordionOpen(false);
      toast.success("Setup applied to form!");
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={isAccordionOpen ? "ai-assistant" : ""}
      onValueChange={(value) => setIsAccordionOpen(value === "ai-assistant")}
      className="mb-6 rounded-[20px] overflow-hidden"
    >
      <AccordionItem value="ai-assistant" className="bg-[#1A1A1A] data-[state=open]:border data-[state=open]:border-[#FEB64D] rounded-[20px] transition-all duration-300 ease-in-out">
        <AccordionTrigger className="px-5 py-4 hover:no-underline !hover:no-underline cursor-pointer transition-all duration-200 hover:bg-[#2A2A2A]/50">
          <div className="flex items-center gap-2">
            <Bot color='#FEB64D' className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            <Typography variant="h4" className="text-[#FAFAFA] no-underline hover:no-underline">
              AI assistant
            </Typography>
            <Badge
              variant="outline"
              className="!bg-[#48351A] !border-[#BD822D] !text-[#FEB64D] uppercase"
            >
              Beta
            </Badge>
          </div>
        </AccordionTrigger>

        <AccordionContent className="!p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className='font-semibold text-[#A1A1AA]'>Describe your payment split</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Send 0.03 BTC — 60% to Dev, 30% to Designer, 10% to QA"
                className='h-20 bg-[#2A2A2A] border-[#3A3A3A]'
                rows={5}
              />
              <Typography variant='muted'>Example: &quot;Send 0.03 BTC — 60% to Dev, 30% to Designer, 10% to QA&quot;</Typography>
              <Button
                variant="outline"
                onClick={generateSplit}
                disabled={isGenerating}
                className="w-full mt-4"
              >
                <Sparkles size={16} />
                {isGenerating ? "Generating..." : "Generate split"}
              </Button>
            </div>

            {setup && (
              <div className="container-gray space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#FEB64D] h-4 w-4" />
                  <Typography variant="h4" className="text-[#FAFAFA]">
                    AI Generated Setup
                  </Typography>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-[#A1A1AA]">Title</Label>
                    <Input
                      value={setup.title}
                      onChange={(e) => setSetup({ ...setup, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-[#A1A1AA]">Total amount</Label>
                    <div className="flex items-center gap-2 text-[#FAFAFA]">
                      <Bitcoin color='#F97415' />
                      <Typography variant="base" className="font-semibold">{setup.totalAmount} BTC</Typography>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#A1A1AA]">Recipients</Label>
                    <div className="border border-[#626262] rounded-lg overflow-hidden">
                      {setup.recipients.map((recipient, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 ${index !== setup.recipients.length - 1 ? 'border-b border-[#626262]' : ''
                            } bg-[#2B2B2B]`}
                        >
                          <div className="flex-1">
                            <Typography variant="base" className="text-white font-medium">
                              {recipient.name}
                            </Typography>
                            <Typography variant="small" className="text-[#9F9F9F]">
                              {recipient.percentage}% • {recipient.address || "Address needed"}
                            </Typography>
                          </div>
                          <Typography variant="base" className="text-[#FEB64D] font-semibold">
                            {recipient.amount.toFixed(8)} BTC
                          </Typography>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="default"
                    onClick={handleConfirmSetup}
                    className="w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <Sparkles size={16} />
                    Confirm setup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AIAssistant;
