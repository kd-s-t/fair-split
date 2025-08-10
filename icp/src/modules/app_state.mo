import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Time "mo:base/Time";
import TransactionTypes "../schema";
import Reputation "../modules/reputation";

module {
    // Centralized application state
    public type AppState = {
        balances : HashMap.HashMap<Principal, Nat>;
        bitcoinBalances : HashMap.HashMap<Principal, Nat>;
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
        names : HashMap.HashMap<Principal, Text>;
        reputation : HashMap.HashMap<Principal, Nat>;
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>;
        transactionHistory : HashMap.HashMap<Principal, [Text]>;
        userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
        logs : [Text];
        lastUpdate : Int;
    };

    // State operations result type
    public type StateResult<T> = {
        #Ok : T;
        #Err : Text;
    };

    // Create new application state
    public func createState() : AppState {
        {
            balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
            bitcoinBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
            transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
            names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
            reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
            fraudHistory = HashMap.HashMap<Principal, [Reputation.FraudActivity]>(10, Principal.equal, Principal.hash);
            transactionHistory = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
            userBitcoinAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
            logs = [];
            lastUpdate = Time.now();
        }
    };

    // Balance management
    public func getBalance(state : AppState, user : Principal) : Nat {
        switch (state.balances.get(user)) {
            case (?balance) balance;
            case null 0;
        }
    };

    public func setBalance(state : AppState, user : Principal, amount : Nat) : AppState {
        state.balances.put(user, amount);
        updateTimestamp(state)
    };

    public func addBalance(state : AppState, user : Principal, amount : Nat) : AppState {
        let currentBalance = getBalance(state, user);
        state.balances.put(user, currentBalance + amount);
        updateTimestamp(state)
    };

    public func deductBalance(state : AppState, user : Principal, amount : Nat) : StateResult<AppState> {
        let currentBalance = getBalance(state, user);
        if (currentBalance < amount) {
            #Err("Insufficient balance. Available: " # Nat.toText(currentBalance) # ", Required: " # Nat.toText(amount))
        } else {
            state.balances.put(user, currentBalance - amount);
            #Ok(updateTimestamp(state))
        }
    };

    // Bitcoin balance management
    public func getBitcoinBalance(state : AppState, user : Principal) : Nat {
        switch (state.bitcoinBalances.get(user)) {
            case (?balance) balance;
            case null 0;
        }
    };

    public func setBitcoinBalance(state : AppState, user : Principal, amount : Nat) : AppState {
        state.bitcoinBalances.put(user, amount);
        updateTimestamp(state)
    };

    public func addBitcoinBalance(state : AppState, user : Principal, amount : Nat) : AppState {
        let currentBalance = getBitcoinBalance(state, user);
        state.bitcoinBalances.put(user, currentBalance + amount);
        updateTimestamp(state)
    };

    public func deductBitcoinBalance(state : AppState, user : Principal, amount : Nat) : StateResult<AppState> {
        let currentBalance = getBitcoinBalance(state, user);
        if (currentBalance < amount) {
            #Err("Insufficient Bitcoin balance. Available: " # Nat.toText(currentBalance) # ", Required: " # Nat.toText(amount))
        } else {
            state.bitcoinBalances.put(user, currentBalance - amount);
            #Ok(updateTimestamp(state))
        }
    };

    // Transaction management
    public func addTransaction(state : AppState, sender : Principal, transaction : TransactionTypes.Transaction) : AppState {
        let existingTransactions = switch (state.transactions.get(sender)) {
            case (?txs) txs;
            case null [];
        };
        state.transactions.put(sender, Array.append(existingTransactions, [transaction]));
        updateTimestamp(state)
    };

    public func getTransactions(state : AppState, user : Principal) : [TransactionTypes.Transaction] {
        switch (state.transactions.get(user)) {
            case (?txs) txs;
            case null [];
        }
    };

    public func updateTransaction(state : AppState, sender : Principal, transactionId : Text, updater : TransactionTypes.Transaction -> TransactionTypes.Transaction) : StateResult<AppState> {
        let userTransactions = getTransactions(state, sender);
        var updated = false;
        let updatedTransactions = Array.map<TransactionTypes.Transaction, TransactionTypes.Transaction>(
            userTransactions,
            func(tx : TransactionTypes.Transaction) : TransactionTypes.Transaction {
                if (tx.id == transactionId) {
                    updated := true;
                    updater(tx)
                } else {
                    tx
                }
            }
        );
        
        if (updated) {
            state.transactions.put(sender, updatedTransactions);
            #Ok(updateTimestamp(state))
        } else {
            #Err("Transaction not found: " # transactionId)
        }
    };

    // Reputation management
    public func getUserReputation(state : AppState, user : Principal) : Nat {
        switch (state.reputation.get(user)) {
            case (?score) score;
            case null Reputation.INITIAL_REPUTATION;
        }
    };

    public func updateReputation(state : AppState, user : Principal, change : Int) : AppState {
        let currentScore = getUserReputation(state, user);
        let newScore = if (change > 0) {
            Nat.min(currentScore + Int.abs(change), Reputation.REPUTATION_MAX)
        } else {
            if (currentScore > Int.abs(change)) {
                currentScore - Int.abs(change) : Nat
            } else {
                0 : Nat
            }
        };
        state.reputation.put(user, newScore);
        updateTimestamp(state)
    };

    public func recordFraudActivity(state : AppState, user : Principal, activityType : Text, transactionId : Text) : AppState {
        let currentTime = Time.now();
        let newActivity = {
            timestamp = currentTime;
            activityType = activityType;
            transactionId = transactionId;
        };
        
        let existingActivities = switch (state.fraudHistory.get(user)) {
            case (?activities) activities;
            case null [];
        };
        
        state.fraudHistory.put(user, Array.append(existingActivities, [newActivity]));
        updateTimestamp(state)
    };

    // User management
    public func setNickname(state : AppState, user : Principal, nickname : Text) : AppState {
        state.names.put(user, nickname);
        updateTimestamp(state)
    };

    public func getNickname(state : AppState, user : Principal) : ?Text {
        state.names.get(user)
    };

    public func setBitcoinAddress(state : AppState, user : Principal, address : Text) : AppState {
        state.userBitcoinAddresses.put(user, address);
        updateTimestamp(state)
    };

    public func getBitcoinAddress(state : AppState, user : Principal) : ?Text {
        state.userBitcoinAddresses.get(user)
    };

    // Logging
    public func addLog(state : AppState, log : Text) : AppState {
        {
            balances = state.balances;
            bitcoinBalances = state.bitcoinBalances;
            transactions = state.transactions;
            names = state.names;
            reputation = state.reputation;
            fraudHistory = state.fraudHistory;
            transactionHistory = state.transactionHistory;
            userBitcoinAddresses = state.userBitcoinAddresses;
            logs = Array.append(state.logs, [log]);
            lastUpdate = Time.now();
        }
    };

    public func addLogs(state : AppState, newLogs : [Text]) : AppState {
        {
            balances = state.balances;
            bitcoinBalances = state.bitcoinBalances;
            transactions = state.transactions;
            names = state.names;
            reputation = state.reputation;
            fraudHistory = state.fraudHistory;
            transactionHistory = state.transactionHistory;
            userBitcoinAddresses = state.userBitcoinAddresses;
            logs = Array.append(state.logs, newLogs);
            lastUpdate = Time.now();
        }
    };

    public func getLogs(state : AppState) : [Text] {
        state.logs
    };

    // Utility functions
    private func updateTimestamp(state : AppState) : AppState {
        {
            balances = state.balances;
            bitcoinBalances = state.bitcoinBalances;
            transactions = state.transactions;
            names = state.names;
            reputation = state.reputation;
            fraudHistory = state.fraudHistory;
            transactionHistory = state.transactionHistory;
            userBitcoinAddresses = state.userBitcoinAddresses;
            logs = state.logs;
            lastUpdate = Time.now();
        }
    };

    // Validation functions
    public func validateUserExists(state : AppState, user : Principal) : Bool {
        switch (state.balances.get(user)) {
            case (?_) true;
            case null false;
        }
    };

    public func validateTransactionExists(state : AppState, transactionId : Text) : Bool {
        for ((_, transactions) in state.transactions.entries()) {
            for (tx in transactions.vals()) {
                if (tx.id == transactionId) {
                    return true;
                };
            };
        };
        false
    };

    // Statistics
    public func getStats(state : AppState) : {
        totalUsers : Nat;
        totalTransactions : Nat;
        totalReputation : Nat;
        lastUpdate : Int;
    } {
        var totalUsers = 0;
        var totalTransactions = 0;
        var totalReputation = 0;
        
        for ((_, balance) in state.balances.entries()) {
            totalUsers += 1;
        };
        
        for ((_, transactions) in state.transactions.entries()) {
            totalTransactions += transactions.size();
        };
        
        for ((_, reputation) in state.reputation.entries()) {
            totalReputation += reputation;
        };
        
        {
            totalUsers = totalUsers;
            totalTransactions = totalTransactions;
            totalReputation = totalReputation;
            lastUpdate = state.lastUpdate;
        }
    };
};
