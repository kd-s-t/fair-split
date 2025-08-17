import { createSplitDappActor } from './splitDapp';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export async function getTransactionDetails(transactionId: string, callerPrincipal: string) {
  try {
    const actor = await createSplitDappActor();
    const caller = Principal.fromText(callerPrincipal);
    
    const result = await actor.getTransaction(transactionId, caller);
    
    if (!Array.isArray(result) || result.length === 0) {
      toast.error('Transaction not found');
      return null;
    }
    
    const transaction = result[0];
    console.log('Transaction details:', transaction);
    
    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    toast.error(`Failed to get transaction details: ${(error as Error).message}`);
    return null;
  }
}

export async function approveTransactionById(
  transactionId: string,
  callerPrincipal: string
): Promise<boolean> {
  try {
    // First, get the transaction details
    const transaction = await getTransactionDetails(transactionId, callerPrincipal);
    
    if (!transaction) {
      return false;
    }
    
    const actor = await createSplitDappActor();
    const caller = Principal.fromText(callerPrincipal);
    
    // Find if the caller is a recipient in this transaction
    const recipientEntry = transaction.to.find((entry: any) => {
      const entryPrincipal = typeof entry.principal === 'string' 
        ? entry.principal 
        : entry.principal.toText();
      return entryPrincipal === callerPrincipal;
    });
    
    if (!recipientEntry) {
      toast.error('You are not a recipient of this transaction');
      return false;
    }
    
    // Get the sender principal
    const senderPrincipal = typeof transaction.from === 'string' 
      ? transaction.from 
      : transaction.from.toText();
    
    // Approve the transaction
    await actor.recipientApproveEscrow(
      Principal.fromText(senderPrincipal),
      transactionId,
      caller
    );
    
    toast.success(`Transaction ${transactionId} approved successfully!`);
    return true;
  } catch (error) {
    console.error('Error approving transaction:', error);
    toast.error(`Failed to approve transaction: ${(error as Error).message}`);
    return false;
  }
}

// Function to approve the specific transaction you mentioned
export async function approveSpecificTransaction(callerPrincipal: string): Promise<boolean> {
  const transactionId = "1755403244998582000-ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe-582000";
  return approveTransactionById(transactionId, callerPrincipal);
}
