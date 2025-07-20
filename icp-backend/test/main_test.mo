import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Nat "mo:base/Nat";

import SplitDApp "canister:split_dapp";

actor {
  public func run() : async () {
    Debug.print("🏁 Running SplitDApp test...");

    // Prepare test participants
    let alice = Principal.fromText("aaaaa-aa");
    let bob = Principal.fromText("bbbbb-bb");

    // Call splitBill with hardcoded caller
    let result = await SplitDApp.splitBill(
      {
        participants = [alice, bob];
        total = 1000;
      },
      Principal.fromText("aaaaa-aa") // simulate caller
    );

    Debug.print("✅ Split Results:");
    for (r in result.vals()) {
      Debug.print("Participant: " # Principal.toText(r.participant));
      Debug.print("Share: " # Nat.toText(r.share));
    };

    Debug.print("📜 Logs:");
    let logs = await SplitDApp.getLogs();
    for (log in logs.vals()) {
      Debug.print(log);
    };
  };
};
