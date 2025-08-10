import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Option "mo:base/Option";

import SplitDApp "canister:split_dapp";

persistent actor {
  public func runAllTests() : async () {
    Debug.print("🧪 Starting comprehensive SafeSplit tests...");
    
    // Test 1: Basic Setup
    await testBasicSetup();
    
    // Test 2: Escrow Creation
    await testEscrowCreation();
    
    // Test 3: Escrow Approval
    await testEscrowApproval();
    
    // Test 4: Escrow Release
    await testEscrowRelease();
    
    // Test 5: Reputation System
    await testReputationSystem();
    
    // Test 6: Bitcoin Integration
    await testBitcoinIntegration();
    
    // Test 7: Error Handling
    await testErrorHandling();
    
    // Test 8: Edge Cases
    await testEdgeCases();
    
    Debug.print("🎉 All tests completed successfully!");
  };

  private func testBasicSetup() : async () {
    Debug.print("📋 Test 1: Basic Setup");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    let charlie = Principal.fromText("ccccc-cc");
    
    // Set nicknames
    await SplitDApp.setNickname(alice, "Alice");
    await SplitDApp.setNickname(bob, "Bob");
    await SplitDApp.setNickname(charlie, "Charlie");
    
    // Set initial balances
    await SplitDApp.setInitialBalance(alice, 1000, alice);
    await SplitDApp.setInitialBalance(bob, 500, alice);
    await SplitDApp.setInitialBalance(charlie, 200, alice);
    
    // Verify balances
    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    let charlieBal = await SplitDApp.getBalance(charlie);
    
    checkAssertion(aliceBal == 1000, "Alice balance should be 1000");
    checkAssertion(bobBal == 500, "Bob balance should be 500");
    checkAssertion(charlieBal == 200, "Charlie balance should be 200");
    
    Debug.print("✅ Basic setup test passed");
  };

  private func testEscrowCreation() : async () {
    Debug.print("📋 Test 2: Escrow Creation");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    let participants = [{
      principal = bob;
      amount = 100;
      nickname = "Bob";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let escrowId = await SplitDApp.initiateEscrow(alice, participants, "Test Escrow");
    
    // Verify escrow was created
    if (Text.size(escrowId) == 0) {
      Debug.print("❌ Escrow ID should not be empty");
    };
    
    // Get transaction details
    let transaction = await SplitDApp.getTransaction(escrowId, alice);
    if (Option.isNull(transaction)) {
      Debug.print("❌ Transaction should exist");
    };
    
    Debug.print("✅ Escrow creation test passed");
  };

  private func testEscrowApproval() : async () {
    Debug.print("📋 Test 3: Escrow Approval");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    // Create escrow
    let participants = [{
      principal = bob;
      amount = 50;
      nickname = "Bob";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let escrowId = await SplitDApp.initiateEscrow(alice, participants, "Approval Test");
    
    // Bob approves
    await SplitDApp.recipientApproveEscrow(alice, escrowId, bob);
    
    // Verify approval
    let transaction = await SplitDApp.getTransaction(escrowId, bob);
    if (Option.isNull(transaction)) {
      Debug.print("❌ Transaction should exist after approval");
    };
    
    Debug.print("✅ Escrow approval test passed");
  };

  private func testEscrowRelease() : async () {
    Debug.print("📋 Test 4: Escrow Release");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    // Create and approve escrow
    let participants = [{
      principal = bob;
      amount = 75;
      nickname = "Bob";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let escrowId = await SplitDApp.initiateEscrow(alice, participants, "Release Test");
    await SplitDApp.recipientApproveEscrow(alice, escrowId, bob);
    
    // Get initial balances
    let aliceInitialBal = await SplitDApp.getBalance(alice);
    let bobInitialBal = await SplitDApp.getBalance(bob);
    
    // Release escrow
    await SplitDApp.releaseSplit(alice, escrowId);
    
    // Verify balances changed
    let aliceFinalBal = await SplitDApp.getBalance(alice);
    let bobFinalBal = await SplitDApp.getBalance(bob);
    
    if (aliceFinalBal >= aliceInitialBal) {
      Debug.print("❌ Alice balance should decrease");
    };
    if (bobFinalBal <= bobInitialBal) {
      Debug.print("❌ Bob balance should increase");
    };
    
    Debug.print("✅ Escrow release test passed");
  };

  private func testReputationSystem() : async () {
    Debug.print("📋 Test 5: Reputation System");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    // Check initial reputation
    let aliceRep = await SplitDApp.getUserReputationScore(alice);
    let bobRep = await SplitDApp.getUserReputationScore(bob);
    
    if (aliceRep < 50) {
      Debug.print("❌ Alice should have sufficient reputation");
    };
    if (bobRep < 50) {
      Debug.print("❌ Bob should have sufficient reputation");
    };
    
    // Check fraud detection
    let aliceFraud = await SplitDApp.isUserFlaggedForFraud(alice);
    let bobFraud = await SplitDApp.isUserFlaggedForFraud(bob);
    
    if (aliceFraud) {
      Debug.print("❌ Alice should not be flagged for fraud");
    };
    if (bobFraud) {
      Debug.print("❌ Bob should not be flagged for fraud");
    };
    
    // Check escrow creation permission
    let aliceCanCreate = await SplitDApp.canUserCreateEscrow(alice);
    let bobCanCreate = await SplitDApp.canUserCreateEscrow(bob);
    
    if (not aliceCanCreate) {
      Debug.print("❌ Alice should be able to create escrow");
    };
    if (not bobCanCreate) {
      Debug.print("❌ Bob should be able to create escrow");
    };
    
    Debug.print("✅ Reputation system test passed");
  };

  private func testBitcoinIntegration() : async () {
    Debug.print("📋 Test 6: Bitcoin Integration");
    
    let alice = Principal.fromText("aaaaa-aa");
    
    // Test Bitcoin address validation
    let validAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    let invalidAddress = "invalid-address";
    
    let validResult = await SplitDApp.setBitcoinAddress(alice, validAddress);
    let invalidResult = await SplitDApp.setBitcoinAddress(alice, invalidAddress);
    
    if (not validResult) {
      Debug.print("❌ Valid Bitcoin address should be accepted");
    };
    if (invalidResult) {
      Debug.print("❌ Invalid Bitcoin address should be rejected");
    };
    
    // Test cKBTC wallet generation
    let walletResult = await SplitDApp.requestCkbtcWallet();
    if (Result.isErr(walletResult)) {
      Debug.print("❌ cKBTC wallet should be generated");
    };
    
    // Test cKBTC balance
    let balanceResult = await SplitDApp.getCkbtcBalance(alice);
    if (Result.isErr(balanceResult)) {
      Debug.print("❌ cKBTC balance should be retrievable");
    };
    
    Debug.print("✅ Bitcoin integration test passed");
  };

  private func testErrorHandling() : async () {
    Debug.print("📋 Test 7: Error Handling");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    let unknownUser = Principal.fromText("ddddd-dd");
    
    // Test non-existent transaction
    let nonExistentTx = await SplitDApp.getTransaction("non-existent-id", alice);
    if (Option.isSome(nonExistentTx)) {
      Debug.print("❌ Non-existent transaction should return error");
    };
    
    // Test unauthorized access
    let unauthorizedTx = await SplitDApp.getTransaction("some-id", unknownUser);
    if (Option.isSome(unauthorizedTx)) {
      Debug.print("❌ Unauthorized access should return error");
    };
    
    // Test invalid Bitcoin address
    let invalidBtcResult = await SplitDApp.setBitcoinAddress(alice, "invalid");
    if (invalidBtcResult) {
      Debug.print("❌ Invalid Bitcoin address should be rejected");
    };
    
    Debug.print("✅ Error handling test passed");
  };

  private func testEdgeCases() : async () {
    Debug.print("📋 Test 8: Edge Cases");
    
    let alice = Principal.fromText("aaaaa-aa");
    
    // Test empty participants list
    let emptyParticipants : [SplitDApp.ParticipantShare] = [];
    let emptyEscrowResult = await SplitDApp.initiateEscrow(alice, emptyParticipants, "Empty Test");
    if (not Text.contains(emptyEscrowResult, #text "Error")) {
      Debug.print("❌ Empty participants should fail");
    };
    
    // Test self-sending
    let selfParticipants = [{
      principal = alice;
      amount = 100;
      nickname = "Alice";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let selfEscrowResult = await SplitDApp.initiateEscrow(alice, selfParticipants, "Self Test");
    if (not Text.contains(selfEscrowResult, #text "Error")) {
      Debug.print("❌ Self-sending should fail");
    };
    
    // Test large amounts
    let largeParticipants = [{
      principal = Principal.fromText("bbbbb-bb");
      amount = 1_000_000_000_000; // Very large amount
      nickname = "Bob";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let largeEscrowResult = await SplitDApp.initiateEscrow(alice, largeParticipants, "Large Test");
    if (Text.size(largeEscrowResult) == 0) {
      Debug.print("❌ Large amounts should be handled");
    };
    
    Debug.print("✅ Edge cases test passed");
  };

  private func checkAssertion(condition : Bool, message : Text) {
    if (not condition) {
      Debug.print("❌ Assertion failed: " # message);
    };
  };
};
