"use client"

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Summary from './Summary';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from "@/contexts/auth-context";
import { createSplitDappActor } from "@/lib/icp/splitDapp";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { ToEntry } from "@/modules/transactions/types";
import { RootState } from "@/lib/redux/store";
import TransactionDialog from "./Dialog";
import { escrowFormSchema } from "@/validation/escrow";
import { useEscrowActions } from "@/hooks/useEscrowActions";
import Form from "./Form";
import AIAssistant from "./AIAssistant";
import { Resolver } from "react-hook-form";

type FormData = z.infer<typeof escrowFormSchema>;

const TransactionForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editTxId = searchParams.get('edit');
  const { principal } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const { createEscrow, updateEscrow } = useEscrowActions()

  // Get UI state from Redux
  const { newTxId } = useSelector((state: RootState) => state.escrow);

  const form = useForm<FormData>({
    resolver: zodResolver(escrowFormSchema) as Resolver<FormData>,
    defaultValues: {
      title: "",
      btcAmount: "",
      recipients: [
        {
          id: "recipient-1",
          name: "",
          principal: "",
          percentage: 100 as number
        }
      ],
      useSeiAcceleration: true
    }
  });

  const { setValue, getValues, handleSubmit } = form;

  // Load existing transaction data if in edit mode
  useEffect(() => {
    const loadTransactionForEdit = async () => {
      if (!editTxId || !principal) return;

      try {
        const actor = await createSplitDappActor();
        const result = await actor.getTransaction(editTxId, principal);

        if (Array.isArray(result) && result.length > 0) {
          const tx = result[0];
          setValue("title", tx.title);

          // Convert recipients to the form format
          const formRecipients = tx.to.map((recipient: ToEntry, index: number) => ({
            id: `recipient-${index + 1}`,
            name: "",
            principal: typeof recipient.principal === "string" ? recipient.principal : (recipient.principal as { toText: () => string }).toText(),
            percentage: Number(recipient.percentage)
          }));

          setValue("recipients", formRecipients);

          // Calculate total BTC amount
          const totalAmount = tx.to.reduce((sum: number, recipient: ToEntry) => sum + Number(recipient.amount), 0);
          setValue("btcAmount", (totalAmount / 1e8).toString());
        }
      } catch (error) {
        console.error('Failed to load transaction for editing:', error);
        toast.error('Failed to load transaction for editing');
      }
    };

    loadTransactionForEdit();
  }, [editTxId, principal, setValue]);

  // Load data from AI assistant chat
  useEffect(() => {
    const loadChatData = () => {
      try {
        const chatData = sessionStorage.getItem('splitsafe_chat_data');
        if (chatData) {
          const data = JSON.parse(chatData);
          console.log('DEBUG: TransactionForm received chat data:', data);
          
          // Populate title if provided
          if (data.title) {
            console.log('DEBUG: Setting title to:', data.title);
            setValue("title", data.title);
          }
          
          // Populate amount if provided
          if (data.amount) {
            console.log('DEBUG: Setting btcAmount to:', data.amount);
            setValue("btcAmount", data.amount);
          }
          
          // Populate recipients if provided
          if (data.recipients && Array.isArray(data.recipients) && data.recipients.length > 0) {
            const recipientCount = data.recipients.length;
            const basePercentage = Math.floor(100 / recipientCount);
            const remainder = 100 - (basePercentage * recipientCount);
            
            const formRecipients = data.recipients.map((recipient: string, index: number) => ({
              id: `recipient-${index + 1}`,
              name: "",
              principal: recipient,
              percentage: basePercentage + (index < remainder ? 1 : 0) // Distribute remainder to first few recipients
            }));
            
            setValue("recipients", formRecipients);
          }
          
          // Clear the sessionStorage data after using it
          sessionStorage.removeItem('splitsafe_chat_data');
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
      }
    };

    loadChatData();
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    const formDataWithTokenType = {
      ...data,
      tokenType: 'btc' as const
    };
    if (editTxId) {
      await updateEscrow(formDataWithTokenType);
    } else {
      await createEscrow(formDataWithTokenType);
    }
  };

  // Create props for the Summary component
  const summaryProps = {
    form,
    handleInitiateEscrow: () => handleSubmit(onSubmit)(),
    newTxId,
    isEditMode: !!editTxId
  };

  return (
    <div className="flex gap-4 min-h-screen w-full">
      <div className="flex-1 min-w-0">
        <AIAssistant form={form} />
        <Form form={form} />
      </div>
      <div className="w-80 flex-shrink-0">
        <Summary {...summaryProps} />
      </div>

      <TransactionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        amount={getValues("btcAmount")}
        onDone={() => {
          setShowDialog(false);
          if (newTxId) {
            router.push(`/transactions/${newTxId}`);
          } else {
            router.push('/transactions');
          }
        }}
      />
    </div>
  );
};

export default TransactionForm;
