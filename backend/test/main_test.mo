import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";

import SplitDApp "canister:split_dapp";

actor {
  public func run() : async () {
    Debug.print("🏁 Running SplitDApp basic test...");

    // Prepare test participants
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");

    // Set participant nicknames
    await SplitDApp.setNickname(alice, "Alice Wonderland");
    await SplitDApp.setNickname(bob, "Bob Builder");

    await SplitDApp.setInitialBalance(alice, 1000, alice);
    await SplitDApp.setInitialBalance(bob, 0, alice);

    // Test basic escrow functionality
    Debug.print("🧪 Testing Basic Escrow...");
    
    let escrowId = await SplitDApp.initiateEscrow(
      alice,
      [{ principal = bob; amount = 100 }],
      "Test Escrow"
    );
    Debug.print("Created escrow with ID: " # escrowId);

    // Bob approves
    await SplitDApp.recipientApproveEscrow(alice, 0, bob);
    
    // Release the escrow
    await SplitDApp.releaseSplit(alice, escrowId);

    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    Debug.print("Alice Balance after split: " # Nat.toText(aliceBal));
    Debug.print("Bob Balance after split: " # Nat.toText(bobBal));
    
    Debug.print("🎉 Basic test completed!");
  };
}
