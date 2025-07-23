module {
    public type SplitRecord = {
        participant : Principal;
        share : Nat;
    };

    public type ParticipantShare = {
        principal : Principal;
        amount : Nat;
    };

    public type ToEntry = {
        principal : Principal;
        name : Text;
        amount : Nat;
    };

    public type TransactionStatus = {
        #pending;
        #released;
        #cancelled;
        #completed;
    };

    public type Transaction = {
        from : Principal;
        to : [ToEntry];
        timestamp : Nat;
        isRead : Bool;
        status : TransactionStatus;
    };

    public type PendingTransfer = {
        to : Principal;
        name : Text;
        amount : Nat;
        initiatedAt : Nat;
    };
};
