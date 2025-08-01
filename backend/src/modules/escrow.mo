import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import TransactionTypes "../schema";
import Balance "../modules/balance";
import Reputation "../modules/reputation";
import TimeUtil "../utils/time";
// import Bitcoin "mo:bitcoin"; // Uncomment when deploying to mainnet

module {
    // State type to reduce function arguments
    public type State = {
        balances : HashMap.HashMap<Principal, Nat>;
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
        names : HashMap.HashMap<Principal, Text>;
        reputation : HashMap.HashMap<Principal, Nat>;
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>;
        transactionHistory : HashMap.HashMap<Principal, [Text]>;
        logs : [Text];
    };

    // Escrow Management Functions
    public func initiateEscrow(
        caller : Principal,
        participants : [TransactionTypes.ParticipantShare],
        title : Text,
        balances : HashMap.HashMap<Principal, Nat>,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        names : HashMap.HashMap<Principal, Text>,
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>,
        transactionHistory : HashMap.HashMap<Principal, [Text]>,
        logs : [Text]
    ) : {
        success : Bool;
        escrowId : ?Text;
        error : ?Text;
        newLogs : [Text];
    } {
        // Check reputation before allowing escrow creation
        if (not Reputation.canCreateEscrow(reputation, fraudHistory, caller)) {
            return {
                success = false;
                escrowId = null;
                error = ?("Error: Insufficient reputation to create escrow. Current reputation: " # Nat.toText(Reputation.getUserReputation(reputation, caller)) # ". Minimum required: " # Nat.toText(Reputation.MIN_REPUTATION_FOR_ESCROW));
                newLogs = logs;
            };
        };

        // Check for fraud patterns
        let currentTime = TimeUtil.now();
        if (Reputation.detectFraudPattern(fraudHistory, caller)) {
            return {
                success = false;
                escrowId = null;
                error = ?("Error: Account flagged for suspicious activity. Please contact support.");
                newLogs = logs;
            };
        };

        for (participant in participants.vals()) {
            if (participant.principal == caller) {
                return {
                    success = false;
                    escrowId = null;
                    error = ?("Error: Cannot send to your own address");
                    newLogs = logs;
                };
            };
        };

        let timestamp = currentTime;
        let principalText = Principal.toText(caller);
        let randomSuffix = Nat.toText(timestamp % 1000000);
        let escrowId = Nat.toText(timestamp) # "-" # principalText # "-" # randomSuffix;

        // Calculate total amount to escrow
        let totalAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            participants,
            0,
            func(acc, p) { acc + p.amount }
        );

        // Check sender's balance
        let senderBalance = Balance.getBalance(balances, caller);
        if (senderBalance < totalAmount) {
            return {
                success = false;
                escrowId = null;
                error = ?("Error: Insufficient balance");
                newLogs = logs;
            };
        };

        // Deduct from sender and hold in escrow
        Balance.decreaseBalance(balances, caller, totalAmount);

        // Generate Bitcoin address (placeholder for now, will be real on mainnet)
        let bitcoinAddress = "bc1qplaceholderaddressfornow"; // TODO: Replace with real Bitcoin address generation
        
        let tx : TransactionTypes.Transaction = {
            id = escrowId;
            from = caller;
            to = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ToEntry>(
                participants,
                func(p) {
                    {
                        principal = p.principal;
                        name = if (p.nickname != "") { p.nickname } else { switch (names.get(p.principal)) { case (?n) n; case null "" } };
                        amount = p.amount;
                        status = #pending;
                        approvedAt = null;
                        declinedAt = null;
                        readAt = null;
                    };
                },
            );
            readAt = null;
            status = "pending";
            title = title;
            createdAt = timestamp;
            confirmedAt = null;
            cancelledAt = null;
            refundedAt = null;
            releasedAt = null;
            bitcoinAddress = ?bitcoinAddress;
            bitcoinTransactionHash = null;
        };

        let existing = switch (transactions.get(caller)) {
            case (?txs) txs;
            case null [];
        };
        transactions.put(caller, Array.append(existing, [tx]));
        
        // Record transaction for history
        Reputation.recordTransaction(transactionHistory, caller, tx.id);

        let newLogs = Array.append<Text>(
            logs,
            [
                "Escrow created by " # Principal.toText(caller) # " at " # Nat.toText(timestamp),
                "Escrow ID: " # escrowId,
                "Awaiting recipient approvals",
            ],
        );

        {
            success = true;
            escrowId = ?escrowId;
            error = null;
            newLogs = newLogs;
        };
    };

    public func releaseSplit(
        caller : Principal,
        txId : Text,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        reputation : HashMap.HashMap<Principal, Nat>,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
        let txs = switch (transactions.get(caller)) {
            case (?list) list;
            case null return { success = false; newLogs = logs };
        };

        var found = false;
        let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
            txs,
            func(tx) {
                if (tx.id == txId and tx.status == "confirmed") {
                    // Check if all recipients are approved
                    let allApproved = Array.foldLeft<TransactionTypes.ToEntry, Bool>(
                        tx.to,
                        true,
                        func(acc, entry) {
                            acc and (entry.status == #approved)
                        },
                    );

                    if (not allApproved) {
                        Debug.print("❌ Not all recipients approved. Transfer aborted.");
                        return tx;
                    };

                    // Perform the transfer
                    for (toEntry in tx.to.vals()) {
                        if (toEntry.status == #approved) {
                            Balance.increaseBalance(balances, toEntry.principal, toEntry.amount);
                        };
                    };

                    Debug.print("✅ Escrow released for txId: " # txId);
                    Debug.print("✅ ReleasedAt: " # Nat.toText(TimeUtil.now()));

                    found := true;

                    {
                        id = tx.id;
                        from = tx.from;
                        to = tx.to;
                        readAt = tx.readAt;
                        status = "released";
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = tx.confirmedAt;
                        cancelledAt = tx.cancelledAt;
                        refundedAt = tx.refundedAt;
                        releasedAt = ?TimeUtil.now();
                        bitcoinAddress = tx.bitcoinAddress;
                        bitcoinTransactionHash = tx.bitcoinTransactionHash;
                    };
                } else {
                    tx;
                };
            },
        );

        if (found) {
            transactions.put(caller, updated);
            
            // Reputation bonus for successful transaction
            let _ = Reputation.updateReputation(reputation, caller, Reputation.REPUTATION_BONUS_SUCCESS);
            let newLogs = Array.append<Text>(
                logs,
                [
                    "Escrow released by " # Principal.toText(caller) # " with txId: " # txId,
                    "✅ Reputation bonus applied to " # Principal.toText(caller) # " for successful transaction"
                ],
            );
            { success = true; newLogs = newLogs };
        } else {
            { success = false; newLogs = logs };
        };
    };

    public func cancelSplit(
        caller : Principal,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
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
                    // Calculate total amount to refund
                    let totalAmount = Array.foldLeft<TransactionTypes.ToEntry, Nat>(
                        tx.to,
                        0,
                        func(acc, entry) { acc + entry.amount }
                    );
                    
                    // Refund the amount to sender
                    Balance.increaseBalance(balances, caller, totalAmount);
                    
                    {
                        id = tx.id;
                        from = tx.from;
                        to = tx.to;
                        readAt = tx.readAt;
                        status = "cancelled";
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = tx.confirmedAt;
                        cancelledAt = ?TimeUtil.now();
                        refundedAt = tx.refundedAt;
                        releasedAt = tx.releasedAt;
                        bitcoinAddress = tx.bitcoinAddress;
                        bitcoinTransactionHash = tx.bitcoinTransactionHash;
                    };
                } else {
                    tx;
                };
            },
        );
        transactions.put(caller, updated);
        let newLogs = Array.append<Text>(logs, ["Cancelled by " # Principal.toText(caller)]);
        { success = true; newLogs = newLogs };
    };

    public func approveEscrow(
        sender : Principal,
        txId : Text,
        recipient : Principal,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
        let txs = switch (transactions.get(sender)) {
            case (?list) list;
            case null return { success = false; newLogs = logs };
        };
        
        // Manual search for index by id
        var idx : Nat = 0;
        var found : Bool = false;
        label search for (i in Iter.range(0, txs.size() - 1)) {
            if (txs[i].id == txId) {
                idx := i;
                found := true;
                break search;
            }
        };
        if (not found) return { success = false; newLogs = logs };
        
        let tx = txs[idx];
        if (tx.status != "pending") return { success = false; newLogs = logs };

        let newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
            tx.to,
            func(entry) {
                if (entry.principal == recipient) {
                    {
                        principal = entry.principal;
                        name = entry.name;
                        amount = entry.amount;
                        status = #approved;
                        approvedAt = ?TimeUtil.now();
                        declinedAt = entry.declinedAt;
                        readAt = entry.readAt;
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
                        readAt = tx.readAt;
                        status = if (allApproved) "confirmed" else tx.status;
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = if (allApproved) ?TimeUtil.now() else tx.confirmedAt;
                        cancelledAt = tx.cancelledAt;
                        refundedAt = tx.refundedAt;
                        releasedAt = tx.releasedAt;
                        bitcoinAddress = tx.bitcoinAddress;
                        bitcoinTransactionHash = tx.bitcoinTransactionHash;
                    };
                } else {
                    txs[i];
                };
            },
        );

        transactions.put(sender, updated);

        let newLogs = if (allApproved) {
            Array.append<Text>(logs, ["All recipients approved escrow for " # Principal.toText(sender)]);
        } else {
            Array.append<Text>(logs, ["Recipient " # Principal.toText(recipient) # " approved escrow for " # Principal.toText(sender)]);
        };

        { success = true; newLogs = newLogs };
    };

    public func declineEscrow(
        sender : Principal,
        idx : Nat,
        recipient : Principal,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
        let txs = switch (transactions.get(sender)) {
            case (?list) list;
            case null return { success = false; newLogs = logs };
        };
        if (idx >= txs.size()) return { success = false; newLogs = logs };
        
        let tx = txs[idx];
        if (tx.status != "pending" and tx.status != "confirmed") return { success = false; newLogs = logs };
        if (tx.status == "declined" or tx.status == "released" or tx.status == "cancelled") return { success = false; newLogs = logs };
        
        // Fraud detection for quick refunds
        let currentTime = TimeUtil.now();
        let timeSinceCreation = if (currentTime > tx.createdAt) {
            currentTime - tx.createdAt : Nat
        } else {
            0 : Nat
        };
        
        // If this is a quick refund (within 5 minutes), record it as suspicious activity
        if (timeSinceCreation < Reputation.QUICK_REFUND_WINDOW) {
            Reputation.recordFraudActivity(fraudHistory, sender, "quick_refund", tx.id);
            let _ = Reputation.updateReputation(reputation, sender, Reputation.REPUTATION_PENALTY_QUICK_REFUND);
            let _ = Array.append<Text>(logs, ["⚠️ Quick refund detected for " # Principal.toText(sender) # " - Reputation penalty applied"]);
        } else {
            // Normal decline - smaller penalty
            let _ = Reputation.updateReputation(reputation, sender, Reputation.REPUTATION_PENALTY_DECLINE);
        };
        
        let newTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
            tx.to,
            func(entry) {
                if (entry.principal == recipient) {
                    {
                        principal = entry.principal;
                        name = entry.name;
                        amount = entry.amount;
                        status = #declined;
                        approvedAt = entry.approvedAt;
                        declinedAt = ?TimeUtil.now();
                        readAt = entry.readAt;
                    };
                } else {
                    entry;
                };
            },
        );
        
        Balance.increaseBalance(balances, sender, tx.to[idx].amount); // Refund the declined amount
        
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
                        readAt = tx.readAt;
                        status = newStatus;
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = tx.confirmedAt;
                        cancelledAt = tx.cancelledAt;
                        refundedAt = tx.refundedAt;
                        releasedAt = tx.releasedAt;
                        bitcoinAddress = tx.bitcoinAddress;
                        bitcoinTransactionHash = tx.bitcoinTransactionHash;
                    };
                } else {
                    txs[i];
                };
            },
        );
        transactions.put(sender, updated);
        
        let newLogs = Array.append<Text>(logs, ["Escrow declined by recipient " # Principal.toText(recipient) # " for " # Principal.toText(sender)]);
        { success = true; newLogs = newLogs };
    };
}; 