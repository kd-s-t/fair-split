import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";

actor class SplitDApp(admin : Principal) {

  type SplitRecord = {
    participant : Principal;
    share : Nat;
  };

  type ParticipantShare = {
    principal : Principal;
    amount : Nat;
  };

  type ToEntry = {
    principal : Principal;
    name : Text;
    amount : Nat;
  };

  type Transaction = {
    from : Principal;
    to : [ToEntry];
    timestamp : Nat;
    isRead : Bool;
  };

  var logs : [Text] = [];
  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  let transactions = HashMap.HashMap<Principal, [Transaction]>(10, Principal.equal, Principal.hash);
  let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  // 📤 Public method to split a bill
  public shared func splitBill(
    args : {
      participants : [ParticipantShare];
    },
    caller : Principal,
  ) : async [SplitRecord] {
    let count = args.participants.size();
    if (count == 0) return [];

    // Prevent sending to self
    for (p in args.participants.vals()) {
      if (p.principal == caller) {
        Debug.trap("Cannot send to yourself");
      };
    };

    let timestamp = Int.abs(Time.now());
    var txToList : [ToEntry] = [];

    for (p in args.participants.vals()) {
      let currentCallerBal = switch (balances.get(caller)) {
        case (?bal) bal;
        case null 0;
      };
      if (currentCallerBal < p.amount) {
        Debug.trap("Insufficient balance for transfer");
      };

      balances.put(caller, currentCallerBal - p.amount);

      let currentBal = switch (balances.get(p.principal)) {
        case (?bal) bal;
        case null 0;
      };
      balances.put(p.principal, currentBal + p.amount);

      let name = switch (names.get(p.principal)) {
        case (?n) n;
        case null "";
      };

      txToList := Array.append(txToList, [{ principal = p.principal; name = name; amount = p.amount }]);
    };

    let tx : Transaction = {
      from = caller;
      to = txToList;
      timestamp = timestamp;
      isRead = false;
    };

    // Save only to sender
    let prevTxsSender = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(prevTxsSender, [tx]));

    logs := Array.append<Text>(
      logs,
      ["Caller = " # Principal.toText(caller) # " split at " # Nat.toText(timestamp)],
    );

    return Array.map<ParticipantShare, SplitRecord>(
      args.participants,
      func(p) {
        {
          participant = p.principal;
          share = p.amount;
        };
      },
    );
  };

  // 🧾 Get all transactions for a participant
  public query func getTransactions(p : Principal) : async [Transaction] {
    switch (transactions.get(p)) {
      case (?txs) txs;
      case null [];
    };
  };

  // 💰 Get balance of a participant
  public query func getBalance(p : Principal) : async Nat {
    switch (balances.get(p)) {
      case (?bal) bal;
      case null 0;
    };
  };

  // 🛠 Set initial balance (only admin can do this)
  public shared func setInitialBalance(p : Principal, amount : Nat, caller : Principal) : async () {
    if (caller == admin) {
      balances.put(p, amount);
    };
  };

  public shared func markTransactionsAsRead(caller : Principal) : async () {
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null return;
    };

    let updated = Array.map<Transaction, Transaction>(txs, func(tx) { { from = tx.from; to = tx.to; timestamp = tx.timestamp; isRead = true } });

    transactions.put(caller, updated);
  };

  public query func getLogs() : async [Text] {
    return logs;
  };

  public query func getAdmin() : async Principal {
    return admin;
  };

  public shared func setName(p : Principal, name : Text) : async () {
    names.put(p, name);
  };

  public query func getName(p : Principal) : async ?Text {
    names.get(p);
  };
};
