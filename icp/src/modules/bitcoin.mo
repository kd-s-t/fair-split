import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import Result "mo:base/Result";

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

        // Transfer Bitcoin from escrow to recipient
        public func transferBitcoin(
            fromAccount : Account,
            toAccount : Account,
            amount : Nat,
            memo : Nat64
        ) : async Result.Result<Nat, Text> {
            let transferArgs : TransferArgs = {
                memo = memo;
                amount = amount;
                fee = 0; // cKBTC typically has very low fees
                from_subaccount = fromAccount.subaccount;
                to = toAccount;
                created_at_time = null;
            };

            try {
                let result = await ledger.transfer(transferArgs);
                switch (result) {
                    case (#Ok(blockIndex)) {
                        return #ok(blockIndex);
                    };
                    case (#Err(error)) {
                        let errorMessage = switch (error) {
                            case (#BadFee(e)) { "Bad fee: expected " # Nat.toText(e.expected_fee) };
                            case (#BadBurn(e)) { "Bad burn: minimum " # Nat.toText(e.min_burn_amount) };
                            case (#InsufficientFunds(e)) { "Insufficient funds: balance " # Nat.toText(e.balance) };
                            case (#TooOld) { "Transaction too old" };
                            case (#CreatedInFuture(e)) { "Created in future: " # Nat64.toText(e.ledger_time) };
                            case (#Duplicate(e)) { "Duplicate: " # Nat.toText(e.duplicate_of) };
                            case (#TemporarilyUnavailable) { "Temporarily unavailable" };
                            case (#GenericError(e)) { "Generic error: " # e.error_message };
                        };
                        return #err(errorMessage);
                    };
                };
            } catch (_error) {
                return #err("Transfer failed");
            };
        };

        // Get Bitcoin balance for an account
        public func getBitcoinBalance(account : Account) : async Result.Result<Nat, Text> {
            try {
                let balance = await ledger.account_balance(account);
                return #ok(Nat64.toNat(balance.e8s));
            } catch (_error) {
                return #err("Failed to get balance");
            };
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