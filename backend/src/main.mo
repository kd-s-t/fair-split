import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";

actor class SplitDApp(admin : Principal) {

  type SplitRecord = {
    participant : Principal;
    share : Nat;
  };

  type Transaction = {
    from : Principal;
    to : Principal;
    amount : Nat;
    timestamp : Nat;
  };

  var logs : [Text] = [];
  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  let transactions = HashMap.HashMap<Principal, [Transaction]>(10, Principal.equal, Principal.hash);
  let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  // 📤 Public method to split a bill
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

    let timestamp = Int.abs(Time.now());

    let result = Array.map<Principal, SplitRecord>(
      args.participants,
      func(p) {
        // Deduct from caller and credit each participant
        let currentCallerBal = switch (balances.get(caller)) {
          case (?bal) bal;
          case null 0;
        };
        if (currentCallerBal >= share) {
          balances.put(caller, currentCallerBal - share);
          let currentBal = switch (balances.get(p)) {
            case (?bal) bal;
            case null 0;
          };
          balances.put(p, currentBal + share);

          let tx : Transaction = {
            from = caller;
            to = p;
            amount = share;
            timestamp = timestamp;
          };

          // Store transaction per recipient
          let prevTxs = switch (transactions.get(p)) {
            case (?txs) txs;
            case null [];
          };
          transactions.put(p, Array.append(prevTxs, [tx]));
        };

        {
          participant = p;
          share = share;
        };
      },
    );

    let log = "Caller = " # Principal.toText(caller)
    # " split " # Nat.toText(args.total)
    # " at " # Nat.toText(timestamp);

    logs := Array.append<Text>(logs, [log]);

    return result;
  };

  // 🧾 Get all transactions for a participant
  public query func getTransactions(p : Principal) : async [Transaction] {
    switch (transactions.get(p)) {
      case (?txs) txs;
      case null [];
    }
  };

  // 💰 Get balance of a participant
  public query func getBalance(p : Principal) : async Nat {
    switch (balances.get(p)) {
      case (?bal) bal;
      case null 0;
    }
  };

  // 🛠 Set initial balance (only admin can do this)
  public shared func setInitialBalance(p : Principal, amount : Nat, caller : Principal) : async () {
    if (caller == admin) {
      balances.put(p, amount);
    };
  };

  public query func getLogs() : async [Text] {
    return logs;
  };

  public query func getAdmin() : async Principal {
    return admin;
  };

  public shared func setName(p: Principal, name: Text) : async () {
    names.put(p, name);
  };

  public query func getName(p: Principal) : async ?Text {
    names.get(p)
  };
};
