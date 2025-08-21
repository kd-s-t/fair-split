# 🚀 Mainnet Deployment Guide

## Overview
This guide explains how to switch SafeSplit from testnet to mainnet deployment.

## 🔄 Network Switching Strategy

### Current Local Configuration
- **SEI**: Atlantic-2 testnet
- **cKBTC**: Local deployment
- **ICP**: Local replica

### Target Mainnet Configuration
- **SEI**: Pacific-1 mainnet
- **cKBTC**: Official mainnet canisters
- **ICP**: Internet Computer mainnet

## 📋 Pre-Mainnet Checklist

### 1. Environment Variables
Update your `.env.local` file:

```bash
# SEI Mainnet Configuration
NEXT_PUBLIC_SEI_NETWORK=pacific-1
NEXT_PUBLIC_SEI_RPC_URL=https://rpc.pacific-1.seinetwork.io
NEXT_PUBLIC_SEI_EXPLORER_URL=https://sei.explorers.guru
NEXT_PUBLIC_SEI_CHAIN_ID=pacific-1
NEXT_PUBLIC_SEI_PREFIX=sei

# cKBTC Mainnet Canisters
NEXT_PUBLIC_CKBTC_LEDGER_ID=mxzaz-hqaaa-aaaar-qaada-cai
NEXT_PUBLIC_CKBTC_MINTER_ID=mqygn-kiaaa-aaaar-qaadq-cai

# ICP Mainnet
NEXT_PUBLIC_DFX_HOST=https://icp0.io
```

### 2. Backend Configuration
The backend automatically adapts based on environment variables:

```motoko
// In icp/src/main.mo - SEI Network Configuration
transient let seiNetworkConfig : SEI.SeiNetwork = {
  name = "Pacific-1 Mainnet";  // Changed from "Atlantic-2 Testnet"
  chainId = "pacific-1";       // Changed from "atlantic-2"
  rpcUrl = "https://rpc.pacific-1.seinetwork.io";
  explorerUrl = "https://sei.explorers.guru";
  prefix = "sei";
  isTestnet = false;           // Changed from true
};
```

### 3. Deployment Commands

#### Local Testnet → Mainnet
```bash
# 1. Build for mainnet
dfx build --network ic

# 2. Deploy to mainnet
dfx deploy --network ic

# 3. Set custom domain (if you have safesplit.com)
dfx canister --network ic update-settings split_dapp --set-controller $(dfx identity get-principal)
```

#### Environment-Specific Deployment Scripts
```bash
# Testnet deployment
./scripts/deploy-testnet.sh

# Mainnet deployment  
./scripts/deploy-mainnet.sh
```

## 🔧 Configuration Files

### dfx.json Networks
```json
{
  "networks": {
    "local": {
      "bind": "localhost:4943",
      "type": "ephemeral"
    },
    "ic": {
      "type": "persistent",
      "providers": ["https://icp0.io"]
    },
    "sei_atlantic": {
      "type": "persistent", 
      "providers": ["https://rpc.atlantic-2.seinetwork.io"]
    },
    "sei_pacific": {
      "type": "persistent",
      "providers": ["https://rpc.pacific-1.seinetwork.io"]
    }
  }
}
```

### Frontend Network Detection
The frontend automatically detects the network:

```typescript
// src/lib/constants.ts
export const NETWORK_CONFIG = {
  testnet: {
    sei: {
      name: "Atlantic-2 Testnet",
      rpcUrl: "https://rpc.atlantic-2.seinetwork.io",
      chainId: "atlantic-2"
    },
    ckbtc: {
      ledgerId: "local-generated-id",
      minterId: "local-generated-id"
    }
  },
  mainnet: {
    sei: {
      name: "Pacific-1 Mainnet", 
      rpcUrl: "https://rpc.pacific-1.seinetwork.io",
      chainId: "pacific-1"
    },
    ckbtc: {
      ledgerId: "mxzaz-hqaaa-aaaar-qaada-cai",
      minterId: "mqygn-kiaaa-aaaar-qaadq-cai"
    }
  }
};
```

## 💰 Cost Considerations

### ICP Costs (Mainnet)
- **Canister deployment**: ~0.5 ICP
- **Monthly hosting**: ~0.1-0.3 ICP
- **Custom domain**: 2 ICP (one-time)
- **Total for 1 month**: ~2.5-3 ICP

### Real Asset Risks
- **Bitcoin**: Real BTC transfers
- **SEI**: Real SEI token transfers
- **ICP**: Real ICP cycles consumption

## 🛡️ Security Considerations

### Before Mainnet
1. **Audit all smart contracts**
2. **Test with small amounts**
3. **Verify all integrations**
4. **Set up monitoring**

### Mainnet Safeguards
1. **Rate limiting**
2. **Transaction size limits**
3. **Emergency pause functionality**
4. **Multi-sig admin controls**

## 🔄 Migration Process

### Step 1: Local Validation
```bash
# Ensure everything works locally
dfx deploy --network local
npm run test
```

### Step 2: Staging Deployment
```bash
# Deploy to playground for testing
dfx deploy --playground
```

### Step 3: Mainnet Deployment
```bash
# Deploy to mainnet
dfx deploy --network ic
```

### Step 4: Domain Configuration
```bash
# Configure custom domain
dfx canister --network ic update-settings split_dapp --set-controller $(dfx identity get-principal)
```

## 📊 Monitoring

### Key Metrics
- **Transaction success rate**
- **Gas costs**
- **User adoption**
- **Error rates**

### Alerts
- **Failed transactions**
- **High gas costs**
- **System errors**
- **Balance thresholds**

## 🚨 Emergency Procedures

### Rollback Plan
1. **Pause new transactions**
2. **Drain remaining funds**
3. **Redeploy previous version**
4. **Notify users**

### Emergency Contacts
- **Technical support**
- **Legal team**
- **User support**

## 📝 Post-Deployment Checklist

- [ ] Verify all integrations work
- [ ] Test with real assets (small amounts)
- [ ] Monitor transaction logs
- [ ] Set up alerts
- [ ] Document any issues
- [ ] Plan for scaling

## 🔗 Useful Links

- [ICP Mainnet](https://icp0.io)
- [SEI Pacific-1](https://rpc.pacific-1.seinetwork.io)
- [cKBTC Mainnet](https://dashboard.internetcomputer.org/ckbtc)
- [Custom Domain Setup](https://internetcomputer.org/docs/current/developer-docs/integrations/domain-name/custom-domain-name)

---

**⚠️ Important**: Always test thoroughly on testnet before deploying to mainnet. Real assets are at stake!
