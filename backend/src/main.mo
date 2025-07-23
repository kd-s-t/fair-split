import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

import TransactionModel "models/transaction";
import SplitService "services/split";
import BalanceService "services/balance";
import TimeUtil "utils/time";

actor class SplitDApp(admin : Principal) {

  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  let transactions = HashMap.HashMap<Principal, [TransactionModel.Transaction]>(10, Principal.equal, Principal.hash);
  let pendingTransfers = HashMap.HashMap<Principal, [TransactionModel.PendingTransfer]>(10, Principal.equal, Principal.hash);
  let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  var logs : [Text] = [];

  // 🟡 Initiate escrow: deducts balance and creates pending transfer
  public shared func initiateSplit(
    caller : Principal,
    participants : [TransactionModel.ParticipantShare],
  ) : async () {
    SplitService.initiateSplitBill(participants, caller, balances, pendingTransfers, names);

    let tx : TransactionModel.Transaction = {
      from = caller;
      to = Array.map<TransactionModel.ParticipantShare, TransactionModel.ToEntry>(
        participants,
        func(p) {
          {
            principal = p.principal;
            name = switch (names.get(p.principal)) { case (?n) n; case null "" };
            amount = p.amount;
          };
        },
      );
      timestamp = TimeUtil.now();
      isRead = false;
      status = #pending;
    };

    let existing = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(existing, [tx]));

    logs := Array.append<Text>(
      logs,
      [
        "Initiated escrow by " # Principal.toText(caller) # " at " # Nat.toText(TimeUtil.now())
      ],
    );
  };

  public shared func releaseSplit(caller : Principal) : async [TransactionModel.ToEntry] {
    let pendings = switch (pendingTransfers.get(caller)) {
      case (?list) list;
      case null return [];
    };

    var result : [TransactionModel.ToEntry] = [];

    for (pending in pendings.vals()) {
      let current = switch (balances.get(pending.to)) {
        case (?b) b;
        case null 0;
      };
      balances.put(pending.to, current + pending.amount);
      result := Array.append(result, [{ principal = pending.to; name = pending.name; amount = pending.amount }]);
    };

    ignore pendingTransfers.remove(caller);

    // Update the latest pending transaction to #released
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null [];
    };
    let updated = Array.map<TransactionModel.Transaction, TransactionModel.Transaction>(
      txs,
      func(tx) {
        if (tx.status == #pending) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #released;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(caller, updated);

    return result;
  };

  // ❌ Cancel escrow: refunds and updates status
  public shared func cancelSplit(caller : Principal) : async () {
    ignore SplitService.cancelPending(caller, balances, pendingTransfers);

    // Update all pending transactions to cancelled
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null [];
    };
    let updated = Array.map<TransactionModel.Transaction, TransactionModel.Transaction>(
      txs,
      func(tx) {
        if (tx.status == #pending) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #cancelled;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(caller, updated);

    logs := Array.append<Text>(logs, ["Cancelled by " # Principal.toText(caller)]);
  };

  public query func getBalance(p : Principal) : async Nat {
    BalanceService.getBalance(balances, p);
  };

  public query func getPending(caller : Principal) : async [TransactionModel.PendingTransfer] {
    switch (pendingTransfers.get(caller)) { case (?list) list; case null [] };
  };

  public query func getTransactions(p : Principal) : async [TransactionModel.Transaction] {
    switch (transactions.get(p)) { case (?txs) txs; case null [] };
  };

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
    let updated = Array.map<TransactionModel.Transaction, TransactionModel.Transaction>(txs, func(tx) { { from = tx.from; to = tx.to; timestamp = tx.timestamp; isRead = true; status = tx.status } });
    transactions.put(caller, updated);
  };

  public shared func setName(p : Principal, name : Text) : async () {
    names.put(p, name);
  };

  public query func getName(p : Principal) : async ?Text {
    names.get(p);
  };

  public query func getLogs() : async [Text] {
    return logs;
  };

  public query func getAdmin() : async Principal {
    return admin;
  };
};
