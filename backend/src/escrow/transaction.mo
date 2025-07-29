module {
    public type ToEntry = {
        principal : Principal;
        name : Text;
        amount : Nat;
        status : { #pending; #approved; #declined };
    };
    public type TransactionStatus = Text;
    public type Transaction = {
        id : Text;
        from : Principal;
        to : [ToEntry];
        timestamp : Nat;
        isRead : Bool;
        status : TransactionStatus;
        title : Text;
        releasedAt : ?Nat;
    };
    public type ParticipantShare = {
        principal : Principal;
        amount : Nat;
    };
};
