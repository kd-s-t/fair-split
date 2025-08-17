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
    resolver: zodResolver(escrowFormSchema),
    defaultValues: {
      title: "",
      btcAmount: "",
      recipients: [
        {
          id: "recipient-1",
          principal: "",
          percentage: 100
        }
      ]
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

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    if (editTxId) {
      await updateEscrow(data);
    } else {
      await createEscrow(data);
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
    <div className="flex gap-6 p-6 min-h-screen bg-[#0A0A0A]">
      <div className="w-[70%] min-w-[340px]">
        <AIAssistant form={form} />
        <Form form={form} />
      </div>
      <Summary {...summaryProps} />

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
