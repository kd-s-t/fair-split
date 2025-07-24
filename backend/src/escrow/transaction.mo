module {
    public type ToEntry = {
        principal : Principal;
        name : Text;
        amount : Nat;
        status : { #pending; #approved; #declined };
    };
    public type TransactionStatus = {
        #draft;
        #pending;
        #confirmed;
        #released;
        #cancelled;
        #declined;
    };
    public type Transaction = {
        from : Principal;
        to : [ToEntry];
        timestamp : Nat;
        isRead : Bool;
        status : TransactionStatus;
        title : Text;
    };
    public func createTransaction(
        from : Principal,
        to : [ToEntry],
        timestamp : Nat,
        title : Text
    ) : Transaction = {
        from = from;
        to = to;
        timestamp = timestamp;
        isRead = false;
        status = #draft;
        title = title;
    };
}
