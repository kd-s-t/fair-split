import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Blob "mo:base/Blob";
import Array "mo:base/Array";

import Debug "mo:base/Debug";

import TransactionTypes "schema";
import Balance "modules/balance";
import TimeUtil "utils/time";
import Reputation "modules/reputation";
import Transactions "modules/transactions";
import Escrow "modules/escrow";
import Users "modules/users";
import Admin "modules/admin";
import Bitcoin "modules/bitcoin";
import CKBTC "modules/ckbtc";



persistent actor class SplitDApp(admin : Principal, _ckbtcCanisterId : Text) {

  transient var logs : [Text] = [];
  transient let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  transient let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  
  // Bitcoin balance storage
  transient let bitcoinBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  
  // Reputation system
  transient let reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let fraudHistory = HashMap.HashMap<Principal, [Reputation.FraudActivity]>(10, Principal.equal, Principal.hash);
  transient let transactionHistory = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
  
  // User Bitcoin address storage
  transient let userBitcoinAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  // Bitcoin integration - Dynamic cKBTC canister ID
  // For now, use a placeholder that won't cause initialization errors
  transient let bitcoinIntegration = Bitcoin.BitcoinIntegration("2vxsx-fae"); // Placeholder
  // Temporarily disable cKBTC integration for local deployment
  // transient let ckbtcIntegration = CKBTC.CKBTCIntegration(_ckbtcCanisterId, "ckbtc-minter-canister-id", Principal.fromText("aaaaa-aa"));
  

  


  public shared func initiateEscrow(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async Text {
    let result = Escrow.initiateEscrow(caller, participants, title, balances, bitcoinBalances, transactions, names, reputation, fraudHistory, transactionHistory, logs, userBitcoinAddresses);
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
    let result = Escrow.declineEscrow(sender, idx, recipient, transactions, balances, bitcoinBalances, reputation, fraudHistory, logs);
    logs := result.newLogs;
  };

  public shared func cancelSplit(caller : Principal) : async () {
    let result = Escrow.cancelSplit(caller, transactions, balances, bitcoinBalances, logs);
    logs := result.newLogs;
  };

  public shared func refundSplit(caller : Principal) : async () {
    let result = Escrow.refundSplit(caller, transactions, balances, bitcoinBalances, logs);
    logs := result.newLogs;
  };

  public shared func releaseSplit(
    caller : Principal,
    txId : Text,
  ) : async () {
    let result = Escrow.releaseSplit(caller, txId, transactions, balances, bitcoinBalances, reputation, logs);
    logs := result.newLogs;
  };

  public shared func updateEscrow(
    caller : Principal,
    txId : Text,
    updatedParticipants : [TransactionTypes.ParticipantShare]
  ) : async () {
    let result = Escrow.updateEscrow(caller, txId, updatedParticipants, transactions);
    if (not result.success) {
      // Handle error - could throw or log
      Debug.print("Failed to update escrow: " # (switch (result.error) { case (?e) e; case null "Unknown error" }));
    };
  };

  public query func getBalance(p : Principal) : async Nat {
    return Balance.getBalance(balances, p);
  };

  // Bitcoin integration functions (internal use only)
  private func _getBitcoinBalance(account : Bitcoin.Account) : async { #ok : Nat; #err : Text } {
    let result = await bitcoinIntegration.getBitcoinBalance(account);
    return result;
  };

  private func _transferBitcoin(
    fromAccount : Bitcoin.Account,
    toAccount : Bitcoin.Account,
    amount : Nat,
    memo : Nat64
  ) : async { #ok : Nat; #err : Text } {
    let result = await bitcoinIntegration.transferBitcoin(fromAccount, toAccount, amount, memo);
    return result;
  };

  private func _createBitcoinEscrow(escrowId : Text) : async Bitcoin.Account {
    return bitcoinIntegration.createBitcoinEscrowAccount(escrowId);
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

  // cKBTC wallet generation (placeholder for local deployment)
  public shared (msg) func requestCkbtcWallet() : async { #ok : { btcAddress : Text; owner : Principal; subaccount : CKBTC.Subaccount }; #err : Text } {
    // Return placeholder data for local testing
    #ok({
      btcAddress = "bc1qplaceholderaddressforlocaltesting";
      owner = msg.caller;
      subaccount = subaccountFromPrincipal(msg.caller);
    })
  };

  // Get cKBTC balance for user (placeholder for local deployment)
  public shared func getCkbtcBalance(user : Principal) : async { #ok : Nat; #err : Text } {
    // Return placeholder balance for local testing
    #ok(0)
  };

  // Anonymous versions for local development
  public shared func requestCkbtcWalletAnonymous() : async { #ok : { btcAddress : Text; owner : Principal; subaccount : CKBTC.Subaccount }; #err : Text } {
    // Return placeholder data for local testing
    #ok({
      btcAddress = "bc1qplaceholderaddressforlocaltesting";
      owner = Principal.fromText("2vxsx-fae");
      subaccount = subaccountFromPrincipal(Principal.fromText("2vxsx-fae"));
    })
  };

  public shared func getCkbtcBalanceAnonymous() : async { #ok : Nat; #err : Text } {
    // Return placeholder balance for local testing
    #ok(0)
  };

  // Helper function for cKBTC subaccount generation
  private func subaccountFromPrincipal(p : Principal) : CKBTC.Subaccount {
    let src = Blob.toArray(Principal.toBlob(p));
    let out = Array.tabulate<Nat8>(32, func(i : Nat) : Nat8 {
      if (i == 0) 0x53
      else if (i == 1) 0x41
      else if (i == 2) 0x46
      else if (i == 3) 0x45
      else if (i < 4 + src.size() and i >= 4) src[i - 4]
      else 0
    });
    Blob.fromArray(out)
  };

  // Bitcoin address management functions
  public shared func setBitcoinAddress(caller : Principal, address : Text) : async Bool {
    // Basic Bitcoin address validation
    if (address.size() < 26 or address.size() > 90) {
      return false;
    };
    
    // Check if it starts with valid Bitcoin address prefixes
    if (not (Text.startsWith(address, #text "1") or Text.startsWith(address, #text "3") or Text.startsWith(address, #text "bc1"))) {
      return false;
    };
    
    userBitcoinAddresses.put(caller, address);
    true
  };

  public query func getBitcoinAddress(user : Principal) : async ?Text {
    userBitcoinAddresses.get(user)
  };

  public shared func removeBitcoinAddress(caller : Principal) : async Bool {
    switch (userBitcoinAddresses.get(caller)) {
      case (?_address) {
        userBitcoinAddresses.delete(caller);
        true
      };
      case null false;
    };
  };

  // Bitcoin balance management functions
  public shared func setBitcoinBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller == admin) {
      bitcoinBalances.put(user, amount);
      true
    } else {
      false
    }
  };

  public query func getUserBitcoinBalance(user : Principal) : async Nat {
    switch (bitcoinBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    }
  };

  public shared func addBitcoinBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller == admin) {
      let currentBalance = switch (bitcoinBalances.get(user)) {
        case (?balance) balance;
        case null 0;
      };
      bitcoinBalances.put(user, currentBalance + amount);
      true
    } else {
      false
    }
  };

  // ICP to Bitcoin conversion function
  public shared func convertIcpToBitcoin(caller : Principal, user : Principal, icpAmount : Nat) : async Bool {
    if (caller == admin) {
      // Get current ICP balance
      let currentIcpBalance = Balance.getBalance(balances, user);
      
      // Check if user has enough ICP
      if (currentIcpBalance < icpAmount) {
        return false;
      };
      
      // Convert ICP e8s to Bitcoin satoshis
      // Using a simplified conversion rate: 1 ICP ≈ 0.000001 BTC
      // In production, you'd use real-time exchange rates
      let bitcoinSatoshis = if (icpAmount >= 100_000_000) { icpAmount / 100_000_000 } else { 0 }; // Safe division
      
      // Deduct ICP from user's balance
      let newIcpBalance : Nat = currentIcpBalance - icpAmount;
      balances.put(user, newIcpBalance);
      
      // Add Bitcoin to user's balance
      let currentBitcoinBalance = switch (bitcoinBalances.get(user)) {
        case (?balance) balance;
        case null 0;
      };
      bitcoinBalances.put(user, currentBitcoinBalance + bitcoinSatoshis);
      
      true
    } else {
      false
    }
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


};
