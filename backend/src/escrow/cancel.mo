import TransactionTypes "./transaction";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";

module {
    public func refundToSender(
        to : [TransactionTypes.ToEntry],
        sender : Principal,
        balances : HashMap.HashMap<Principal, Nat>
    ) : () {
        var totalRefund : Nat = 0;
        for (entry in to.vals()) {
            totalRefund += entry.amount;
        };
        let current = switch (balances.get(sender)) {
            case (?b) b;
            case null 0;
        };
        balances.put(sender, current + totalRefund);
    }
} 