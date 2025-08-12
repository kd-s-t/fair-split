import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Debug "mo:base/Debug";

// cKBTC Ledger Interface
module {
    public type Account = {
        owner : Principal;
        subaccount : ?[Nat8];
    };

    public type TransferArgs = {
        memo : Nat64;
        amount : Nat;
        fee : Nat;
        from_subaccount : ?[Nat8];
        to : Account;
        created_at_time : ?Nat64;
    };

    public type TransferResult = {
        #Ok : Nat;
        #Err : TransferError;
    };

    public type TransferError = {
        #BadFee : { expected_fee : Nat };
        #BadBurn : { min_burn_amount : Nat };
        #InsufficientFunds : { balance : Nat };
        #TooOld;
        #CreatedInFuture : { ledger_time : Nat64 };
        #Duplicate : { duplicate_of : Nat };
        #TemporarilyUnavailable;
        #GenericError : { error_code : Nat; error_message : Text };
    };

    public type Ledger = actor {
        transfer : (TransferArgs) -> async TransferResult;
        account_balance : (Account) -> async { e8s : Nat64 };
    };

    // Bitcoin integration for SafeSplit
    public class BitcoinIntegration(ledgerCanisterId : Text) {
        // Mock Bitcoin balances for local development
        private var mockBitcoinBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
        private var mockTransactionId : Nat = 0;
        private let ledger : Ledger = actor(ledgerCanisterId);

        // Convert ICP e8s to Bitcoin satoshis (approximate conversion)
        public func icpToBitcoin(icpE8s : Nat) : Nat {
            // This is a simplified conversion - in production you'd use real-time rates
            // 1 ICP ≈ 0.000001 BTC (this is approximate and should be updated)
            return icpE8s / 100_000_000; // Simplified conversion
        };

        // Convert Bitcoin satoshis to ICP e8s
        public func bitcoinToIcp(satoshis : Nat) : Nat {
            return satoshis * 100_000_000; // Simplified conversion
        };

        // Transfer Bitcoin from escrow to recipient (MOCK VERSION for local development)
        public func transferBitcoin(
            fromAccount : Account,
            toAccount : Account,
            amount : Nat,
            memo : Nat64
        ) : async Result.Result<Nat, Text> {
            // For local development, use mock balances instead of real cKBTC
            let fromBalance = switch (mockBitcoinBalances.get(fromAccount.owner)) {
                case (?balance) balance;
                case null 0;
            };

            if (fromBalance < amount) {
                return #err("Insufficient funds: balance " # Nat.toText(fromBalance) # ", required " # Nat.toText(amount));
            };

            // Update mock balances
            mockBitcoinBalances.put(fromAccount.owner, fromBalance - amount);
            
            let toBalance = switch (mockBitcoinBalances.get(toAccount.owner)) {
                case (?balance) balance;
                case null 0;
            };
            mockBitcoinBalances.put(toAccount.owner, toBalance + amount);

            // Generate mock transaction ID
            mockTransactionId += 1;
            
            Debug.print("🔗 MOCK BITCOIN TRANSFER: " # Nat.toText(amount) # " satoshis from " # Principal.toText(fromAccount.owner) # " to " # Principal.toText(toAccount.owner) # " (txid: " # Nat.toText(mockTransactionId) # ")");
            
            return #ok(mockTransactionId);
        };

        // Get Bitcoin balance for an account (MOCK VERSION)
        public func getBitcoinBalance(account : Account) : async Result.Result<Nat, Text> {
            let balance = switch (mockBitcoinBalances.get(account.owner)) {
                case (?b) b;
                case null 0;
            };
            return #ok(balance);
        };

        // Set mock Bitcoin balance for testing
        public func setMockBitcoinBalance(principal : Principal, amount : Nat) {
            mockBitcoinBalances.put(principal, amount);
            Debug.print("💰 Set mock Bitcoin balance for " # Principal.toText(principal) # ": " # Nat.toText(amount) # " satoshis");
        };

        // Create a Bitcoin escrow account
        public func createBitcoinEscrowAccount(_escrowId : Text) : Account {
            // In a real implementation, you'd create a proper subaccount
            // This is a simplified version
            return {
                owner = Principal.fromText("2vxsx-fae"); // Replace with your canister principal
                subaccount = null;
            };
        };

        // Validate Bitcoin transaction
        public func validateBitcoinTransaction(
            amount : Nat,
            senderBalance : Nat
        ) : Bool {
            return amount > 0 and senderBalance >= amount;
        };
    };
}; 