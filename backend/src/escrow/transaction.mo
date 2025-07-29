module {
    public type ToEntry = {
        principal : Principal;
        name : Text;
        amount : Nat;
        status : { #pending; #approved; #declined };
    };
    public type TransactionStatus = Text; // Changed from variant to Text
    public type Transaction = {
        id : Text;
        from : Principal;
        to : [ToEntry];
        timestamp : Nat;
        isRead : Bool;
        status : TransactionStatus;
        title : Text;
    };
    public type ParticipantShare = {
        principal : Principal;
        amount : Nat;
    };
}
