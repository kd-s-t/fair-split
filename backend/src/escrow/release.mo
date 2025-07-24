import TransactionTypes "./transaction";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import HashMap "mo:base/HashMap";

module {
    public func releaseToApproved(
        to : [TransactionTypes.ToEntry],
        balances : HashMap.HashMap<Principal, Nat>
    ) : () {
        for (entry in to.vals()) {
            if (entry.status == #approved) {
                let current = switch (balances.get(entry.principal)) {
                    case (?b) b;
                    case null 0;
                };
                balances.put(entry.principal, current + entry.amount);
            }
        }
    }
} 