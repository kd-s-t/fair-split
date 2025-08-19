import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

import SplitDApp "canister:split_dapp";

persistent actor {
  public func runSimpleTests() : async () {
    Debug.print("🧪 Starting simple SafeSplit tests...");
    
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");
    
    // Test 1: Basic Setup
    Debug.print("📋 Test 1: Basic Setup");
    await SplitDApp.setNickname(alice, "Alice");
    await SplitDApp.setNickname(bob, "Bob");
    await SplitDApp.setInitialBalance(alice, 1000, alice);
    await SplitDApp.setInitialBalance(bob, 500, alice);
    
    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    Debug.print("Alice balance: " # Nat.toText(aliceBal));
    Debug.print("Bob balance: " # Nat.toText(bobBal));
    
    // Test 2: Escrow Creation
    Debug.print("📋 Test 2: Escrow Creation");
    let participants = [{
      principal = bob;
      amount = 100;
      nickname = "Bob";
      percentage = 100;
      bitcoinAddress = null;
    }];
    
    let escrowId = await SplitDApp.initiateEscrow(alice, participants, "Test Escrow");
    Debug.print("Created escrow with ID: " # escrowId);
    
    // Test 3: Escrow Approval
    Debug.print("📋 Test 3: Escrow Approval");
    await SplitDApp.recipientApproveEscrow(alice, escrowId, bob);
    Debug.print("Bob approved the escrow");
    
    // Test 4: Escrow Release
    Debug.print("📋 Test 4: Escrow Release");
    await SplitDApp.releaseSplit(alice, escrowId);
    Debug.print("Escrow released");
    
    let finalAliceBal = await SplitDApp.getBalance(alice);
    let finalBobBal = await SplitDApp.getBalance(bob);
    Debug.print("Final Alice balance: " # Nat.toText(finalAliceBal));
    Debug.print("Final Bob balance: " # Nat.toText(finalBobBal));
    
    // Test 5: Reputation System
    Debug.print("📋 Test 5: Reputation System");
    let aliceRep = await SplitDApp.getUserReputationScore(alice);
    let bobRep = await SplitDApp.getUserReputationScore(bob);
    Debug.print("Alice reputation: " # Nat.toText(aliceRep));
    Debug.print("Bob reputation: " # Nat.toText(bobRep));
    
    // Test 6: Bitcoin Integration
    Debug.print("📋 Test 6: Bitcoin Integration");
    let validAddress = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
    let validResult = await SplitDApp.setBitcoinAddress(alice, validAddress);
    Debug.print("Bitcoin address set: " # (if validResult "success" else "failed"));
    
    // Test 7: Transaction History
    Debug.print("📋 Test 7: Transaction History");
    let transactions = await SplitDApp.getTransactionsPaginated(alice, 0, 10);
    Debug.print("Transaction count: " # Nat.toText(transactions.totalCount));
    
    // Test 8: Username Management
    Debug.print("📋 Test 8: Username Management");
    await SplitDApp.setUsername(alice, "alice");
    await SplitDApp.setUsername(bob, "bob");
    
    let aliceUsername = await SplitDApp.getUsername(alice);
    let bobUsername = await SplitDApp.getUsername(bob);
    
    switch (aliceUsername) {
      case (?username) Debug.print("Alice username: " # username);
      case null Debug.print("Alice username: null");
    };
    
    switch (bobUsername) {
      case (?username) Debug.print("Bob username: " # username);
      case null Debug.print("Bob username: null");
    };
    
    let allUsernames = await SplitDApp.getAllUsernames();
    Debug.print("Total usernames: " # Nat.toText(Array.size(allUsernames)));
    
    Debug.print("🎉 All simple tests completed!");
  };
};
