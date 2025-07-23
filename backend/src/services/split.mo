import Time "mo:base/Time";
import Int "mo:base/Int";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import TransactionModel "../models/transaction";
import Nat "mo:base/Nat";

module {
    public func initiateSplitBill(
        participants : [TransactionModel.ParticipantShare],
        caller : Principal,
        balances : HashMap.HashMap<Principal, Nat>,
        pendingTransfers : HashMap.HashMap<Principal, [TransactionModel.PendingTransfer]>,
        names : HashMap.HashMap<Principal, Text>,
    ) : () {
        let now = Int.abs(Time.now());

        for (p in participants.vals()) {
            if (p.principal == caller) {
                Debug.trap("Cannot send to yourself");
            };

            let currentCallerBal = switch (balances.get(caller)) {
                case (?b) b;
                case null 0;
            };
            if (currentCallerBal < p.amount) Debug.trap("Insufficient balance");

            balances.put(caller, currentCallerBal - p.amount);

            let prevPendings = switch (pendingTransfers.get(caller)) {
                case (?arr) arr;
                case null [];
            };
            let name = switch (names.get(p.principal)) {
                case (?n) n;
                case null "";
            };
            let pending : TransactionModel.PendingTransfer = {
                to = p.principal;
                name = name;
                amount = p.amount;
                initiatedAt = now;
            };
            pendingTransfers.put(caller, Array.append(prevPendings, [pending]));
        };
    };

    public func releasePending(
        caller : Principal,
        balances : HashMap.HashMap<Principal, Nat>,
        pendingTransfers : HashMap.HashMap<Principal, [TransactionModel.PendingTransfer]>,
    ) : [TransactionModel.ToEntry] {
        let pendings = switch (pendingTransfers.get(caller)) {
            case (?ps) ps;
            case null return [];
        };
        var releasedTo : [TransactionModel.ToEntry] = [];

        for (pending in pendings.vals()) {
            let currentBal = switch (balances.get(pending.to)) {
                case (?b) b;
                case null 0;
            };
            balances.put(pending.to, currentBal + pending.amount);
            releasedTo := Array.append(
                releasedTo,
                [{
                    principal = pending.to;
                    name = pending.name;
                    amount = pending.amount;
                }],
            );
        };

        ignore pendingTransfers.remove(caller);
        return releasedTo;
    };

    public func cancelPending(
        caller : Principal,
        balances : HashMap.HashMap<Principal, Nat>,
        pendingTransfers : HashMap.HashMap<Principal, [TransactionModel.PendingTransfer]>,
    ) : [TransactionModel.ToEntry] {
        let pendings = switch (pendingTransfers.get(caller)) {
            case (?list) list;
            case null return [];
        };

        var result : [TransactionModel.ToEntry] = [];

        var totalRefund : Nat = 0;

        for (pending in pendings.vals()) {
            totalRefund += pending.amount;

            result := Array.append(result, [{ principal = pending.to; name = pending.name; amount = pending.amount }]);
        };

        let currentBal = switch (balances.get(caller)) {
            case (?b) b;
            case null 0;
        };

        balances.put(caller, currentBal + totalRefund);
        ignore pendingTransfers.remove(caller);
        return result;
    };

};
