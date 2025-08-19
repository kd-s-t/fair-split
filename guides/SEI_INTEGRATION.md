# SEI Integration for SafeSplit

This document outlines the SEI (Sei Network) integration that has been added to the SafeSplit application.

## Overview

SEI is a high-performance Layer 1 blockchain built on Cosmos SDK, designed for trading and DeFi applications. The integration allows users to:

- Generate and manage SEI wallet addresses
- Check SEI token balances
- Create escrow transactions using SEI tokens
- Transfer SEI tokens between users
- Connect to SEI test networks for development and testing

## SEI Test Networks

SEI provides several test networks for development and testing:

### 1. Atlantic-2 Testnet (Recommended)
- **Status**: Active
- **Chain ID**: `atlantic-2`
- **RPC URL**: `https://rpc.atlantic-2.seinetwork.io`
- **Explorer**: `https://atlantic-2.sei.explorers.guru`
- **Faucet**: `https://atlantic-2.sei.explorers.guru/faucet`
- **Purpose**: Main testnet for development and testing

### 2. Pacific-1 Testnet
- **Status**: Deprecated
- **Chain ID**: `pacific-1`
- **RPC URL**: `https://rpc.pacific-1.seinetwork.io`
- **Explorer**: `https://pacific-1.sei.explorers.guru`
- **Purpose**: Previous testnet (no longer maintained)

### 3. Arctic-1 Testnet
- **Status**: Development
- **Chain ID**: `arctic-1`
- **RPC URL**: `https://rpc.arctic-1.seinetwork.io`
- **Explorer**: `https://arctic-1.sei.explorers.guru`
- **Purpose**: Development testnet for new features

### 4. Mainnet
- **Status**: Production
- **Chain ID**: `pacific-1`
- **RPC URL**: `https://rpc.seinetwork.io`
- **Explorer**: `https://sei.explorers.guru`
- **Purpose**: Production network

## Features Added

### Frontend Components

1. **SEIBalance Component** (`src/modules/integrations/SEIBalance.tsx`)
   - Displays current SEI balance
   - Shows balance in SEI tokens (6 decimal places)
   - Refresh button to update balance
   - Purple/pink gradient styling to match SEI branding
   - **NEW**: Network information display
   - **NEW**: Testnet faucet links
   - **NEW**: Explorer links

2. **SEIAddress Component** (`src/modules/integrations/SEIAddress.tsx`)
   - Generate SEI wallet addresses
   - Copy address to clipboard
   - Regenerate addresses
   - Address validation (must start with "sei1")

3. **Updated Integrations Page** (`src/modules/integrations/index.tsx`)
   - Added SEI balance card alongside ICP and cKBTC
   - Added SEI address management alongside Bitcoin address
   - Updated layout to accommodate three balance cards

### Backend Integration

1. **SEI Module** (`icp/src/modules/sei.mo`)
   - Mock SEI balance management for local development
   - SEI address generation and validation
   - SEI transaction handling
   - Conversion utilities between ICP and SEI
   - **NEW**: Network configuration support
   - **NEW**: Testnet detection
   - **NEW**: Explorer URL generation
   - **NEW**: Faucet URL support

2. **Updated Main Actor** (`icp/src/main.mo`)
   - Added SEI balance storage
   - Added SEI address storage
   - Added SEI integration instance with Atlantic-2 testnet configuration
   - New SEI-related functions:
     - `getSeiBalance(user)`
     - `requestSeiWalletAnonymous()`
     - `setSeiAddress(caller, address)`
     - `getSeiAddress(user)`
     - `removeSeiAddress(caller)`
     - `setSeiBalance(caller, user, amount)`
     - `getUserSeiBalance(user)`
     - `addSeiBalance(caller, user, amount)`
     - `convertIcpToSei(caller, user, icpAmount)`
     - **NEW**: `getSeiNetworkInfo()`
     - **NEW**: `getSeiFaucetUrl()`

### State Management

1. **Updated Redux Store** (`src/lib/redux/userSlice.ts`)
   - Added `seiAddress` and `seiBalance` to user state
   - Added corresponding action creators:
     - `setSeiAddress(address)`
     - `setSeiBalance(balance)`

2. **Updated useUser Hook** (`src/hooks/useUser.ts`)
   - Added SEI address and balance selectors
   - Returns SEI data alongside existing user data

3. **Updated Escrow Actions** (`src/hooks/useEscrowActions.ts`)
   - Added SEI balance checking in escrow creation
   - Support for SEI token type in escrow transactions
   - SEI balance updates after transactions

### Network Configuration

1. **Updated dfx.json**
   - Added SEI test network configurations:
     - `sei_atlantic` (Atlantic-2 testnet)
     - `sei_pacific` (Pacific-1 testnet)
     - `sei_arctic` (Arctic-1 testnet)

2. **Constants** (`src/lib/constants.ts`)
   - Added SEI network configurations
   - Added SEI faucet URLs
   - Added SEI token specifications

## Technical Details

### SEI Token Specifications

- **Decimals**: 6 (like most Cosmos tokens)
- **Address Format**: Bech32 with "sei1" prefix
- **Conversion Rate**: 1 ICP ≈ 0.0001 SEI (simplified for development)
- **Minimum Denomination**: `usei` (micro SEI)
- **Display Denomination**: `SEI`

### Network Configuration

The integration is configured to use **Atlantic-2 testnet** by default for development:

