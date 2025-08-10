import Text "mo:base/Text";
import Nat "mo:base/Nat";

module {
    public type ErrorType = {
        #InsufficientBalance : { required : Nat; available : Nat };
        #InsufficientReputation : { current : Nat; required : Nat };
        #FraudDetected : { reason : Text };
        #InvalidInput : { field : Text; message : Text };
        #Unauthorized : { operation : Text };
        #TransactionNotFound : { id : Text };
        #BitcoinError : { operation : Text; details : Text };
        #SystemError : { code : Nat; message : Text };
    };

    public type Result<T, E> = {
        #Ok : T;
        #Err : E;
    };

    public func formatError(error : ErrorType) : Text {
        switch (error) {
            case (#InsufficientBalance(e)) {
                "Insufficient balance. Required: " # Nat.toText(e.required) # ", Available: " # Nat.toText(e.available)
            };
            case (#InsufficientReputation(e)) {
                "Insufficient reputation. Current: " # Nat.toText(e.current) # ", Required: " # Nat.toText(e.required)
            };
            case (#FraudDetected(e)) {
                "Fraud detected: " # e.reason
            };
            case (#InvalidInput(e)) {
                "Invalid input for " # e.field # ": " # e.message
            };
            case (#Unauthorized(e)) {
                "Unauthorized operation: " # e.operation
            };
            case (#TransactionNotFound(e)) {
                "Transaction not found: " # e.id
            };
            case (#BitcoinError(e)) {
                "Bitcoin error in " # e.operation # ": " # e.details
            };
            case (#SystemError(e)) {
                "System error " # Nat.toText(e.code) # ": " # e.message
            };
        }
    };

    public func createInsufficientBalanceError(required : Nat, available : Nat) : ErrorType {
        #InsufficientBalance({ required = required; available = available })
    };

    public func createInsufficientReputationError(current : Nat, required : Nat) : ErrorType {
        #InsufficientReputation({ current = current; required = required })
    };

    public func createFraudDetectedError(reason : Text) : ErrorType {
        #FraudDetected({ reason = reason })
    };

    public func createInvalidInputError(field : Text, message : Text) : ErrorType {
        #InvalidInput({ field = field; message = message })
    };

    public func createUnauthorizedError(operation : Text) : ErrorType {
        #Unauthorized({ operation = operation })
    };

    public func createTransactionNotFoundError(id : Text) : ErrorType {
        #TransactionNotFound({ id = id })
    };

    public func createBitcoinError(operation : Text, details : Text) : ErrorType {
        #BitcoinError({ operation = operation; details = details })
    };

    public func createSystemError(code : Nat, message : Text) : ErrorType {
        #SystemError({ code = code; message = message })
    };
};
