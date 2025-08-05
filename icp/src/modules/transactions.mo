import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import TransactionTypes "../schema";
import TimeUtil "../utils/time";
import Balance "../modules/balance";

module {
    // Transaction Management Functions
    public func getTransactionsPaginated(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        user : Principal,
        page : Nat,
        pageSize : Nat
    ) : {
        transactions : [TransactionTypes.Transaction];
        totalCount : Nat;
        totalPages : Nat;
    } {
        // Check for expired transactions first
        checkAndUpdateExpiredTransactions(transactions, balances);
        
        var allTxs : [TransactionTypes.Transaction] = [];

        // Get transactions where user is the sender
        let sentTxs = switch (transactions.get(user)) { 
            case (?txs) txs; 
            case null [] 
        };
        allTxs := Array.append(allTxs, sentTxs);

        // Get transactions where user is a recipient
        for ((_, txs) in transactions.entries()) {
            for (tx in txs.vals()) {
                // Check if user is in the recipients list
                for (toEntry in tx.to.vals()) {
                    if (toEntry.principal == user) {
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

    public func getTransaction(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>,
        id : Text,
        caller : Principal
    ) : ?TransactionTypes.Transaction {
        // Check for expired transactions first
        checkAndUpdateExpiredTransactions(transactions, balances);
        
        // First check if transaction exists
        var foundTx : ?TransactionTypes.Transaction = null;
        var foundSender : ?Principal = null;
        var foundIndex : ?Nat = null;
        for ((sender, txs) in transactions.entries()) {
            var index : Nat = 0;
            for (tx in txs.vals()) {
                if (tx.id == id) {
                    foundTx := ?tx;
                    foundSender := ?sender;
                    foundIndex := ?index;
                };
                index := index + 1;
            };
        };

        // If transaction not found, return null
        switch (foundTx, foundSender, foundIndex) {
            case (null, _, _) { return null };
            case (?tx, ?sender, ?index) {
                // Check if caller is authorized to view this transaction
                // Authorized if: caller is the sender OR caller is a recipient
                let isOwner = tx.from == caller;
                let isRecipient = Array.find<TransactionTypes.ToEntry>(
                    tx.to,
                    func(toEntry) { toEntry.principal == caller },
                );

                // Return null if not authorized
                if (not isOwner and isRecipient == null) {
                    return null; // Unauthorized access
                };

                // If caller is the sender and readAt is not set, update it
                if (isOwner and tx.readAt == null) {
                    let currentTime = TimeUtil.now();
                    let updatedTx = {
                        id = tx.id;
                        from = tx.from;
                        to = tx.to;
                        readAt = ?currentTime;
                        status = tx.status;
                        title = tx.title;
                        createdAt = tx.createdAt;
                        confirmedAt = tx.confirmedAt;
                        cancelledAt = tx.cancelledAt;
                        refundedAt = tx.refundedAt;
                        releasedAt = tx.releasedAt;
                        bitcoinAddress = tx.bitcoinAddress;
                        bitcoinTransactionHash = tx.bitcoinTransactionHash;
                    };
                    
                    // Update the transaction in the HashMap
                    switch (transactions.get(sender)) {
                        case (?txs) {
                            let updatedTxs = Array.tabulate<TransactionTypes.Transaction>(
                                txs.size(),
                                func(i) {
                                    if (i == index) {
                                        updatedTx
                                    } else {
                                        txs[i]
                                    }
                                }
                            );
                            transactions.put(sender, updatedTxs);
                        };
                        case null { };
                    };
                    
                    return ?updatedTx;
                };

                return ?tx;
            };
            case (_, _, _) { return null };
        };
    };

    public func getTransactionStats(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        user : Principal
    ) : {
        total : Nat;
        pending : Nat;
        confirmed : Nat;
        declined : Nat;
        cancelled : Nat;
        released : Nat;
        expired : Nat;
    } {
        var total : Nat = 0;
        var pending : Nat = 0;
        var confirmed : Nat = 0;
        var declined : Nat = 0;
        var cancelled : Nat = 0;
        var released : Nat = 0;
        var expired : Nat = 0;

        // Count user's own transactions
        switch (transactions.get(user)) {
            case (?txs) {
                for (tx in txs.vals()) {
                    total := total + 1;
                    switch (tx.status) {
                        case ("pending") { pending := pending + 1 };
                        case ("confirmed") { confirmed := confirmed + 1 };
                        case ("declined") { declined := declined + 1 };
                        case ("cancelled") { cancelled := cancelled + 1 };
                        case ("released") { released := released + 1 };
                        case ("expired") { expired := expired + 1 };
                        case (_) { };
                    };
                };
            };
            case null { };
        };

        // Count transactions where user is a recipient
        for ((_, txs) in transactions.entries()) {
            for (tx in txs.vals()) {
                for (toEntry in tx.to.vals()) {
                    if (toEntry.principal == user) {
                        total := total + 1;
                        switch (tx.status) {
                            case ("pending") { pending := pending + 1 };
                            case ("confirmed") { confirmed := confirmed + 1 };
                            case ("declined") { declined := declined + 1 };
                            case ("cancelled") { cancelled := cancelled + 1 };
                            case ("released") { released := released + 1 };
                            case ("expired") { expired := expired + 1 };
                            case (_) { };
                        };
                        // Only count once per transaction
                    };
                };
            };
        };

        {
            total = total;
            pending = pending;
            confirmed = confirmed;
            declined = declined;
            cancelled = cancelled;
            released = released;
            expired = expired;
        };
    };

    public func checkAndUpdateExpiredTransactions(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        balances : HashMap.HashMap<Principal, Nat>
    ) {
        let currentTime = TimeUtil.now();
        let expiryWindow = 24 * 60 * 60 * 1_000_000_000; // 24 hours in nanoseconds
        
        for ((sender, txs) in transactions.entries()) {
            let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                txs,
                func(tx) {
                    if (tx.status == "pending" and currentTime > tx.createdAt and ((currentTime - tx.createdAt) : Nat) > expiryWindow) {
                        // Check for recipients who haven't responded
                        let updatedTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
                            tx.to,
                            func(entry) {
                                if (entry.status == #pending) {
                                    {
                                        principal = entry.principal;
                                        name = entry.name;
                                        amount = entry.amount;
                                        percentage = entry.percentage;
                                        status = #noaction;
                                        approvedAt = entry.approvedAt;
                                        declinedAt = entry.declinedAt;
                                        readAt = entry.readAt;
                                        bitcoinAddress = entry.bitcoinAddress;
                                    }
                                } else {
                                    entry
                                }
                            }
                        );
                        
                        // Calculate total amount to refund (all noaction amounts)
                        let totalRefund = Array.foldLeft<TransactionTypes.ToEntry, Nat>(
                            updatedTo,
                            0,
                            func(acc, entry) {
                                if (entry.status == #noaction) {
                                    acc + entry.amount
                                } else {
                                    acc
                                }
                            }
                        );
                        
                        // Refund the sender for expired amounts
                        if (totalRefund > 0) {
                            Balance.increaseBalance(balances, sender, totalRefund);
                        };
                        
                        {
                            id = tx.id;
                            from = tx.from;
                            to = updatedTo;
                                                    readAt = tx.readAt;
                        status = "cancelled";
                            title = tx.title;
                            createdAt = tx.createdAt;
                            confirmedAt = tx.confirmedAt;
                            cancelledAt = ?currentTime;
                            refundedAt = ?currentTime;
                            releasedAt = tx.releasedAt;
                            bitcoinAddress = tx.bitcoinAddress;
                            bitcoinTransactionHash = tx.bitcoinTransactionHash;
                        }
                    } else {
                        tx
                    }
                }
            );
            transactions.put(sender, updated);
        };
    };

    public func markTransactionsAsRead(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        user : Principal,
        currentTime : Nat
    ) {
        switch (transactions.get(user)) {
            case (?txs) {
                let updated = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                    txs,
                    func(tx) {
                        {
                            id = tx.id;
                            from = tx.from;
                            to = tx.to;
                            readAt = ?currentTime;
                            status = tx.status;
                            title = tx.title;
                            createdAt = tx.createdAt;
                            confirmedAt = tx.confirmedAt;
                            cancelledAt = tx.cancelledAt;
                            refundedAt = tx.refundedAt;
                            releasedAt = tx.releasedAt;
                            bitcoinAddress = tx.bitcoinAddress;
                            bitcoinTransactionHash = tx.bitcoinTransactionHash;
                        }
                    },
                );
                transactions.put(user, updated);
            };
            case null { };
        };
    };

    public func recipientMarkAsReadBatch(
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>,
        transactionIds : [Text],
        recipientId : Principal,
        currentTime : Nat
    ) {
        // Iterate through all transactions to find matching ones
        for ((sender, txs) in transactions.entries()) {
            let updatedTxs = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
                txs,
                func(tx) {
                    // Check if this transaction ID is in our list
                    let shouldUpdate = Array.find<Text>(
                        transactionIds,
                        func(id) { id == tx.id }
                    );
                    
                    switch (shouldUpdate) {
                        case (?_) {
                            // Update recipient's readAt in the to array
                            let updatedTo = Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
                                tx.to,
                                func(entry) {
                                    if (entry.principal == recipientId and entry.readAt == null) {
                                        {
                                            principal = entry.principal;
                                            name = entry.name;
                                            amount = entry.amount;
                                            percentage = entry.percentage;
                                            status = entry.status;
                                            approvedAt = entry.approvedAt;
                                            declinedAt = entry.declinedAt;
                                            readAt = ?currentTime;
                                            bitcoinAddress = entry.bitcoinAddress;
                                        }
                                    } else {
                                        entry
                                    }
                                }
                            );
                            
                            {
                                id = tx.id;
                                from = tx.from;
                                to = updatedTo;
                                                            readAt = tx.readAt;
                            status = tx.status;
                                title = tx.title;
                                createdAt = tx.createdAt;
                                confirmedAt = tx.confirmedAt;
                                cancelledAt = tx.cancelledAt;
                                refundedAt = tx.refundedAt;
                                releasedAt = tx.releasedAt;
                                bitcoinAddress = tx.bitcoinAddress;
                                bitcoinTransactionHash = tx.bitcoinTransactionHash;
                            }
                        };
                        case null { tx };
                    }
                }
            );
            transactions.put(sender, updatedTxs);
        };
    };
}; 