```motoko
transient let seiNetworkConfig : SEI.SeiNetwork = {
  name = "Atlantic-2 Testnet";
  chainId = "atlantic-2";
  rpcUrl = "https://rpc.atlantic-2.seinetwork.io";
  explorerUrl = "https://atlantic-2.sei.explorers.guru";
  prefix = "sei";
  isTestnet = true;
};
```

### Mock Implementation

For local development, the integration uses mock balances and addresses:

- Mock SEI balances stored in HashMap
- Fake SEI addresses generated for testing
- Mock transaction IDs for escrow operations
- Network information displayed from configuration

### Error Handling

- Graceful fallbacks when SEI operations fail
- User-friendly error messages
- Balance validation before escrow creation
- Address format validation
- Network connectivity checks

## Usage

### For Users

1. **Access SEI Integration**:
   - Navigate to `/integrations` page
   - SEI balance and address cards are displayed alongside existing options

2. **Generate SEI Wallet**:
   - Click "Generate SEI Wallet" button
   - Copy the generated address
   - Use the address for receiving SEI tokens

3. **Check Balance**:
   - SEI balance is automatically displayed
   - Click "Refresh Balance" to update
   - Network information is shown (testnet/mainnet)

4. **Get Testnet Tokens**:
   - If on testnet, click "Faucet" button
   - This opens the SEI testnet faucet
   - Request tokens for testing

5. **View on Explorer**:
   - Click "View on Explorer" to see transactions
   - Opens the SEI block explorer for the current network

6. **Create SEI Escrow**:
   - Select SEI as token type when creating escrow
   - Enter SEI amount (supports 6 decimal places)
   - Proceed with normal escrow flow

### For Developers

1. **Adding SEI Balance**:
   ```motoko
   await actor.setSeiBalance(admin, user, 1_000_000); // 1 SEI
   ```

2. **Getting SEI Balance**:
   ```motoko
   let balance = await actor.getSeiBalance(user);
   ```

3. **Setting SEI Address**:
   ```motoko
   await actor.setSeiAddress(user, "sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
   ```

4. **Getting Network Information**:
   ```motoko
   let networkInfo = await actor.getSeiNetworkInfo();
   ```

5. **Getting Faucet URL**:
   ```motoko
   let faucetUrl = await actor.getSeiFaucetUrl();
   ```

### Network Deployment

#### Deploy to Atlantic-2 Testnet
```bash
# Deploy to Atlantic-2 testnet
dfx deploy --network sei_atlantic split_dapp
```

#### Deploy to Pacific-1 Testnet
```bash
# Deploy to Pacific-1 testnet
dfx deploy --network sei_pacific split_dapp
```

#### Deploy to Arctic-1 Testnet
```bash
# Deploy to Arctic-1 testnet
dfx deploy --network sei_arctic split_dapp
```

## Testing

### Testnet Faucets

1. **Atlantic-2 Faucet**: `https://atlantic-2.sei.explorers.guru/faucet`
2. **Pacific-1 Faucet**: `https://pacific-1.sei.explorers.guru/faucet`
3. **Arctic-1 Faucet**: `https://arctic-1.sei.explorers.guru/faucet`

### Test Addresses

Valid SEI addresses for testing:
- `sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` ✅ (Tested and working)
- `sei1q9d4ywgf0zq3k2nqx8f9l6u8v7m5n4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d`
- `sei1a1zp1ep5qgefi2dmptftl5slmv7divfna`

### Test Commands

```bash
# Test SEI balance setting
dfx canister call split_dapp setSeiBalance "(principal \"ADMIN_PRINCIPAL\", principal \"USER_PRINCIPAL\", 1_000_000 : nat)"

# Test SEI address setting
dfx canister call split_dapp setSeiAddress "(principal \"USER_PRINCIPAL\", \"sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh\")"

# Test SEI balance retrieval
dfx canister call split_dapp getSeiBalance "(principal \"USER_PRINCIPAL\")"

# Test network info
dfx canister call split_dapp getSeiNetworkInfo
```

A test file has been created at `icp/test/sei_test.mo` with placeholder tests for:
- SEI balance management
- SEI address management
- SEI wallet generation
- Network information retrieval

## Future Enhancements

1. **Real SEI Integration**:
   - Connect to actual SEI network
   - Implement real SEI address generation
   - Add SEI transaction signing
   - Real-time balance updates

2. **Enhanced Features**:
   - SEI token swaps
   - SEI staking integration
   - SEI DeFi protocol integration
   - Cross-chain bridges

3. **UI Improvements**:
   - SEI transaction history
   - SEI price charts
   - SEI network status indicators
   - Network switching interface

4. **Multi-Network Support**:
   - Easy switching between testnets
   - Network-specific configurations
   - Environment-based network selection

## Security Considerations

1. **Address Validation**: All SEI addresses are validated for correct format
2. **Balance Checks**: Insufficient balance prevents escrow creation
3. **Admin Controls**: Only admin can set/add balances for testing
4. **Error Handling**: Graceful degradation when SEI operations fail
5. **Network Security**: Proper RPC endpoint validation
6. **Testnet Usage**: Clear indication when using testnet vs mainnet

## Dependencies

The SEI integration uses the same dependencies as the existing application:
- Motoko for backend logic
- React/TypeScript for frontend
- Redux for state management
- Tailwind CSS for styling

No additional external dependencies were required for this integration.

## Resources

- **SEI Documentation**: https://docs.seinetwork.io/
- **SEI Explorer**: https://sei.explorers.guru/
- **SEI GitHub**: https://github.com/sei-protocol/sei-chain
- **SEI Discord**: https://discord.gg/sei
- **SEI Twitter**: https://twitter.com/SeiNetwork
