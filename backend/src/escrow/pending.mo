import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";

module {
    public type PendingTransfer = {
        to : Principal;
        name : Text;
        amount : Nat;
        initiatedAt : Nat;
    };
    // Add functions for managing pending transfers as needed
} 