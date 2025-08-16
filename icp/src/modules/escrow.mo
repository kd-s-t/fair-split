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
    // Get real-time BTC to ICP exchange rate
    // For now, using a reasonable fixed rate, but this could be replaced with an API call
    private func getBtcToIcpRate() : Nat {
        // Current approximate rate: 1 BTC ≈ 15,000 ICP
        // In a real implementation, this would call an external API
        15_000
    };
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
        bitcoinBalances : HashMap.HashMap<Principal, Nat>,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        names : HashMap.HashMap<Principal, Text>,
        reputation : HashMap.HashMap<Principal, Nat>,
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>,
        transactionHistory : HashMap.HashMap<Principal, [Text]>,
        logs : [Text],
        userBitcoinAddresses : HashMap.HashMap<Principal, Text>
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
        let _totalAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            participants,
            0,
            func(acc, p) { acc + p.amount }
        );

        // Validate that percentages are between 1-100 and add up to 100%
        let totalPercentage = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            participants,
            0,
            func(acc, p) { acc + p.percentage }
        );
        
        // Check if any percentage is outside 1-100 range
        let hasInvalidPercentage = Array.find<TransactionTypes.ParticipantShare>(
            participants,
            func(p) { p.percentage < 1 or p.percentage > 100 }
        );
        
        if (hasInvalidPercentage != null) {
            return {
                success = false;
                escrowId = null;
                error = ?("Error: Each percentage must be between 1-100%");
                newLogs = logs;
            };
        };
        
        if (totalPercentage != 100) {
            return {
                success = false;
                escrowId = null;
                error = ?("Error: Total percentage must be 100%. Current total: " # Nat.toText(totalPercentage) # "%");
                newLogs = logs;
            };
        };

        // Separate participants into Bitcoin and ICP recipients
        let bitcoinParticipants = Array.filter<TransactionTypes.ParticipantShare>(
            participants,
            func(p) {
                switch (p.bitcoinAddress) {
                    case (?address) { address != "" };
                    case null false;
                }
            }
        );
        
        let icpParticipants = Array.filter<TransactionTypes.ParticipantShare>(
            participants,
            func(p) {
                switch (p.bitcoinAddress) {
                    case (?address) { address == "" };
                    case null true;
                }
            }
        );

        // Convert ICP participants' amounts from Bitcoin to ICP using real-time exchange rate
        let convertedIcpParticipants = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ParticipantShare>(
            icpParticipants,
            func(p) {
                let btcAmountInSatoshis = p.amount;
                // Get real-time BTC to ICP exchange rate
                let exchangeRate = getBtcToIcpRate();
                // Convert satoshis to ICP using integer arithmetic
                // 1 BTC = 100,000,000 satoshis
                // 1 BTC = 15,000 ICP (current rate)
                // So 1 satoshi = 0.00015 ICP
                let icpAmount = btcAmountInSatoshis * exchangeRate / 100_000_000;
                {
                    principal = p.principal;
                    amount = icpAmount;
                    nickname = p.nickname;
                    percentage = p.percentage;
                    bitcoinAddress = null; // No Bitcoin address for ICP recipients
                }
            }
        );

        // Calculate total Bitcoin amount needed (only for Bitcoin recipients)
        let totalBitcoinAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            bitcoinParticipants,
            0,
            func(acc, p) { acc + p.amount }
        );

        // Calculate total ICP amount needed (for ICP recipients)
        let totalIcpAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
            convertedIcpParticipants,
            0,
            func(acc, p) { acc + p.amount }
        );

        // Check sender's Bitcoin balance for Bitcoin recipients
        if (totalBitcoinAmount > 0) {
            let senderBitcoinBalance = Balance.getBalance(bitcoinBalances, caller);
            if (senderBitcoinBalance < totalBitcoinAmount) {
                return {
                    success = false;
                    escrowId = null;
                    error = ?("Error: Insufficient Bitcoin balance. Required: " # Nat.toText(totalBitcoinAmount) # " satoshis, Available: " # Nat.toText(senderBitcoinBalance) # " satoshis");
                    newLogs = logs;
                };
            };
        };

        // Check sender's ICP balance for ICP recipients
        var updatedLogs = logs;
        if (totalIcpAmount > 0) {
            let senderIcpBalance = Balance.getBalance(balances, caller);
            if (senderIcpBalance < totalIcpAmount) {
                // Sender doesn't have enough ICP, try to convert from Bitcoin
                let senderBitcoinBalance = Balance.getBalance(bitcoinBalances, caller);
                let requiredBtcForIcp = totalIcpAmount * 100_000_000 / getBtcToIcpRate(); // Convert ICP needed to BTC
                
                if (senderBitcoinBalance < requiredBtcForIcp) {
                    return {
                        success = false;
                        escrowId = null;
                        error = ?("Error: Insufficient balance. Need " # Nat.toText(totalIcpAmount) # " ICP (or " # Nat.toText(requiredBtcForIcp) # " satoshis) for ICP recipients, but only have " # Nat.toText(senderIcpBalance) # " ICP and " # Nat.toText(senderBitcoinBalance) # " satoshis");
                        newLogs = logs;
                    };
                };
                
                // Convert Bitcoin to ICP for the sender
                Balance.decreaseBalance(bitcoinBalances, caller, requiredBtcForIcp);
                Balance.increaseBalance(balances, caller, totalIcpAmount);
                
                updatedLogs := Array.append<Text>(
                    logs,
                    [
                        "Converted " # Nat.toText(requiredBtcForIcp) # " satoshis to " # Nat.toText(totalIcpAmount) # " ICP for sender " # Principal.toText(caller)
                    ]
                );
            };
        };

        // Deduct Bitcoin from sender's balance for Bitcoin recipients
        if (totalBitcoinAmount > 0) {
            Balance.decreaseBalance(bitcoinBalances, caller, totalBitcoinAmount);
        };

        // Deduct ICP from sender's balance for ICP recipients
        if (totalIcpAmount > 0) {
            Balance.decreaseBalance(balances, caller, totalIcpAmount);
        };

        // Combine Bitcoin and ICP participants for transaction creation
        let allParticipants = Array.append<TransactionTypes.ParticipantShare>(
            bitcoinParticipants,
            convertedIcpParticipants
        );
        
        // Get sender's Bitcoin address
        let senderBitcoinAddress = switch (userBitcoinAddresses.get(caller)) {
            case (?address) address;
            case null "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"; // Fallback if no address set
        };
        
        let tx : TransactionTypes.Transaction = {
            id = escrowId;
            from = caller;
            to = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ToEntry>(
                allParticipants,
                func(p) {
                    {
                        principal = p.principal;
                        name = if (p.nickname != "") { p.nickname } else { switch (names.get(p.principal)) { case (?n) n; case null "" } };
                        amount = p.amount; // This could be in satoshis (BTC) or ICP
                        percentage = p.percentage;
                        status = #pending;
                        approvedAt = null;
                        declinedAt = null;
                        readAt = null;
                        bitcoinAddress = p.bitcoinAddress; // Store recipient's Bitcoin address (null for ICP recipients)
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
            bitcoinAddress = ?senderBitcoinAddress; // Use sender's actual Bitcoin address
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
            updatedLogs,
            [
                "Mixed escrow created by " # Principal.toText(caller) # " at " # Nat.toText(timestamp),
                "Escrow ID: " # escrowId,
                "Sender Bitcoin address: " # senderBitcoinAddress,
                "Bitcoin recipients: " # Nat.toText(bitcoinParticipants.size()) # " with " # Nat.toText(totalBitcoinAmount) # " satoshis",
                "ICP recipients: " # Nat.toText(convertedIcpParticipants.size()) # " with " # Nat.toText(totalIcpAmount) # " ICP",
                "Total recipients: " # Nat.toText(allParticipants.size()),
                "Awaiting recipient approvals for mixed transfer",
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
        _balances : HashMap.HashMap<Principal, Nat>,
        bitcoinBalances : HashMap.HashMap<Principal, Nat>,
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
                            // Check if this is a Bitcoin recipient (has Bitcoin address)
                            switch (toEntry.bitcoinAddress) {
                                case (?bitcoinAddress) {
                                    if (bitcoinAddress != "" and bitcoinAddress != "bc1qplaceholderaddressfornow") {
                                        // This is a real Bitcoin transfer - call the Bitcoin transfer function
                                        // Note: In a real implementation, you'd need to pass the bitcoinIntegration instance
                                        // For now, we'll just log it and update internal balances
                                        Debug.print("🔗 BITCOIN TRANSFER: " # Nat.toText(toEntry.amount) # " satoshis to " # bitcoinAddress);
                                        // TODO: Call actual Bitcoin transfer here
                                        // let result = await bitcoinIntegration.transferBitcoin(fromAccount, toAccount, toEntry.amount, 0);
                                    } else {
                                        // This is an ICP recipient, update internal balance
                                        Balance.increaseBalance(bitcoinBalances, toEntry.principal, toEntry.amount);
                                    };
                                };
                                case null {
                                    // No Bitcoin address, treat as ICP recipient
                                    Balance.increaseBalance(bitcoinBalances, toEntry.principal, toEntry.amount);
                                };
                            };
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
        _balances : HashMap.HashMap<Principal, Nat>,
        bitcoinBalances : HashMap.HashMap<Principal, Nat>,
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
                    Balance.increaseBalance(bitcoinBalances, caller, totalAmount);
                    
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
                        percentage = entry.percentage;
                        status = #approved;
                        approvedAt = ?TimeUtil.now();
                        declinedAt = entry.declinedAt;
                        readAt = entry.readAt;
                        bitcoinAddress = entry.bitcoinAddress;
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
        _balances : HashMap.HashMap<Principal, Nat>,
        bitcoinBalances : HashMap.HashMap<Principal, Nat>,
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
                        percentage = entry.percentage;
                        status = #declined;
                        approvedAt = entry.approvedAt;
                        declinedAt = ?TimeUtil.now();
                        readAt = entry.readAt;
                        bitcoinAddress = entry.bitcoinAddress;
                    };
                } else {
                    entry;
                };
            },
        );
        
        // Find the recipient's amount to refund
        let recipientAmount = Array.find<TransactionTypes.ToEntry>(
            tx.to,
            func(entry) { entry.principal == recipient }
        );
        
        switch (recipientAmount) {
            case (?entry) {
                Balance.increaseBalance(bitcoinBalances, sender, entry.amount); // Refund the declined amount
            };
            case null {
                // Recipient not found, this shouldn't happen but handle gracefully
                Debug.print("Warning: Recipient not found in transaction for decline");
            };
        };
        
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

    public func updateEscrow(
        caller : Principal,
        txId : Text,
        updatedParticipants : [TransactionTypes.ParticipantShare],
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>
    ) : {
        success : Bool;
        error : ?Text;
    } {
        let txs = switch (transactions.get(caller)) {
            case (?list) list;
            case null return { success = false; error = ?("Transaction not found") };
        };
        
        // Find the transaction by ID
        var txIndex : Nat = 0;
        var found : Bool = false;
        label search for (i in Iter.range(0, txs.size() - 1)) {
            if (txs[i].id == txId) {
                txIndex := i;
                found := true;
                break search;
            }
        };
        if (not found) return { success = false; error = ?("Transaction not found") };
        
        let tx = txs[txIndex];
        
        // Check if escrow can be updated (only pending status)
        if (tx.status != "pending") {
            return { 
                success = false; 
                error = ?("Cannot update escrow: Transaction is not in pending status")
            };
        };
        
        // Check if any recipients have already taken action
        let canUpdate = Array.foldLeft<TransactionTypes.ToEntry, Bool>(
            tx.to,
            true,
            func(acc, entry) {
                acc and (entry.status == #pending)
            }
        );
        
        if (not canUpdate) {
            return { 
                success = false; 
                error = ?("Cannot update escrow: Some recipients have already taken action")
            };
        };
        
        // Create new ToEntry array from updated participants
        let newTo = Array.map<TransactionTypes.ParticipantShare, TransactionTypes.ToEntry>(
            updatedParticipants,
            func(p) {
                {
                    principal = p.principal;
                    name = if (p.nickname != "") { p.nickname } else { "" };
                    amount = p.amount;
                    percentage = p.percentage;
                    status = #pending;
                    approvedAt = null;
                    declinedAt = null;
                    readAt = null;
                    bitcoinAddress = p.bitcoinAddress;
                };
            }
        );
        
        // Update the transaction
        let updatedTx : TransactionTypes.Transaction = {
            id = tx.id;
            from = tx.from;
            to = newTo;
            readAt = tx.readAt;
            status = "pending";
            title = tx.title;
            createdAt = tx.createdAt;
            confirmedAt = null;
            cancelledAt = null;
            refundedAt = null;
            releasedAt = null;
            bitcoinAddress = tx.bitcoinAddress;
            bitcoinTransactionHash = tx.bitcoinTransactionHash;
        };
        
        // Update the transactions array
        let updated = Array.tabulate<TransactionTypes.Transaction>(
            txs.size(),
            func(i) {
                if (i == txIndex) {
                    updatedTx
                } else {
                    txs[i]
                };
            }
        );
        
        transactions.put(caller, updated);
        
        { success = true; error = null };
    };

    public func refundSplit(
        caller : Principal,
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        _balances : HashMap.HashMap<Principal, Nat>,
        bitcoinBalances : HashMap.HashMap<Principal, Nat>,
        logs : [Text]
    ) : {
        success : Bool;
        newLogs : [Text];
    } {
        let txs = switch (transactions.get(caller)) {
            case (?list) list;
            case null return { success = false; newLogs = logs };
        };
        
        let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
            txs,
            func(tx) {
                if (tx.status == "confirmed") {
                    // Calculate total amount to refund
                    let totalAmount = Array.foldLeft<TransactionTypes.ToEntry, Nat>(
                        tx.to,
                        0,
                        func(acc, entry) { acc + entry.amount }
                    );
                    
                    // Refund the amount to sender
                    Balance.increaseBalance(bitcoinBalances, caller, totalAmount);
                    
                    {
                        id = tx.id;
                        from = tx.from;
                        to = tx.to;
                        readAt = tx.readAt;
                        status = "refund";
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = tx.confirmedAt;
                        cancelledAt = ?TimeUtil.now();
                        refundedAt = ?TimeUtil.now();
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
        let newLogs = Array.append<Text>(logs, ["Refunded by " # Principal.toText(caller)]);
        { success = true; newLogs = newLogs };
    };
}; 