import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import TransactionTypes "../schema";

module {
    // Recipient Management Functions
    public func findRecipientIndex(
        recipients : [TransactionTypes.ToEntry],
        recipient : Principal
    ) : ?Nat {
        let dummyEntry : TransactionTypes.ToEntry = {
            principal = recipient;
            name = "";
            amount = 0;
            percentage = 0;
            status = #pending;
            approvedAt = null;
            declinedAt = null;
            readAt = null;
        };
        Array.indexOf<TransactionTypes.ToEntry>(
            dummyEntry,
            recipients,
            func(a, b) { Principal.equal(a.principal, b.principal) }
        )
    };

    public func updateRecipientStatus(
        recipients : [TransactionTypes.ToEntry],
        recipient : Principal,
        status : { #approved; #declined },
        timestamp : Nat
    ) : [TransactionTypes.ToEntry] {
        Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
            recipients,
            func(entry) {
                if (Principal.equal(entry.principal, recipient)) {
                    switch (status) {
                        case (#approved) {
                            {
                                principal = entry.principal;
                                name = entry.name;
                                amount = entry.amount;
                                percentage = entry.percentage;
                                status = #approved;
                                approvedAt = ?timestamp;
                                declinedAt = entry.declinedAt;
                                readAt = entry.readAt;
                            }
                        };
                        case (#declined) {
                            {
                                principal = entry.principal;
                                name = entry.name;
                                amount = entry.amount;
                                percentage = entry.percentage;
                                status = #declined;
                                approvedAt = entry.approvedAt;
                                declinedAt = ?timestamp;
                                readAt = entry.readAt;
                            }
                        };
                    }
                } else {
                    entry
                }
            }
        )
    };

    public func markRecipientAsRead(
        recipients : [TransactionTypes.ToEntry],
        recipient : Principal,
        timestamp : Nat
    ) : [TransactionTypes.ToEntry] {
        Array.map<TransactionTypes.ToEntry, TransactionTypes.ToEntry>(
            recipients,
            func(entry) {
                if (Principal.equal(entry.principal, recipient)) {
                    {
                        principal = entry.principal;
                        name = entry.name;
                        amount = entry.amount;
                        percentage = entry.percentage;
                        status = entry.status;
                        approvedAt = entry.approvedAt;
                        declinedAt = entry.declinedAt;
                        readAt = ?timestamp;
                    }
                } else {
                    entry
                }
            }
        )
    };

    public func getRecipientAmount(
        recipients : [TransactionTypes.ToEntry],
        recipient : Principal
    ) : ?Nat {
        switch (findRecipientIndex(recipients, recipient)) {
            case (?index) { ?recipients[index].amount };
            case null { null };
        }
    };

    public func getAllApprovedRecipients(
        recipients : [TransactionTypes.ToEntry]
    ) : [TransactionTypes.ToEntry] {
        Array.filter<TransactionTypes.ToEntry>(
            recipients,
            func(entry) { entry.status == #approved }
        )
    };

    public func getPendingRecipients(
        recipients : [TransactionTypes.ToEntry]
    ) : [TransactionTypes.ToEntry] {
        Array.filter<TransactionTypes.ToEntry>(
            recipients,
            func(entry) { entry.status == #pending }
        )
    };

    public func getDeclinedRecipients(
        recipients : [TransactionTypes.ToEntry]
    ) : [TransactionTypes.ToEntry] {
        Array.filter<TransactionTypes.ToEntry>(
            recipients,
            func(entry) { entry.status == #declined }
        )
    };

    public func calculateTotalAmount(
        recipients : [TransactionTypes.ToEntry]
    ) : Nat {
        Array.foldLeft<TransactionTypes.ToEntry, Nat>(
            recipients,
            0,
            func(acc, entry) { acc + entry.amount }
        )
    };

    public func calculateApprovedAmount(
        recipients : [TransactionTypes.ToEntry]
    ) : Nat {
        Array.foldLeft<TransactionTypes.ToEntry, Nat>(
            recipients,
            0,
            func(acc, entry) {
                if (entry.status == #approved) {
                    acc + entry.amount
                } else {
                    acc
                }
            }
        )
    };

    public func calculateDeclinedAmount(
        recipients : [TransactionTypes.ToEntry]
    ) : Nat {
        Array.foldLeft<TransactionTypes.ToEntry, Nat>(
            recipients,
            0,
            func(acc, entry) {
                if (entry.status == #declined) {
                    acc + entry.amount
                } else {
                    acc
                }
            }
        )
    };

    public func isAllRecipientsApproved(
        recipients : [TransactionTypes.ToEntry]
    ) : Bool {
        Array.foldLeft<TransactionTypes.ToEntry, Bool>(
            recipients,
            true,
            func(acc, entry) { acc and (entry.status == #approved) }
        )
    };

    public func hasAnyRecipientDeclined(
        recipients : [TransactionTypes.ToEntry]
    ) : Bool {
        Array.foldLeft<TransactionTypes.ToEntry, Bool>(
            recipients,
            false,
            func(acc, entry) { acc or (entry.status == #declined) }
        )
    };

    public func getRecipientStatus(
        recipients : [TransactionTypes.ToEntry],
        recipient : Principal
    ) : ?{ #pending; #approved; #declined; #noaction } {
        switch (findRecipientIndex(recipients, recipient)) {
            case (?index) { ?recipients[index].status };
            case null { null };
        }
    };

    public func getRecipientStats(
        recipients : [TransactionTypes.ToEntry]
    ) : {
        total : Nat;
        approved : Nat;
        declined : Nat;
        pending : Nat;
        totalAmount : Nat;
        approvedAmount : Nat;
        declinedAmount : Nat;
    } {
        let total = Array.size(recipients);
        let approved = Array.size(getAllApprovedRecipients(recipients));
        let declined = Array.size(getDeclinedRecipients(recipients));
        let pending = Array.size(getPendingRecipients(recipients));
        let totalAmount = calculateTotalAmount(recipients);
        let approvedAmount = calculateApprovedAmount(recipients);
        let declinedAmount = calculateDeclinedAmount(recipients);

        {
            total = total;
            approved = approved;
            declined = declined;
            pending = pending;
            totalAmount = totalAmount;
            approvedAmount = approvedAmount;
            declinedAmount = declinedAmount;
        }
    };
}; 