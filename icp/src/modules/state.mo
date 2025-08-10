import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import TransactionTypes "../schema";
import Reputation "../modules/reputation";

module {
    public type State = {
        balances : HashMap.HashMap<Principal, Nat>;
        bitcoinBalances : HashMap.HashMap<Principal, Nat>;
        transactions : HashMap.HashMap<Principal, [TransactionTypes.Transaction]>;
        names : HashMap.HashMap<Principal, Text>;
        reputation : HashMap.HashMap<Principal, Nat>;
        fraudHistory : HashMap.HashMap<Principal, [Reputation.FraudActivity]>;
        transactionHistory : HashMap.HashMap<Principal, [Text]>;
        userBitcoinAddresses : HashMap.HashMap<Principal, Text>;
        logs : [Text];
    };

    public func createState() : State {
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
        }
    };

    public func addLog(state : State, log : Text) : State {
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
        }
    };

    public func addLogs(state : State, newLogs : [Text]) : State {
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
        }
    };
};
