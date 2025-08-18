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

    const generateSplit = async () => {
        setIsGenerating(true);

        // Parse the description to extract information
        const parsed = parseDescription(description);
        setSetup(parsed);
        setIsGenerating(false);
    };

    const parseDescription = (desc: string): AiGeneratedSetup => {
        // Extract amount
        const amountMatch = desc.match(/(\d+\.?\d*)\s*BTC/);
        const totalAmount = amountMatch ? parseFloat(amountMatch[1]) : 0.03;

        // Extract recipients and percentages
        const recipients: Recipient[] = [];
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

        // Generate title based on recipients
        const title = recipients.length > 0
            ? `${recipients.map(r => r.name).join(", ")} Team`
            : "Software Development Team";

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

            console.log("setup", setup);

            // Set recipients
            const formRecipients = setup.recipients.map((recipient, index) => ({
                id: `recipient-${index + 1}`,
                name: recipient.name,
                principal: "",
                percentage: recipient.percentage
            }));

            form.setValue("recipients", formRecipients);

            setSetup(null);
            setDescription("");
        }
    };

    return (
        <div className="space-y-6">
            <Accordion key="ai-assistant" type="single" collapsible className="w-full">
                <AccordionItem value="ai-assistant" className="border-[#2A2A2A] bg-[#1A1A1A] rounded-[20px]">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline cursor-pointer no-underline [&>svg]:text-[#FEB64D] [&>svg]:transition-transform [&>svg]:duration-200 [&>svg]:ease-in-out [&[data-state=open]>svg]:rotate-180 [&:hover]:no-underline [&:focus]:no-underline [&:active]:no-underline">
                        <div className='flex flex-col'>
                            <div className="flex items-center gap-2">
                                <Bot color='#FEB64D' className="h-5 w-5" />
                                <Typography variant="h4">
                                    AI assistant
                                </Typography>
                                <Badge
                                    variant="outline"
                                    className="!bg-[#48351A] !border-[#BD822D] !text-[#FEB64D] uppercase"
                                >
                                    Beta
                                </Badge>
                            </div>
                            <Typography variant="muted">
                                Describe your payment split in natural language
                            </Typography>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <hr className='text-[#303434]' />
                        <div className="px-5 py-3 space-y-2">
                            <Label className='font-semibold'>Describe your payment split</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your payment split..."
                                className='h-24'
                            />
                            <Typography variant="muted" className='font-normal'>
                                Example: &quot;Send 0.03 BTC — 60% to Dev, 30% to Designer, 10% to QA&quot;
                            </Typography>
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
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {setup && (
                <div className="border-[#2A2A2A] bg-[#1A1A1A] rounded-[20px] p-5">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-[#FEB64D] h-4 w-4" />
                        <Typography variant="h4" className="text-[#FAFAFA]">
                            AI generated setup
                        </Typography>
                    </div>

                    <div className="space-y-4 mt-4">
                        <div>
                            <Label className="text-[#A1A1AA] mb-2">Title</Label>
                            <Input
                                value={setup.title}
                                onChange={(e) => setSetup({ ...setup, title: e.target.value })}
                                className="bg-[#2A2A2A] border-[#3A3A3A]"
                            />
                        </div>
                        <div>
                            <Label className="text-[#A1A1AA] mb-2">Total amount</Label>
                            <div className="flex items-center gap-2 text-[#FAFAFA]">
                                <Bitcoin color='#F97415' />
                                <Typography variant="base" className="font-semibold">{setup.totalAmount} BTC</Typography>
                            </div>
                        </div>
                        <div>
                            <Typography variant='small' className="mb-2">Recipients</Typography>
                            <div className='container !p-0'>
                                {setup.recipients.map((recipient, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border-b border-b-[#626262] last:border-b-0">
                                        <div>
                                            <Typography variant="base">{recipient.name}</Typography>
                                            <Typography variant="small" className="text-[#9F9F9F]" >
                                                {recipient.percentage} % • Address needed
                                            </Typography>
                                        </div>
                                        <Typography variant="base" className="text-[#FEB64D]">
                                            {recipient.amount.toFixed(8)} BTC
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button
                            variant="default"
                            onClick={handleConfirmSetup}
                            className="w-full mt-6"
                        >
                            <Sparkles size={16} />
                            Confirm setup
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIAssistant;
