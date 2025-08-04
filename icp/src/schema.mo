module {
    public type ToEntry = {
        principal : Principal;
        name : Text;
        amount : Nat;
        percentage : Nat;
        status : { #pending; #approved; #declined; #noaction };
        approvedAt : ?Nat;
        declinedAt : ?Nat;
        readAt : ?Nat;
    };
    public type TransactionStatus = Text;
    public type Transaction = {
        id : Text;
        from : Principal;
        to : [ToEntry];
        readAt : ?Nat;
        status : TransactionStatus;
        title : Text;
        createdAt : Nat;
        confirmedAt : ?Nat;
        cancelledAt : ?Nat;
        refundedAt : ?Nat;
        releasedAt : ?Nat;
        bitcoinAddress : ?Text;
        bitcoinTransactionHash : ?Text;
    };
    public type ParticipantShare = {
        principal : Principal;
        amount : Nat;
        nickname : Text;
        percentage : Nat;
    };
}; 