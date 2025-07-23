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
    let _ = Principal.fromText("aaaaa-aa");

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

    await SplitDApp.initiateSplit(
      alice,
      [
        { principal = bob; amount = 400 },
        { principal = alice; amount = 600 }
      ]
    );

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
};
