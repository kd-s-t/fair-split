import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Debug "mo:base/Debug";

import TransactionTypes "escrow/transaction";
import Pending "escrow/pending";
import Balance "user/balance";
import TimeUtil "utils/time";

actor class SplitDApp(admin : Principal) {

  let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  let transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  let pendingTransfers = HashMap.HashMap<Principal, [Pending.PendingTransfer]>(10, Principal.equal, Principal.hash);
  let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  var logs : [Text] = [];

  public shared func initiateEscrow(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async Text {
    for (participant in participants.vals()) {
      if (participant.principal == caller) {
        return "Error: Cannot send to your own address";
      };
    };

    let timestamp = TimeUtil.now();
    let principalText = Principal.toText(caller);
    let randomSuffix = Nat.toText(timestamp % 1000000);
    let escrowId = Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;

    let tx : TransactionTypes.Transaction = {
      id = escrowId;
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
      timestamp = timestamp;
      isRead = false;
      status = "pending";
      title = title;
      releasedAt = null;
    };

    let existing = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(existing, [tx]));

    logs := Array.append<Text>(
      logs,
      [
        "Escrow created by " # Principal.toText(caller) # " at " # Nat.toText(timestamp),
        "Escrow ID: " # escrowId,
        "Awaiting recipient approvals",
      ],
    );

    return escrowId;
  };

  public shared func initiateSplit(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async () {
    let timestamp = TimeUtil.now();
    let principalText = Principal.toText(caller);
    let randomSuffix = Nat.toText(timestamp % 1000000);
    let escrowId = Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;

    let tx : TransactionTypes.Transaction = {
      id = escrowId;
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
      timestamp = timestamp;
      isRead = false;
      status = "pending";
      title = title;
      releasedAt = null;
    };

    let existing = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    transactions.put(caller, Array.append(existing, [tx]));

    logs := Array.append<Text>(
      logs,
      [
        "Escrow created by " # Principal.toText(caller) # " at " # Nat.toText(TimeUtil.now()),
        "Awaiting recipient approvals",
      ],
    );
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
    if (tx.status != "pending") return;

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

    let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(
      newTo,
      true,
      func(acc, entry) {
        acc and (entry.status == #approved)
      },
    );

    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = if (allApproved) "confirmed" else tx.status; // 👈 only update if all approved
            title = tx.title;
            releasedAt = null;
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
    if (tx.status != "pending" and tx.status != "confirmed") return;
    if (tx.status == "declined" or tx.status == "released" or tx.status == "cancelled") return;
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
    let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, true, func(acc, entry) { acc and (entry.status == #approved) });
    let anyDeclined = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, false, func(acc, entry) { acc or (entry.status == #declined) });
    let newStatus = if (anyDeclined) "declined" else if (allApproved) "confirmed" else tx.status;
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = newStatus;
            title = tx.title;
            releasedAt = null;
          };
        } else {
          txs[i];
        };
      },
    );
    transactions.put(sender, updated);
    logs := Array.append<Text>(logs, ["Escrow declined by recipient " # Principal.toText(recipient) # " for " # Principal.toText(sender)]);

    let recipientTxs = switch (transactions.get(recipient)) {
      case (?list) list;
      case null [];
    };
    let updatedRecipientTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      recipientTxs,
      func(tx) {
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
          let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, true, func(acc, entry) { acc and (entry.status == #approved) });
          let anyDeclined = Array.foldLeft<TransactionTypes.ToEntry, Bool>(newTo, false, func(acc, entry) { acc or (entry.status == #declined) });
          let newStatus = if (anyDeclined) "declined" else if (allApproved) "confirmed" else tx.status;
          {
            id = tx.id;
            from = tx.from;
            to = newTo;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = newStatus;
            title = tx.title;
            releasedAt = null;
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
    if (tx.status != "confirmed") return;

    // ✅ Transfer to approved recipients only
    for (toEntry in tx.to.vals()) {
      if (toEntry.status == #approved) {
        let currentBalance = switch (balances.get(toEntry.principal)) {
          case (?b) b;
          case null 0;
        };
        balances.put(toEntry.principal, currentBalance + toEntry.amount);
      };
    };

    // ✅ Update transaction with releasedAt timestamp
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = "released";
            title = tx.title;
            releasedAt = ?TimeUtil.now();
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
    if (tx.status == "released" or tx.status == "cancelled") return;
    // Update status to #cancelled
    let updated = Array.tabulate<TransactionTypes.Transaction>(
      txs.size(),
      func(i) {
        if (i == idx) {
          {
            id = tx.id;
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = "cancelled";
            title = tx.title;
            releasedAt = null;
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
        if (tx.status == "cancelled") {
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
        if (tx.status == "pending") {
          {
            id = tx.id;
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = "cancelled";
            title = tx.title;
            releasedAt = null;
          };
        } else {
          tx;
        };
      },
    );
    transactions.put(caller, updated);
    logs := Array.append<Text>(logs, ["Cancelled by " # Principal.toText(caller)]);
  };

  public shared func releaseSplit(
    caller : Principal,
    txId : Text,
  ) : async () {
    let txs = switch (transactions.get(caller)) {
      case (?list) list;
      case null return;
    };

    var found = false;
    let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      txs,
      func(tx) {
        if (tx.id == txId and tx.status == "confirmed") {
          found := true;

          // Transfer only to approved recipients
          for (toEntry in tx.to.vals()) {
            if (toEntry.status == #approved) {
              let currentBalance = switch (balances.get(toEntry.principal)) {
                case (?b) b;
                case null 0;
              };
              balances.put(toEntry.principal, currentBalance + toEntry.amount);
            };
          };

          Debug.print("✅ Escrow released for txId: " # txId);
          Debug.print("✅ ReleasedAt: " # Nat.toText(TimeUtil.now()));

          {
            id = tx.id;
            from = tx.from;
            to = tx.to;
            timestamp = tx.timestamp;
            isRead = tx.isRead;
            status = "released";
            title = tx.title;
            releasedAt = ?TimeUtil.now();
          };
        } else {
          tx;
        };
      },
    );

    if (found) {
      transactions.put(caller, updated);
      logs := Array.append<Text>(
        logs,
        ["Escrow released by " # Principal.toText(caller) # " with txId: " # txId],
      );
    };
  };

  public query func getBalance(p : Principal) : async Nat {
    return Balance.getBalance(balances, p);
  };

  public query func getPending(caller : Principal) : async [Pending.PendingTransfer] {
    switch (pendingTransfers.get(caller)) { case (?list) list; case null [] };
  };

  public query func getTransactions(p : Principal) : async [TransactionTypes.Transaction] {
    var result : [TransactionTypes.Transaction] = [];

    // Get transactions where user is the sender
    let sentTxs = switch (transactions.get(p)) { case (?txs) txs; case null [] };
    result := Array.append(result, sentTxs);

    // Get transactions where user is a recipient
    for ((_, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        // Check if user is in the recipients list
        for (toEntry in tx.to.vals()) {
          if (toEntry.principal == p) {
            result := Array.append(result, [tx]);
          };
        };
      };
    };

    return result;
  };

  public func getTransactionsPaginated(
    p : Principal,
    page : Nat,
    pageSize : Nat,
  ) : async {
    transactions : [TransactionTypes.Transaction];
    totalCount : Nat;
    totalPages : Nat;
  } {
    var allTxs : [TransactionTypes.Transaction] = [];

    // Get transactions where user is the sender
    let sentTxs = switch (transactions.get(p)) { case (?txs) txs; case null [] };
    allTxs := Array.append(allTxs, sentTxs);

    // Get transactions where user is a recipient
    for ((_, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        // Check if user is in the recipients list
        for (toEntry in tx.to.vals()) {
          if (toEntry.principal == p) {
            allTxs := Array.append(allTxs, [tx]);
          };
        };
      };
    };

    let totalCount = allTxs.size();
    let totalPages = if (pageSize == 0) { 0 } else {
      (totalCount + pageSize - 1) / pageSize : Nat;
    }; // Ceiling division
    let startIndex = page * pageSize;
    let endIndex = Nat.min(startIndex + pageSize, totalCount);

    let paginatedTxs = if (startIndex < totalCount) {
      Array.tabulate<TransactionTypes.Transaction>(
        endIndex - startIndex,
        func(i) { allTxs[startIndex + i] },
      );
    } else { [] };

    {
      transactions = paginatedTxs;
      totalCount = totalCount;
      totalPages = totalPages;
    };
  };

  public query func getPendingApprovalsForRecipient(recipient : Principal) : async [TransactionTypes.Transaction] {
    var result : [TransactionTypes.Transaction] = [];
    label txLoop for ((_, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        if (tx.status == "pending" or tx.status == "confirmed") {
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

  public shared (_msg) func getTransaction(id : Text, caller : Principal) : async ?TransactionTypes.Transaction {
    // First check if transaction exists
    var foundTx : ?TransactionTypes.Transaction = null;
    for ((_, txs) in transactions.entries()) {
      for (tx in txs.vals()) {
        if (tx.id == id) {
          foundTx := ?tx;
        };
      };
    };

    // If transaction not found, return 404
    switch (foundTx) {
      case null { return null };
      case (?tx) {
        // Check if caller is authorized to view this transaction
        // Authorized if: caller is the sender OR caller is a recipient
        let isOwner = tx.from == caller;
        let isRecipient = Array.find<TransactionTypes.ToEntry>(
          tx.to,
          func(toEntry) { toEntry.principal == caller },
        );

        // Return 404 if not authorized
        if (not isOwner and isRecipient == null) {
          return null; // 404 - Unauthorized access
        };

        return ?tx;
      };
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
    let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
      txs,
      func(tx) {
        {
          id = tx.id;
          from = tx.from;
          to = tx.to;
          timestamp = tx.timestamp;
          isRead = true;
          status = tx.status;
          title = tx.title;
          releasedAt = null;
        };
      },
    );
    transactions.put(caller, updated);
  };

  public shared func setName(p : Principal, name : Text) : async () {
    names.put(p, name);
  };

  public query func getName(p : Principal) : async ?Text {
    return names.get(p);
  };

  public query func getLogs() : async [Text] {
    return logs;
  };

  public query func getAdmin() : async Principal {
    return admin;
  };
};
