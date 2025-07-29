import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import _ "mo:base/Array";
import Nat "mo:base/Nat";

import SplitDApp "canister:split_dapp";

actor {
  public func run() : async () {
    Debug.print("🏁 Running SplitDApp test...");

    // Prepare test participants
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");

    // Set participant names
    await SplitDApp.setName(alice, "Alice Wonderland");
    await SplitDApp.setName(bob, "Bob Builder");

    // Get and print participant names
    let aliceName = await SplitDApp.getName(alice);
    let bobName = await SplitDApp.getName(bob);
    Debug.print("Alice Name: " # (switch aliceName { case (?n) n; case null "N/A" }));
    Debug.print("Bob Name: " # (switch bobName { case (?n) n; case null "N/A" }));

    await SplitDApp.setInitialBalance(alice, 1000, alice);
    await SplitDApp.setInitialBalance(bob, 0, alice);

    // Step 1: Create escrow draft using initiateEscrow
    let escrowId = await SplitDApp.initiateEscrow(
      alice,
      [
        { principal = bob; amount = 400 },
        { principal = alice; amount = 600 }
      ],
      "Test Escrow"
    );
    Debug.print("Created escrow with ID: " # escrowId);

    // Step 2: Bob approves
    await SplitDApp.recipientApproveEscrow(alice, 0, bob);
    // Step 3: Alice approves (if needed for full confirmation)
    await SplitDApp.recipientApproveEscrow(alice, 0, alice);

    // Step 4: Release escrow (payout)
    await SplitDApp.releaseEscrow(alice, 0);

    let aliceBal = await SplitDApp.getBalance(alice);
    let bobBal = await SplitDApp.getBalance(bob);
    Debug.print("Alice Balance after split: " # Nat.toText(aliceBal));
    Debug.print("Bob Balance after split: " # Nat.toText(bobBal));

    Debug.print("📜 Logs:");
    let logs = await SplitDApp.getLogs();
    for (log in logs.vals()) {
      Debug.print(log);
    }
  };
}
