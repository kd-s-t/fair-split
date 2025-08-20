<div align="center"> 
	<a href="https://dorahacks.io/hackathon/wchl25-qualification-round/buidl" target="_blank">
		<img src="./wchl.jpg" width="100%" /> 
	</a>
</div>


<div align="center"> 
	<img src="./public/githublogo.png" width="20%" />
	by:  
	<a href="https://dashboard.dorahacks.io/org/3872" target="_blank">
		<img src="./public/team.png" width="5%" /> 
	</a>
</div>

# SplitSafe
A decentralized, trustless multi-chain escrow and split payment system using Internet Computer (ICP) and SEI Network with modern web technologies. It utilizes ICP's native Bitcoin integration via cKBTC (Chain-Key Bitcoin) and SEI's high-performance blockchain to facilitate secure, programmable, and decentralized multi-party payment flows, eliminating the need for bridges, wrapped tokens, or intermediaries.

Senders can lock cKBTC or SEI tokens into escrow, define payout rules, and automatically release funds once the specified conditions are met. Recipients receive tokens in predefined split proportions, which can be converted to native Bitcoin through ICP's Bitcoin integration or used directly on SEI Network, all managed by canister logic on the Internet Computer.

**Multi-Chain Support:**
- **Bitcoin (cKBTC)**: Native Bitcoin integration via ICP
- **SEI Network**: High-performance Layer 1 blockchain for fast transactions
- **Testnet Ready**: Atlantic-2 testnet integration for safe development

Use cases for SplitSafe include freelance payments, DAO treasuries, milestone-based bounties, marketplace transactions, gaming payments, DeFi integrations, and any scenarios requiring trust-minimized multi-chain settlements.

<div align="center"> 
	<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white" /> 
	<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /> 
	<img src="https://img.shields.io/badge/ShadCN UI-000000?style=for-the-badge&logo=vercel&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Lucide Icons-000000?style=for-the-badge&logo=lucide&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Framer Motion-EF008F?style=for-the-badge&logo=framer&logoColor=white" /> 
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> 
	<img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" /> 
	<img src="https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white" /> 
</div>

<div align="center"> 
  <img src="https://img.shields.io/badge/ICP-000000?style=for-the-badge&logo=internet-computer&logoColor=white" />
  <img src="https://img.shields.io/badge/bitcoin-2F3134?style=for-the-badge&logo=bitcoin&logoColor=white" />
  <img src="https://img.shields.io/badge/SEI-000000?style=for-the-badge&logo=sei&logoColor=white" />
  <img src="https://img.shields.io/badge/SEI_Network-000000?style=for-the-badge&logo=https://avatars.githubusercontent.com/u/101956417?s=200&v=4" />
	<img src="https://img.shields.io/badge/Motoko-3B00B9?style=for-the-badge" /> 
</div>

<div align="center"> 
	<img src="https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white" /> 
	<img src="https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white" /> 
</div>

<div align="center"> 
	<img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" /> 
	<img src="https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white" /> 
	<img src="https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white" /> 
</div>

## 🎥 Demo Videos

### Qualification Round Demo
Watch our complete demo showcasing SafeSplit's trustless Bitcoin escrow functionality:

[![SafeSplit Demo - Qualification Round](https://img.shields.io/badge/Watch_Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.loom.com/share/6048358153c04dae899d0b2902f2fd9e?sid=d9b720fa-452b-4e3c-903b-1cf0f0856a20)

**Features demonstrated:**
- ✅ Complete escrow lifecycle (create → approve → release)
- ✅ Multi-chain support (Bitcoin cKBTC + SEI Network)
- ✅ Sender cancellation with full refund
- ✅ Recipient decline with reputation penalty
- ✅ Real-time balance management
- ✅ Transaction history and status tracking
- ✅ SEI testnet integration with faucet
- ✅ Modern, intuitive user interface

### National Round Demo
**Coming Soon** - Stay tuned for our enhanced demo showcasing advanced features and improvements!

## Quick Start

### Prerequisites
- Node.js 20.13.1 (use `nvm use` to switch to the correct version)
- Docker (for containerized deployment)
- dfx (for ICP canister deployment)

### SEI Testnet Integration
SafeSplit includes full SEI Network integration with Atlantic-2 testnet support:

- **Testnet RPC**: https://rpc.atlantic-2.seinetwork.io
- **Testnet Explorer**: https://atlantic-2.sei.explorers.guru
- **Testnet Faucet**: https://atlantic-2.sei.explorers.guru/faucet
- **Chain ID**: `atlantic-2`

Get free test SEI tokens from the faucet to test escrow functionality without using real funds.


### Run Frontend Development Server
```bash
npm install -g npm@11.5.2
# Switch to correct Node version
nvm use

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:3000

## Docker Deployment

### Local Development with Docker
```bash
# Start local development environment
docker compose -f docker/local/docker-compose.yml up --build

# Stop the containers
docker compose -f docker/local/docker-compose.yml down
```

## Testing

### SEI Testnet Testing
Test our SEI integration with the following commands:

```bash
# Test SEI network info
dfx canister call split_dapp getSeiNetworkInfo

# Test SEI balance query
dfx canister call split_dapp getSeiBalance '(principal "2vxsx-fae")'

# Test SEI wallet generation
dfx canister call split_dapp requestSeiWalletAnonymous

# Test SEI faucet URL
dfx canister call split_dapp getSeiFaucetUrl

# Run complete SEI test suite
./scripts/test-sei-testnet.sh
```

### Withdrawal Testing
The application includes comprehensive withdrawal functionality for both ICP, ckBTC, and SEI. You can test withdrawals using the following sample addresses:

#### Valid Bitcoin Addresses for Testing:
- `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh` ✅ (Tested and working)
- `bc1q9d4ywgf0zq3k2nqx8f9l6u8v7m5n4p3q2r1s0t9u8v7w6x5y4z3a2b1c0d`
- `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (Legacy format)
- `3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy` (P2SH format)

#### SEI Testnet Testing:
- **Test SEI Balance**: 5,000,000 usei (5 SEI) available for testing
- **SEI Address Format**: `sei1xy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`
- **Testnet Faucet**: Get free SEI tokens for testing

**Note**: These addresses work because the system uses mock balances for development. When deploying to mainnet, real address validation and actual transfer mechanisms will be used.

## Authors

- [@kenn](https://www.linkedin.com/in/kdst/)
- [@don](https://www.linkedin.com/in/carl-john-don-sebial-882430187/)
- [@peter](https://www.linkedin.com/in/petertibon/)
