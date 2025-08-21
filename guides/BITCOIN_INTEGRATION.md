# Bitcoin Integration with ICP SafeSplit

This guide explains how to connect your ICP SafeSplit application to Bitcoin using different approaches.

## 1. cKBTC (Chain-Key Bitcoin) - Recommended

### What is cKBTC?
- **Native Bitcoin on ICP**: cKBTC is a Bitcoin representation on the Internet Computer that maintains 1:1 backing with real Bitcoin
- **Chain-Key Cryptography**: Uses advanced cryptography for secure Bitcoin integration
- **Low Fees**: Minimal transaction costs compared to traditional Bitcoin networks
- **Fast Transactions**: Near-instant finality on ICP

### Implementation Steps

#### 1.1 Update dfx.json
```json
{
  "canisters": {
    "split_dapp": {
      "type": "motoko",
      "main": "icp/src/main.mo",
      "dependencies": ["ckbtc_ledger"]
    },
    "ckbtc_ledger": {
      "type": "custom",
      "candid": "https://raw.githubusercontent.com/dfinity/ic/master/rs/bitcoin/ckbtc/ledger/ledger.did",
      "wasm": "https://download.dfinity.systems/ic/ckbtc_ledger.wasm"
    }
  }
}
```

#### 1.2 Deploy cKBTC Canister
```bash
# Deploy to mainnet
dfx deploy --network ic ckbtc_ledger

# Deploy to local (for testing)
dfx deploy --network local ckbtc_ledger
```

#### 1.3 Update Your Canister
The Bitcoin integration module (`icp/src/modules/bitcoin.mo`) provides:
- Bitcoin balance checking
- Bitcoin transfers
- Escrow account creation
- Transaction validation

### Usage Examples

#### Check Bitcoin Balance
```motoko
let account = {
    owner = Principal.fromText("your-principal-id");
    subaccount = null;
};
let balance = await canister.getBitcoinBalance(account);
```

#### Transfer Bitcoin
```motoko
let fromAccount = { owner = sender; subaccount = null; };
let toAccount = { owner = recipient; subaccount = null; };
let result = await canister.transferBitcoin(fromAccount, toAccount, amount, memo);
```

## 2. Bitcoin Integration via External APIs

### Option A: Bitcoin Core RPC
```motoko
// Connect to Bitcoin node via HTTP API
public func sendBitcoinViaRPC(
    toAddress : Text,
    amount : Nat,
    privateKey : Text
) : async Result.Result<Text, Text> {
    // Implementation using Bitcoin Core RPC
    // Requires external Bitcoin node
};
```

### Option B: Third-Party Services
- **BlockCypher API**: Easy Bitcoin integration
- **Coinbase API**: Commercial Bitcoin services
- **BitGo API**: Enterprise Bitcoin solutions

## 3. Lightning Network Integration

### Benefits
- **Instant Payments**: Sub-second transaction finality
- **Low Fees**: Minimal transaction costs
- **Scalability**: High transaction throughput

### Implementation
```motoko
// Lightning Network integration
public func createLightningInvoice(
    amount : Nat,
    description : Text
) : async Result.Result<Text, Text> {
    // Create Lightning invoice
    // Return payment request
};
```

## 4. Deployment Configuration

### Environment Variables
```bash
# Add to your deployment script
export CKBTC_LEDGER_ID="mxzaz-hqaaa-aaaar-qaada-cai"
export BITCOIN_NETWORK="mainnet"  # or "testnet"
export LIGHTNING_ENDPOINT="your-lightning-node"
```

### Network-Specific Setup

#### Mainnet
```bash
# Deploy to mainnet
dfx deploy --network ic split_dapp
dfx deploy --network ic ckbtc_ledger
```

#### Testnet
```bash
# Deploy to testnet for development
dfx deploy --network ic_testnet split_dapp
dfx deploy --network ic_testnet ckbtc_ledger
```

## 5. Security Considerations

### Private Key Management
- **Never store private keys in canisters**
- Use hardware wallets or secure key management
- Implement proper authentication

### Transaction Validation
```motoko
public func validateBitcoinTransaction(
    amount : Nat,
    senderBalance : Nat,
    recipientAddress : Text
) : Bool {
    // Validate transaction parameters
    // Check sufficient balance
    // Verify address format
    return amount > 0 and senderBalance >= amount;
};
```

### Rate Limiting
```motoko
// Implement rate limiting for Bitcoin operations
private let rateLimiter = HashMap.HashMap<Principal, Nat>(10, Principal.equal, Principal.hash);
```

## 6. Testing

### Local Testing
```bash
# Start local replica
dfx start --clean

# Deploy canisters
dfx deploy --network local

# Test Bitcoin functions
dfx canister call split_dapp getBitcoinBalance '(...)'
```

### Integration Tests
```motoko
// Test Bitcoin integration
public func testBitcoinIntegration() : async Bool {
    let account = { owner = Principal.fromText("test"); subaccount = null; };
    let balance = await getBitcoinBalance(account);
    return true;
};
```

## 7. Monitoring and Analytics

### Transaction Tracking
```motoko
// Track Bitcoin transactions
private let bitcoinTransactions = HashMap.HashMap<Text, {
    amount : Nat;
    from : Principal;
    to : Principal;
    timestamp : Int;
    status : Text;
}>(10, Text.equal, Text.hash);
```

### Error Handling
```motoko
public func handleBitcoinError(error : Text) : Text {
    switch (error) {
        case "insufficient_funds" { "Insufficient Bitcoin balance" };
        case "invalid_address" { "Invalid Bitcoin address" };
        case _ { "Unknown Bitcoin error" };
    };
};
```

## 8. Next Steps

1. **Deploy cKBTC**: Set up the cKBTC ledger canister
2. **Test Integration**: Verify Bitcoin functionality in testnet
3. **Security Audit**: Review Bitcoin integration security
4. **User Interface**: Add Bitcoin UI components
5. **Documentation**: Create user guides for Bitcoin features

## 9. Resources

- [cKBTC Documentation](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/ckbtc/)
- [Bitcoin Integration Guide](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/)
- [ICP Bitcoin API Reference](https://internetcomputer.org/docs/current/references/ic-interface-spec/#ic-bitcoin-api)

## 10. Support

For issues with Bitcoin integration:
- Check the [ICP Forum](https://forum.dfinity.org/)
- Review [GitHub Issues](https://github.com/dfinity/ic/issues)
- Contact the ICP team for technical support 