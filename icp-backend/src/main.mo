import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";

actor class SplitDApp(admin : Principal) {

  type SplitRecord = {
    participant : Principal;
    share : Nat;
  };

  var logs : [Text] = [];

  public shared func splitBill(
    args : {
      participants : [Principal];
      total : Nat;
    },
    caller : Principal,
  ) : async [SplitRecord] {
    let count = args.participants.size();
    if (count == 0) return [];

    let share = args.total / count;

    let result = Array.map<Principal, SplitRecord>(
      args.participants,
      func(p) {
        {
          participant = p;
          share = share;
        };
      },
    );

    let log = "Caller = " # Principal.toText(caller)
    # " split " # Nat.toText(args.total)
    # " at " # Nat.toText(Int.abs(Time.now()));

    logs := Array.append<Text>(logs, [log]);

    return result;
  };

  public query func getLogs() : async [Text] {
    return logs;
  };

  public query func getAdmin() : async Principal {
    return admin;
  };
};
