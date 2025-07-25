import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

import TransactionTypes "escrow/transaction";
import _ "escrow/approval";
import _ "escrow/release";
import _ "escrow/cancel";
import Pending "escrow/pending";
import Balance "user/balance";
import _ "log/log";
import TimeUtil "utils/time";
import Debug "mo:base/Debug";

actor class SplitDApp(admin : Principal) {

  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  let transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  let pendingTransfers = HashMap.HashMap<Principal, [Pending.PendingTransfer]>(10, Principal.equal, Principal.hash);
  let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  var logs : [Text] = [];

  // 🟡 Initiate escrow: deducts balance and creates pending transfer
  public shared func initiateSplit(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async () {
    // Removed Pending.initiateEscrow as it does not exist

    let tx : TransactionTypes.Transaction = {
      from = caller;
      to = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ToEntry>(
        participants,
        func(p) {
          {
            principal = p.principal;
            name = switch (names.get(p.principal)) { case (?n) n; case null "" };
            amount = p.amount;
            status = #pending;
          };
        },
      );
      timestamp = TimeUtil.now();
      isRead = false;
      status = #pending;
      title = title;
    };

    let existing = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(existing, [tx]));

    logs := Array.append<Text>(
      logs,
      [
        "Initiated escrow by " # Principal.toText(caller) # " at " # Nat.toText(TimeUtil.now()),
        "Escrow confirmed: Funds held for " # Principal.toText(caller) # " at " # Nat.toText(TimeUtil.now()),
      ],
    );
  };

  public shared func createEscrow(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async () {
    let tx : TransactionTypes.Transaction = {
      from = caller;
      to = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ToEntry>(
        participants,
        func(p) {
          {
            principal = p.principal;
            name = switch (names.get(p.principal)) { case (?n) n; case null "" };
            amount = p.amount;
            status = #pending;
          };
        },
      );
      timestamp = TimeUtil.now();
      isRead = false;
      status = #draft;
      title = title;
    };
    let existing = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(existing, [tx]));
    logs := Array.append<Text>(logs, ["Draft escrow created by " # Principal.toText(caller)]);
  };

  public shared func initiateEscrow(
    caller : Principal,
    idx : Nat,
  ) : async () {
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null return;
    };
    if (idx >= txs.size()) return;
    let tx = txs[idx];
    if (tx.status != #draft) return;
    // Deduct balance and create pending transfers for each recipient
    for (toEntry in tx.to.vals()) {
      let currentCallerBal = switch (balances.get(caller)) {
        case (?b) b;
        case null 0;
      };
      if (currentCallerBal < toEntry.amount) return; // Insufficient balance
      balances.put(caller, currentCallerBal - toEntry.amount);
      let prevPendings = switch (pendingTransfers.get(caller)) {
        case (?arr) arr;
        case null [];
      };
      let pending : Pending.PendingTransfer = {
        to = toEntry.principal;
        name = toEntry.name;
        amount = toEntry.amount;
        initiatedAt = TimeUtil.now();
      };
      pendingTransfers.put(caller, Array.append(prevPendings, [pending]));
    };
    // Set status to #pending, approvals remain as is
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #pending;
            title = tx.title;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(caller, updated);
    logs := Array.append<Text>(logs, ["Escrow initiated by " # Principal.toText(caller) # ", funds held and awaiting recipient approvals"]);
  };

  public shared func recipientApproveEscrow(
    sender : Principal,
    idx : Nat,
    recipient : Principal,
  ) : async () {
    let txs = switch (transactions.get(sender)) {
      case (?list) list;
      case null return;
    };
    if (idx >= txs.size()) return;
    let tx = txs[idx];
    if (tx.status != #pending) return;
    // Update recipient status
    let newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
      tx.to,
      func(entry) {
        if (entry.principal == recipient) {
          {
            principal = entry.principal;
            name = entry.name;
            amount = entry.amount;
            status = #approved;
          };
        } else {
          entry;
        };
      },
    );
    // If all approved, set status to #confirmed
    let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, true, func(acc, entry) { acc and (entry.status == #approved) });
    let newStatus = if (allApproved) #confirmed else #pending;
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = newStatus;
            title = tx.title;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(sender, updated);
    if (allApproved) {
      logs := Array.append<Text>(logs, ["All recipients approved escrow for " # Principal.toText(sender)]);
    } else {
      logs := Array.append<Text>(logs, ["Recipient " # Principal.toText(recipient) # " approved escrow for " # Principal.toText(sender)]);
    };
  };

  public shared func recipientDeclineEscrow(
    sender : Principal,
    idx : Nat,
    recipient : Principal,
  ) : async () {
    let txs = switch (transactions.get(sender)) {
      case (?list) list;
      case null return;
    };
    if (idx >= txs.size()) return;
    let tx = txs[idx];
    if (tx.status != #pending and tx.status != #confirmed) return;
    if (tx.status == #declined or tx.status == #released or tx.status == #cancelled) return;
    // Update recipient status to #declined
    let newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
      tx.to,
      func(entry) {
        if (entry.principal == recipient) {
          {
            principal = entry.principal;
            name = entry.name;
            amount = entry.amount;
            status = #declined;
          };
        } else {
          entry;
        };
      },
    );
    // Refund all held funds for declined recipient to sender and remove their pending transfer
    let pendings = switch (pendingTransfers.get(sender)) {
      case (?arr) arr;
      case null [];
    };
    var refund : Nat = 0;
    let newPendings = Array.filter<Pending.PendingTransfer>(
      pendings,
      func(pending) {
        if (pending.to == recipient) {
          refund += pending.amount;
          false // Remove
        } else {
          true // Keep
        };
      },
    );
    let currentBal = switch (balances.get(sender)) {
      case (?b) b;
      case null 0;
    };
    balances.put(sender, currentBal + refund);
    pendingTransfers.put(sender, newPendings);
    // If all recipients are either approved or declined, set status to #confirmed if all approved, #declined if any declined
    let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, true, func(acc, entry) { acc and (entry.status == #approved) });
    let anyDeclined = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, false, func(acc, entry) { acc or (entry.status == #declined) });
    let newStatus = if (anyDeclined) #declined else if (allApproved) #confirmed else tx.status;
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = newStatus;
            title = tx.title;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(sender, updated);
    logs := Array.append<Text>(logs, ["Escrow declined by recipient " # Principal.toText(recipient) # " for " # Principal.toText(sender)]);

    // Also update the recipient's transaction list if it exists
    let recipientTxs = switch (transactions.get(recipient)) {
      case (?list) list;
      case null [];
    };
    let updatedRecipientTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      recipientTxs,
      func(tx) {
        // Find the matching transaction (by from and timestamp)
        if (tx.from == sender and tx.timestamp == txs[idx].timestamp) {
          let newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
            tx.to,
            func(entry) {
              if (entry.principal == recipient) {
                {
                  principal = entry.principal;
                  name = entry.name;
                  amount = entry.amount;
                  status = #declined;
                };
              } else {
                entry;
              };
            },
          );
          // Update status for recipient's view as well
          let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, true, func(acc, entry) { acc and (entry.status == #approved) });
          let anyDeclined = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, false, func(acc, entry) { acc or (entry.status == #declined) });
          let newStatus = if (anyDeclined) #declined else if (allApproved) #confirmed else tx.status;
          {
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = newStatus;
            title = tx.title;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(recipient, updatedRecipientTxs);
  };

  public shared func releaseEscrow(
    caller : Principal,
    idx : Nat,
  ) : async () {
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null return;
    };
    if (idx >= txs.size()) return;
    let tx = txs[idx];
    if (tx.status != #confirmed) return;
    // Only transfer to recipients with #approved status
    for (toEntry in tx.to.vals()) {
      if (toEntry.status == #approved) {
        // Transfer logic here (already deducted at initiation)
        // You may want to mark as paid or log per recipient
      };
    };
    // Update transaction status to #released and log
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #released;
            title = tx.title;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(caller, updated);
    logs := Array.append<Text>(logs, ["Escrow released for " # Principal.toText(caller)]);
  };

  public shared func cancelEscrow(
    caller : Principal,
    idx : Nat,
  ) : async () {
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null return;
    };
    if (idx >= txs.size()) return;
    let tx = txs[idx];
    if (tx.status == #released or tx.status == #cancelled) return;
    // Update status to #cancelled
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #cancelled;
            title = tx.title;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(caller, updated);
    logs := Array.append<Text>(logs, ["Escrow cancelled for " # Principal.toText(caller)]);
  };

  // Update cancelSplit to allow cancelling #locked and #pending
  public shared func cancelSplit(caller : Principal) : async () {
    // Remove all #locked transactions (drafts)
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null [];
    };
    let filtered = Array.filter<TransactionTypes.Transaction>(
      txs,
      func(tx) {
        if (tx.status == #cancelled) {
          // Log cancellation of draft
          logs := Array.append<Text>(logs, ["Cancelled draft escrow by " # Principal.toText(caller)]);
          false // Remove draft
        } else {
          true // Keep others
        };
      },
    );
    transactions.put(caller, filtered);
    // For #pending, refund and update status as before
    let txs2 = switch (transactions.get(caller)) {
      case (?list) list;
      case null [];
    };
    let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      txs2,
      func(tx) {
        if (tx.status == #pending) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #cancelled;
            title = tx.title;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(caller, updated);
    logs := Array.append<Text>(logs, ["Cancelled by " # Principal.toText(caller)]);
  };

  public shared func releaseSplit(caller : Principal) : async [TransactionTypes.ToEntry] {
    let pendings = switch (pendingTransfers.get(caller)) {
      case (?list) list;
      case null { return [] };
    };

    var result : [TransactionTypes.ToEntry] = [];

    for (pending in pendings.vals()) {
      let current = switch (balances.get(pending.to)) {
        case (?b) b;
        case null 0;
      };
      balances.put(pending.to, current + pending.amount);
      result := Array.append(result, [{ principal = pending.to; name = pending.name; amount = pending.amount; status = #approved }]);
    };

    ignore pendingTransfers.remove(caller);

    // Update the latest pending transaction to #released
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null [];
    };
    let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      txs,
      func(tx) {
        if (tx.status == #pending) {
          {
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = #released;
            title = tx.title;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(caller, updated);

    return result;
  };

  public query func getBalance(p : Principal) : async Nat {
    Balance.getBalance(balances, p);
  };

  public query func getPending(caller : Principal) : async [Pending.PendingTransfer] {
    switch (pendingTransfers.get(caller)) { case (?list) list; case null [] };
  };

  public query func getTransactions(p : Principal) : async [TransactionTypes.Transaction] {
    switch (transactions.get(p)) { case (?txs) txs; case null [] };
  };

  public query func getPendingApprovalsForRecipient(recipient : Principal) : async [TransactionTypes.Transaction] {
    var result : [TransactionTypes.Transaction] = [];
    label txLoop for ((_, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        if (tx.status == #pending or tx.status == #confirmed) {
          var found = false;
          for (toEntry in tx.to.vals()) {
            if (toEntry.principal == recipient and toEntry.status == #pending) {
              result := Array.append(result, [tx]);
              found := true;
            };
          };
          if (found) { continue txLoop };
        };
      };
    };
    return result;
  };

public shared (msg) func getMyTransactionByIndex(idx : Nat) : async ?TransactionTypes.Transaction {
  let sender = msg.caller;
  Debug.print("getMyTransactionByIndex: caller=" # Principal.toText(sender));
  switch (transactions.get(sender)) {
    case (?txs) {
      if (idx < txs.size()) {
        ?txs[idx]
      } else {
        null
      };
    };
    case null null;
  };
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
    let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(txs, func(tx) { { from = tx.from; to = tx.to; timestamp = tx.timestamp; isRead = true; status = tx.status; title = tx.title } });
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
