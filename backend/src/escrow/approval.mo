import TransactionTypes "./transaction";
import Principal "mo:base/Principal";
import Array "mo:base/Array";

module {
    public func approveRecipient(to : [TransactionTypes.ToEntry], recipient : Principal) : [TransactionTypes.ToEntry] {
        Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(to, func(entry) {
            if (entry.principal == recipient) {
                {
                    principal = entry.principal;
                    name = entry.name;
                    amount = entry.amount;
                    status = #approved;
                }
            } else {
                entry
            }
        })
    };
    public func declineRecipient(to : [TransactionTypes.ToEntry], recipient : Principal) : [TransactionTypes.ToEntry] {
        Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(to, func(entry) {
            if (entry.principal == recipient) {
                {
                    principal = entry.principal;
                    name = entry.name;
                    amount = entry.amount;
                    status = #declined;
                }
            } else {
                entry
            }
        })
    };
} 