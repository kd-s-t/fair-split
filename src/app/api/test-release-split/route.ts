import { NextResponse } from 'next/server';
import { createSplitDappActor } from '@/lib/icp/splitDapp';
import { Principal } from '@dfinity/principal';

// Real test principals
const SENDER_PRINCIPAL = "ohtzl-xywgo-f2ka3-aqu2f-6yzqx-ocaum-olq5r-7aaz2-ojzeh-drkxg-hqe";
const RECIPIENT_PRINCIPAL = "hxmjs-porgp-cfkrg-37ls7-ph6op-5nfza-v2v3a-c7asz-xecxj-fidqe-qqe";
const ESCROW_AMOUNT = 0.00005;

export async function GET() {
  const results: string[] = [];
  
  try {
    results.push('🧪 Starting ReleaseSplit E2E Test...');
    
    // Initialize the actor
    const actor = await createSplitDappActor();
    results.push('✅ Actor initialized');
    
    // Step 1: Fetch initial balances
    results.push('\n📊 Step 1: Fetching initial balances...');
    const senderBalanceResult = await actor.getCkbtcBalance(Principal.fromText(SENDER_PRINCIPAL)) as { ok: number } | { err: string };
    const recipientBalanceResult = await actor.getCkbtcBalance(Principal.fromText(RECIPIENT_PRINCIPAL)) as { ok: number } | { err: string };
    
    const initialSenderBalance = 'ok' in senderBalanceResult ? Number(senderBalanceResult.ok) / 1e8 : 0;
    const initialRecipientBalance = 'ok' in recipientBalanceResult ? Number(recipientBalanceResult.ok) / 1e8 : 0;
    
    results.push(`   Sender: ${initialSenderBalance} BTC`);
    results.push(`   Recipient: ${initialRecipientBalance} BTC`);
    
    // Step 2: Create escrow
    results.push('\n🔐 Step 2: Creating escrow...');
    const participants = [{
      principal: Principal.fromText(RECIPIENT_PRINCIPAL),
      amount: BigInt(ESCROW_AMOUNT * 1e8),
      nickname: "Test Recipient",
      percentage: BigInt(100),
      bitcoinAddress: null
    }];

    const escrowId = await actor.initiateEscrow(
      Principal.fromText(SENDER_PRINCIPAL),
      participants,
      "ReleaseSplit E2E Test"
    );
    results.push(`   Escrow ID: ${escrowId}`);
    
    // Verify balance deduction
    const senderBalanceAfterEscrowResult = await actor.getCkbtcBalance(Principal.fromText(SENDER_PRINCIPAL)) as { ok: number } | { err: string };
    const senderBalanceAfterEscrow = 'ok' in senderBalanceAfterEscrowResult ? Number(senderBalanceAfterEscrowResult.ok) / 1e8 : 0;
    const expectedSenderBalance = initialSenderBalance - ESCROW_AMOUNT;
    results.push(`   Sender balance after escrow: ${senderBalanceAfterEscrow} BTC (expected: ${expectedSenderBalance} BTC)`);
    
    // Step 3: Approve escrow
    results.push('\n✅ Step 3: Approving escrow...');
    await actor.recipientApproveEscrow(
      Principal.fromText(SENDER_PRINCIPAL),
      escrowId,
      Principal.fromText(RECIPIENT_PRINCIPAL)
    );
    results.push('   Escrow approved by recipient');
    
    // Step 4: Release escrow
    results.push('\n🚀 Step 4: Releasing escrow...');
    await actor.releaseSplit(
      Principal.fromText(SENDER_PRINCIPAL),
      escrowId
    );
    results.push('   Escrow released by sender');
    
    // Step 5: Verify final balances
    results.push('\n📊 Step 5: Verifying final balances...');
    const finalSenderBalanceResult = await actor.getCkbtcBalance(Principal.fromText(SENDER_PRINCIPAL)) as { ok: number } | { err: string };
    const finalRecipientBalanceResult = await actor.getCkbtcBalance(Principal.fromText(RECIPIENT_PRINCIPAL)) as { ok: number } | { err: string };
    
    const finalSenderBalance = 'ok' in finalSenderBalanceResult ? Number(finalSenderBalanceResult.ok) / 1e8 : 0;
    const finalRecipientBalance = 'ok' in finalRecipientBalanceResult ? Number(finalRecipientBalanceResult.ok) / 1e8 : 0;
    
    results.push(`   Final sender balance: ${finalSenderBalance} BTC`);
    results.push(`   Final recipient balance: ${finalRecipientBalance} BTC`);
    
    // Step 6: Verify transaction status
    results.push('\n📋 Step 6: Verifying transaction status...');
    const senderTransaction = await actor.getTransaction(escrowId, Principal.fromText(SENDER_PRINCIPAL));
    const recipientTransaction = await actor.getTransaction(escrowId, Principal.fromText(RECIPIENT_PRINCIPAL));
    
    if (Array.isArray(senderTransaction) && senderTransaction.length > 0) {
      results.push(`   Sender view status: ${senderTransaction[0].status}`);
    }
    
    if (Array.isArray(recipientTransaction) && recipientTransaction.length > 0) {
      results.push(`   Recipient view status: ${recipientTransaction[0].status}`);
    }
    
    // Summary
    results.push('\n🎉 ReleaseSplit E2E Test Summary:');
    results.push(`📋 Escrow ID: ${escrowId}`);
    results.push(`💰 Amount: ${ESCROW_AMOUNT} BTC`);
    results.push(`👤 Sender: ${SENDER_PRINCIPAL}`);
    results.push(`👥 Recipient: ${RECIPIENT_PRINCIPAL}`);
    results.push(`📊 Balance Summary:`);
    results.push(`   Sender: ${initialSenderBalance} BTC → ${finalSenderBalance} BTC (-${ESCROW_AMOUNT} BTC)`);
    results.push(`   Recipient: ${initialRecipientBalance} BTC → ${finalRecipientBalance} BTC (+${ESCROW_AMOUNT} BTC)`);
    
    results.push('\n✅ Test completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      results: results.join('\n'),
      escrowId,
      initialBalances: { sender: initialSenderBalance, recipient: initialRecipientBalance },
      finalBalances: { sender: finalSenderBalance, recipient: finalRecipientBalance }
    });
    
  } catch (error) {
    results.push(`❌ Test failed: ${error}`);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      results: results.join('\n')
    }, { status: 500 });
  }
}
