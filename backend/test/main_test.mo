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

    // Removed setInitialBalance calls as they do not exist in SplitDApp

    // Call splitBill with hardcoded caller
    let result = await SplitDApp.splitBill(
      {
        participants = [alice, bob];
        total = 1000;
      },
      alice // simulate caller
    );

    Debug.print("✅ Split Results:");
    for (r in result.vals()) {
      Debug.print("Participant: " # Principal.toText(r.participant));
      Debug.print("Share: " # Nat.toText(r.share));
    };

    // getBalance does not exist in SplitDApp, so we infer balances from splitBill result
    var aliceShare : ?Nat = null;
    var bobShare : ?Nat = null;
    for (r in result.vals()) {
      if (r.participant == alice) {
        aliceShare := ?r.share;
      } else if (r.participant == bob) {
        bobShare := ?r.share;
      }
    };
    Debug.print("Alice Balance after split: " # (switch aliceShare { case (?s) Nat.toText(s); case null "N/A" }));
    Debug.print("Bob Balance after split: " # (switch bobShare { case (?s) Nat.toText(s); case null "N/A" }));

    Debug.print("📜 Logs:");
    let logs = await SplitDApp.getLogs();
    for (log in logs.vals()) {
      Debug.print(log);
    }

  };
};
