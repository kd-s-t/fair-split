import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";

import TransactionTypes "schema";
import Balance "modules/balance";
import TimeUtil "utils/time";
import Reputation "modules/reputation";
import Transactions "modules/transactions";
import Escrow "modules/escrow";
import Users "modules/users";
import Admin "modules/admin";

persistent actor class SplitDApp(admin : Principal) {

  transient var logs : [Text] = [];
  transient let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  transient let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  
  // Reputation system
  transient let reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let fraudHistory = HashMap.HashMap<Principal, [Reputation.FraudActivity]>(10, Principal.equal, Principal.hash);
  transient let transactionHistory = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);

  public shared func initiateEscrow(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async Text {
    let result = Escrow.initiateEscrow(caller, participants, title, balances, transactions, names, reputation, fraudHistory, transactionHistory, logs);
    logs := result.newLogs;
    switch (result.success, result.escrowId, result.error) {
      case (true, ?escrowId, null) { escrowId };
      case (false, null, ?error) { error };
      case (_, _, _) { "Error: Unexpected result from escrow module" };
    };
  };

  public shared func recipientApproveEscrow(
    sender : Principal,
    txId : Text,
    recipient : Principal,
  ) : async () {
    let result = Escrow.approveEscrow(sender, txId, recipient, transactions, logs);
    logs := result.newLogs;
  };

  public shared func recipientDeclineEscrow(
    sender : Principal,
    idx : Nat,
    recipient : Principal,
  ) : async () {
    let result = Escrow.declineEscrow(sender, idx, recipient, transactions, balances, reputation, fraudHistory, logs);
    logs := result.newLogs;
  };

  public shared func cancelSplit(caller : Principal) : async () {
    let result = Escrow.cancelSplit(caller, transactions, balances, logs);
    logs := result.newLogs;
  };

  public shared func releaseSplit(
    caller : Principal,
    txId : Text,
  ) : async () {
    let result = Escrow.releaseSplit(caller, txId, transactions, balances, reputation, logs);
    logs := result.newLogs;
  };

  public query func getBalance(p : Principal) : async Nat {
    return Balance.getBalance(balances, p);
  };

  public func getTransactionsPaginated(
    p : Principal,
    page : Nat,
    pageSize : Nat,
  ) : async {
    transactions : [TransactionTypes.Transaction];
    totalCount : Nat;
    totalPages : Nat;
  } {
    Transactions.getTransactionsPaginated(transactions, balances, p, page, pageSize);
  };

  public shared (_msg) func getTransaction(id : Text, caller : Principal) : async ?TransactionTypes.Transaction {
    Transactions.getTransaction(transactions, balances, id, caller);
  };

  public shared func setInitialBalance(p : Principal, amount : Nat, caller : Principal) : async () {
    let _ = Admin.setInitialBalance(balances, admin, caller, p, amount);
  };

  public shared func markTransactionsAsRead(caller : Principal) : async () {
    Transactions.markTransactionsAsRead(transactions, caller, TimeUtil.now());
  };

  public shared func recipientMarkAsReadBatch(
    transactionIds : [Text],
    recipientId : Principal
  ) : async () {
    Transactions.recipientMarkAsReadBatch(transactions, transactionIds, recipientId, TimeUtil.now());
  };

  public shared func setNickname(p : Principal, name : Text) : async () {
    Users.setNickname(names, p, name);
  };

  public query func getNickname(p : Principal) : async ?Text {
    Users.getNickname(names, p);
  };

  public shared func setCustomNickname(
    principal : Principal,
    nickname : Text
  ) : async () {
    Users.setCustomNickname(names, principal, nickname);
  };

  public query func getCustomNickname(principal : Principal) : async ?Text {
    Users.getCustomNickname(names, principal);
  };

  public shared func removeNickname(principal : Principal) : async () {
    Users.removeNickname(names, principal);
  };

  public query func getAllNicknames() : async [(Principal, Text)] {
    Users.getAllNicknames(names);
  };

  public query func getAdmin() : async Principal {
    return admin;
  };

  // Reputation system public functions
  public query func getUserReputationScore(user : Principal) : async Nat {
    return Reputation.getUserReputation(reputation, user);
  };

  public query func isUserFlaggedForFraud(user : Principal) : async Bool {
    return Reputation.detectFraudPattern(fraudHistory, user);
  };

  public query func canUserCreateEscrow(user : Principal) : async Bool {
    return Reputation.canCreateEscrow(reputation, fraudHistory, user);
  };

  public query func getFraudHistory(user : Principal) : async [Reputation.FraudActivity] {
    switch (fraudHistory.get(user)) {
      case (?history) history;
      case null [];
    };
  };

  public query func getReputationStats(user : Principal) : async {
    reputation : Nat;
    isFlagged : Bool;
    canCreateEscrow : Bool;
    fraudCount : Nat;
  } {
    let userRep = Reputation.getUserReputation(reputation, user);
    let isFlagged = Reputation.detectFraudPattern(fraudHistory, user);
    let canCreate = Reputation.canCreateEscrow(reputation, fraudHistory, user);
    let fraudHistoryList = switch (fraudHistory.get(user)) {
      case (?history) history;
      case null [];
    };
    
    {
      reputation = userRep;
      isFlagged = isFlagged;
      canCreateEscrow = canCreate;
      fraudCount = fraudHistoryList.size();
    };
  };

  // Admin function to reset reputation (for testing/debugging)
  public shared func resetUserReputation(user : Principal, caller : Principal) : async () {
    let result = Admin.resetUserReputation(reputation, fraudHistory, admin, caller, user, logs);
    logs := result.newLogs;
  };

  // Bitcoin transaction hash functions
  public shared func getBitcoinTransactionHash(_escrowId : Text, _caller : Principal) : async ?Text {
    // TODO: Implement real Bitcoin transaction hash lookup when on mainnet
    // For now, return null as placeholder
    null
  };

  public shared func updateBitcoinTransactionHash(_escrowId : Text, _txHash : Text, _caller : Principal) : async Bool {
    // TODO: Implement real Bitcoin transaction hash update when on mainnet
    // For now, return false as placeholder
    false
  };
};
