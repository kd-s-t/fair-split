import Principal "mo:base/Principal";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

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
import SEI "modules/sei";



persistent actor class SplitDApp(admin : Principal, _ckbtcCanisterId : Text) {

  transient var logs : [Text] = [];
  transient let balances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let transactions = HashMap.HashMap<Principal, [TransactionTypes.Transaction]>(10, Principal.equal, Principal.hash);
  transient let names = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  transient let usernames = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  
  // Bitcoin balance storage
  transient let bitcoinBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  
  // SEI balance storage
  transient let seiBalances = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  
  // Reputation system
  transient let reputation = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
  transient let fraudHistory = HashMap.HashMap<Principal, [Reputation.FraudActivity]>(10, Principal.equal, Principal.hash);
  transient let transactionHistory = HashMap.HashMap<Principal, [Text]>(10, Principal.equal, Principal.hash);
  
  // User Bitcoin address storage
  transient let userBitcoinAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);
  
  // User SEI address storage
  transient let userSeiAddresses = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  // Bitcoin integration - Dynamic cKBTC canister ID
  // For now, use a placeholder that won't cause initialization errors
  transient let bitcoinIntegration = Bitcoin.BitcoinIntegration("2vxsx-fae"); // Placeholder
  
  // SEI integration with Atlantic-2 testnet configuration
  transient let seiNetworkConfig : SEI.SeiNetwork = {
    name = "Atlantic-2 Testnet";
    chainId = "atlantic-2";
    rpcUrl = "https://rpc.atlantic-2.seinetwork.io";
    explorerUrl = "https://atlantic-2.sei.explorers.guru";
    prefix = "sei";
    isTestnet = true;
  };
  transient let seiIntegration = SEI.SEIIntegration("2vxsx-fae", seiNetworkConfig);
  
  // Initialize testnet SEI balances for development
  private func initializeTestnetSeiBalances() {
    // Set some test SEI balances for development
    seiIntegration.clearBalanceCache();
    Debug.print("🚀 SEI TESTNET: Initialized with Atlantic-2 testnet configuration");
    Debug.print("🔗 SEI RPC: " # seiNetworkConfig.rpcUrl);
    Debug.print("🔍 SEI EXPLORER: " # seiNetworkConfig.explorerUrl);
  };
  // Temporarily disable cKBTC integration for local deployment
  // transient let ckbtcIntegration = CKBTC.CKBTCIntegration(_ckbtcCanisterId, "ckbtc-minter-canister-id", Principal.fromText("aaaaa-aa"));
  

  


  public shared func initiateEscrow(
    caller : Principal,
    participants : [TransactionTypes.ParticipantShare],
    title : Text,
  ) : async Text {
    // Calculate total amount to be deducted
    let totalAmount = Array.foldLeft<TransactionTypes.ParticipantShare, Nat>(
      participants,
      0,
      func(acc, p) { acc + p.amount }
    );
    
    // Get current mock balance
    let currentMockBalance = await getUserBitcoinBalance(caller);
    
    // Check if user has sufficient balance
    if (currentMockBalance < totalAmount) {
      return "Error: Insufficient cKBTC balance. Required: " # Nat.toText(totalAmount) # " satoshis, Available: " # Nat.toText(currentMockBalance) # " satoshis";
    };
    
    // Deduct from both balance systems to keep them synchronized
    bitcoinIntegration.setMockBitcoinBalance(caller, currentMockBalance - totalAmount);
    bitcoinBalances.put(caller, currentMockBalance - totalAmount);
    
    // Then proceed with escrow creation
    let result = Escrow.initiateEscrow(caller, participants, title, balances, bitcoinBalances, transactions, names, reputation, fraudHistory, transactionHistory, logs, userBitcoinAddresses);
    logs := result.newLogs;
    switch (result.success, result.escrowId, result.error) {
      case (true, ?escrowId, null) { escrowId };
      case (false, null, ?error) { 
        // If escrow creation failed, restore the balance in both systems
        bitcoinIntegration.setMockBitcoinBalance(caller, currentMockBalance);
        bitcoinBalances.put(caller, currentMockBalance);
        error 
      };
      case (_, _, _) { 
        // If unexpected result, restore the balance in both systems
        bitcoinIntegration.setMockBitcoinBalance(caller, currentMockBalance);
        bitcoinBalances.put(caller, currentMockBalance);
        "Error: Unexpected result from escrow module" 
      };
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
    
    // Synchronize the mock balance system with the internal balance system
    if (result.success) {
      let currentInternalBalance = Balance.getBalance(bitcoinBalances, sender);
      bitcoinIntegration.setMockBitcoinBalance(sender, currentInternalBalance);
    };
  };

  public shared func cancelSplit(caller : Principal) : async () {
    let result = Escrow.cancelSplit(caller, transactions, balances, bitcoinBalances, logs);
    logs := result.newLogs;
    
    // Synchronize the mock balance system with the internal balance system
    if (result.success) {
      let currentInternalBalance = Balance.getBalance(bitcoinBalances, caller);
      bitcoinIntegration.setMockBitcoinBalance(caller, currentInternalBalance);
    };
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
    
    // If escrow was successfully released, synchronize balances
    if (result.success) {
      // Synchronize sender's mock balance with internal balance
      let senderInternalBalance = Balance.getBalance(bitcoinBalances, caller);
      bitcoinIntegration.setMockBitcoinBalance(caller, senderInternalBalance);
      
      // Get the transaction to find recipients
      let transaction = await getTransaction(txId, caller);
      switch (transaction) {
        case (?tx) {
          // Update mock balances for all approved recipients
          for (toEntry in tx.to.vals()) {
            if (toEntry.status == #approved) {
              // Get current mock balance for recipient
              let currentBalance = switch (await bitcoinIntegration.getBitcoinBalance({ owner = toEntry.principal; subaccount = null })) {
                case (#ok(balance)) balance;
                case (#err(_)) 0;
              };
              // Add the escrow amount to recipient's mock balance
              bitcoinIntegration.setMockBitcoinBalance(toEntry.principal, currentBalance + toEntry.amount);
            };
          };
        };
        case null { /* Transaction not found */ };
      };
    };
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

  // Public function to set mock Bitcoin balance for testing
  public shared func setMockBitcoinBalance(principal : Principal, amount : Nat) : async () {
    bitcoinIntegration.setMockBitcoinBalance(principal, amount);
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
    return Users.getNickname(names, p);
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

  // Username management functions
  public shared func setUsername(p : Principal, username : Text) : async () {
    Users.setUsername(usernames, p, username);
  };

  public query func getUsername(p : Principal) : async ?Text {
    return Users.getUsername(usernames, p);
  };

  public shared func removeUsername(principal : Principal) : async () {
    Users.removeUsername(usernames, principal);
  };

  public query func getAllUsernames() : async [(Principal, Text)] {
    Users.getAllUsernames(usernames);
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

  // cKBTC wallet generation (realistic fake addresses for presentation)
  public shared (msg) func requestCkbtcWallet() : async { #ok : { btcAddress : Text; owner : Principal; subaccount : CKBTC.Subaccount }; #err : Text } {
    // Generate realistic-looking fake Bitcoin address for presentation
    let fakeAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    
    #ok({
      btcAddress = fakeAddress;
      owner = msg.caller;
      subaccount = subaccountFromPrincipal(msg.caller);
    })
  };

  // Get cKBTC balance for user (uses mock balance for local deployment)
  public shared func getCkbtcBalance(user : Principal) : async { #ok : Nat; #err : Text } {
    // Use mock Bitcoin balance from the Bitcoin integration module
    let result = await bitcoinIntegration.getBitcoinBalance({ owner = user; subaccount = null });
    switch (result) {
      case (#ok(balance)) { #ok(balance) };
      case (#err(error)) { #err(error) };
    };
  };

  // Get or request cKBTC wallet address
  public shared({ caller }) func getOrRequestCkbtcWallet() : async { #ok : { btcAddress : Text; owner : Principal; subaccount : CKBTC.Subaccount }; #err : Text } {
    // Check if address already exists for this caller
    switch (userBitcoinAddresses.get(caller)) {
      case (?existingAddress) {
        // Return existing address
        #ok({
          btcAddress = existingAddress;
          owner = caller;
          subaccount = subaccountFromPrincipal(caller);
        })
      };
      case null {
        // Generate new address only if none exists
        let fakeAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
        userBitcoinAddresses.put(caller, fakeAddress);
        
        #ok({
          btcAddress = fakeAddress;
          owner = caller;
          subaccount = subaccountFromPrincipal(caller);
        })
      };
    }
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

  // SEI balance and wallet functions
  public shared func getSeiBalance(user : Principal) : async { #ok : Nat; #err : Text } {
    // Use mock SEI balance from the SEI integration module
    let result = await seiIntegration.getSeiBalance({ owner = user; subaccount = null });
    switch (result) {
      case (#ok(balance)) { #ok(balance) };
      case (#err(error)) { #err(error) };
    };
  };

  public shared({ caller }) func getOrRequestSeiWallet() : async { #ok : { seiAddress : Text; owner : Principal }; #err : Text } {
    // Check if address already exists for this caller
    switch (userSeiAddresses.get(caller)) {
      case (?existingAddress) {
        // Return existing address
        #ok({
          seiAddress = existingAddress;
          owner = caller;
        })
      };
      case null {
        // Generate new address only if none exists
        let fakeAddress = "sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
        userSeiAddresses.put(caller, fakeAddress);
        
        #ok({
          seiAddress = fakeAddress;
          owner = caller;
        })
      };
    }
  };

  public shared func getSeiBalanceAnonymous() : async { #ok : Nat; #err : Text } {
    // Return placeholder balance for local testing
    #ok(0)
  };

  // Get SEI network information
  public query func getSeiNetworkInfo() : async {
    name : Text;
    chainId : Text;
    rpcUrl : Text;
    explorerUrl : Text;
    prefix : Text;
    isTestnet : Bool;
  } {
    seiIntegration.getNetworkInfo()
  };

  // Get SEI faucet URL if on testnet
  public query func getSeiFaucetUrl() : async ?Text {
    seiIntegration.getFaucetUrl()
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

  // SEI address management functions
  public shared func setSeiAddress(caller : Principal, address : Text) : async Bool {
    // Basic SEI address validation
    if (address.size() < 26 or address.size() > 90) {
      return false;
    };
    
    // Check if it starts with valid SEI address prefixes
    if (not (Text.startsWith(address, #text "sei1"))) {
      return false;
    };
    
    userSeiAddresses.put(caller, address);
    true
  };

  public query func getSeiAddress(user : Principal) : async ?Text {
    userSeiAddresses.get(user)
  };

  public shared func removeSeiAddress(caller : Principal) : async Bool {
    switch (userSeiAddresses.get(caller)) {
      case (?_address) {
        userSeiAddresses.delete(caller);
        true
      };
      case null false;
    };
  };

  // Bitcoin balance management functions
  public shared func setBitcoinBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller == admin) {
      bitcoinBalances.put(user, amount);
      bitcoinIntegration.setMockBitcoinBalance(user, amount);
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
      let newBalance = currentBalance + amount;
      bitcoinBalances.put(user, newBalance);
      bitcoinIntegration.setMockBitcoinBalance(user, newBalance);
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

  // SEI balance management functions
  public shared func setSeiBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller == admin) {
      seiBalances.put(user, amount);
      true
    } else {
      false
    }
  };

  public query func getUserSeiBalance(user : Principal) : async Nat {
    switch (seiBalances.get(user)) {
      case (?balance) balance;
      case null 0;
    }
  };

  public shared func addSeiBalance(caller : Principal, user : Principal, amount : Nat) : async Bool {
    if (caller == admin) {
      let currentBalance = switch (seiBalances.get(user)) {
        case (?balance) balance;
        case null 0;
      };
      seiBalances.put(user, currentBalance + amount);
      true
    } else {
      false
    }
  };

  // ICP to SEI conversion function
  public shared func convertIcpToSei(caller : Principal, user : Principal, icpAmount : Nat) : async Bool {
    if (caller == admin) {
      // Get current ICP balance
      let currentIcpBalance = Balance.getBalance(balances, user);
      
      // Check if user has enough ICP
      if (currentIcpBalance < icpAmount) {
        return false;
      };
      
      // Convert ICP e8s to SEI usei
      // Using a simplified conversion rate: 1 ICP ≈ 0.0001 SEI
      // In production, you'd use real-time exchange rates
      let seiUsei = if (icpAmount >= 10_000_000) { icpAmount / 10_000_000 } else { 0 }; // Safe division
      
      // Deduct ICP from user's balance
      let newIcpBalance : Nat = currentIcpBalance - icpAmount;
      balances.put(user, newIcpBalance);
      
      // Add SEI to user's balance
      let currentSeiBalance = switch (seiBalances.get(user)) {
        case (?balance) balance;
        case null 0;
      };
      seiBalances.put(user, currentSeiBalance + seiUsei);
      
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

  // Withdraw functions
  public shared func withdrawIcp(caller : Principal, amount : Nat, recipientAddress : Text) : async { #ok : Text; #err : Text } {
    // Check if user has sufficient ICP balance
    let currentBalance = Balance.getBalance(balances, caller);
    if (currentBalance < amount) {
      return #err("Insufficient ICP balance. Required: " # Nat.toText(amount) # " e8s, Available: " # Nat.toText(currentBalance) # " e8s");
    };

    // Validate recipient address (basic validation)
    if (recipientAddress.size() < 26 or recipientAddress.size() > 100) {
      return #err("Invalid ICP address format");
    };

    // Prevent withdrawal to own address (for ICP, we can add a simple check)
    // Note: For ICP, we don't have a stored address like Bitcoin, so we'll add a basic check
    // In a real implementation, you might want to check against a list of known user addresses

    // Deduct amount from user's balance
    let newBalance = currentBalance - amount;
    balances.put(caller, newBalance);

    // Create a withdrawal transaction record
    let withdrawalId = "withdraw_icp_" # Principal.toText(caller) # "_" # Nat.toText(TimeUtil.now());

    // Add to user's transaction history with completed status
    let userTransactions = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    
    // Create the completed transaction directly (no pending state for simplicity)
    let completedTx : TransactionTypes.Transaction = {
      id = withdrawalId;
      from = caller;
      to = [{
        principal = caller;
        name = "ICP Withdrawal";
        amount = amount;
        percentage = 100;
        status = #approved;
        approvedAt = ?TimeUtil.now();
        declinedAt = null;
        readAt = ?TimeUtil.now();
        bitcoinAddress = null;
      }];
      readAt = ?TimeUtil.now();
      status = "withdraw_complete";
      title = "ICP Withdrawal to " # recipientAddress;
      createdAt = TimeUtil.now();
      confirmedAt = ?TimeUtil.now();
      cancelledAt = null;
      refundedAt = null;
      releasedAt = ?TimeUtil.now();
      bitcoinAddress = null;
      bitcoinTransactionHash = ?("icp_tx_" # withdrawalId);
    };
    
    transactions.put(caller, Array.append(userTransactions, [completedTx]));

    // Add to logs
    logs := Array.append(logs, ["ICP withdrawal completed: " # withdrawalId # " for " # Nat.toText(amount) # " e8s to " # recipientAddress]);

    logs := Array.append(logs, ["ICP withdrawal completed: " # withdrawalId]);

    #ok("ICP withdrawal successful. Transaction ID: " # withdrawalId)
  };

  public shared func withdrawBtc(caller : Principal, amount : Nat, recipientAddress : Text) : async { #ok : Text; #err : Text } {
    // Check if user has sufficient BTC balance
    let currentBalance = switch (bitcoinBalances.get(caller)) {
      case (?balance) balance;
      case null 0;
    };
    if (currentBalance < amount) {
      return #err("Insufficient BTC balance. Required: " # Nat.toText(amount) # " satoshis, Available: " # Nat.toText(currentBalance) # " satoshis");
    };

    // Validate recipient address (basic validation for Bitcoin address)
    if (recipientAddress.size() < 26 or recipientAddress.size() > 100) {
      return #err("Invalid Bitcoin address format");
    };

    // Prevent withdrawal to own address
    let userBitcoinAddress = switch (userBitcoinAddresses.get(caller)) {
      case (?address) address;
      case null "";
    };
    if (recipientAddress == userBitcoinAddress) {
      return #err("Cannot withdraw to your own Bitcoin address");
    };

    // Deduct amount from user's balance
    let newBalance = currentBalance - amount;
    bitcoinBalances.put(caller, newBalance);

    // Create a withdrawal transaction record
    let withdrawalId = "withdraw_btc_" # Principal.toText(caller) # "_" # Nat.toText(TimeUtil.now());

    // Add to user's transaction history with completed status
    let userTransactions = switch (transactions.get(caller)) {
      case (?txs) txs;
      case null [];
    };
    
    // Create the completed transaction directly (no pending state for simplicity)
    let completedTx : TransactionTypes.Transaction = {
      id = withdrawalId;
      from = caller;
      to = [{
        principal = caller;
        name = "BTC Withdrawal";
        amount = amount;
        percentage = 100;
        status = #approved;
        approvedAt = ?TimeUtil.now();
        declinedAt = null;
        readAt = ?TimeUtil.now();
        bitcoinAddress = ?recipientAddress;
      }];
      readAt = ?TimeUtil.now();
      status = "withdraw_complete";
      title = "BTC Withdrawal to " # recipientAddress;
      createdAt = TimeUtil.now();
      confirmedAt = ?TimeUtil.now();
      cancelledAt = null;
      refundedAt = null;
      releasedAt = ?TimeUtil.now();
      bitcoinAddress = ?recipientAddress;
      bitcoinTransactionHash = ?("btc_tx_" # withdrawalId);
    };
    
    transactions.put(caller, Array.append(userTransactions, [completedTx]));

    // Add to logs
    logs := Array.append(logs, ["BTC withdrawal completed: " # withdrawalId # " for " # Nat.toText(amount) # " satoshis to " # recipientAddress]);

    logs := Array.append(logs, ["BTC withdrawal completed: " # withdrawalId]);

    #ok("BTC withdrawal successful. Transaction ID: " # withdrawalId)
  };


};
