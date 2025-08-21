# SafeSplit Guides

Welcome to the SafeSplit guides directory! This folder contains comprehensive documentation for setting up, deploying, and maintaining the SafeSplit application.

## 📋 Table of Contents

### 🚀 **Deployment & Infrastructure**
- [EC2 Subdomain Setup](./EC2_SUBDOMAIN_SETUP.md) - Complete EC2 deployment with custom domain
- [Terraform Deployment](./TERRAFORM_DEPLOYMENT.md) - Infrastructure as Code with Terraform

### 🔧 **Backend & Blockchain**
- [ICP Backend](./ICP_BACKEND.md) - Internet Computer Backend Architecture
- [SEI Integration](./SEI_INTEGRATION.md) - SEI Network Integration Guide
- [Bitcoin Integration](./BITCOIN_INTEGRATION.md) - Bitcoin Integration with ICP

### 📊 **Documentation & Presentations**
- [Presentation README](./PRESENTATION_README.md) - Project presentation and overview
- [Mainnet Deployment](./MAINNET_DEPLOYMENT.md) - Mainnet deployment guide
- [Security Features](./SECURITY_FEATURES.md) - Enterprise-grade security features

### 🛠️ **Development Workflow**
- [Quick Start Guide](#-quick-start-guide)
- [Development Workflow](#-development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)

### 📚 **Resources & Support**
- [Project Structure](#project-structure)
- [External Resources](#external-resources)
- [Support & Troubleshooting](#-support--troubleshooting)
- [Contributing](#contributing)

---

## 📚 Available Guides

### 🚀 **Deployment & Infrastructure**

#### [EC2_SUBDOMAIN_SETUP.md](./EC2_SUBDOMAIN_SETUP.md)
**Complete EC2 deployment with custom domain setup**
- AWS EC2 instance deployment
- Custom domain configuration with Nginx
- SSL certificate setup
- DFX local network deployment
- Troubleshooting and monitoring

**Key Topics:**
- EC2 instance setup and configuration
- Nginx reverse proxy configuration
- Domain routing and SSL setup
- DFX deployment and management
- Log monitoring and debugging

---

#### [TERRAFORM_DEPLOYMENT.md](./TERRAFORM_DEPLOYMENT.md)
**Infrastructure as Code with Terraform**
- Modular AWS infrastructure deployment
- EC2, IAM, Security Groups, and ECR setup
- Environment variable management
- Automated infrastructure provisioning

**Key Topics:**
- Terraform module architecture
- AWS resource management
- Security group configuration
- IAM roles and policies
- Environment variable setup

---

### 🔧 **Backend & Blockchain**

#### [ICP_BACKEND.md](./ICP_BACKEND.md)
**Internet Computer Backend Architecture**
- Motoko canister development
- Cross-chain Bitcoin integration
- Escrow system implementation
- Security and fraud detection

**Key Topics:**
- ICP canister architecture
- Bitcoin integration via threshold ECDSA
- Escrow lifecycle management
- Reputation and fraud detection system
- Auto-expiry and transaction management

---

#### [SEI_INTEGRATION.md](./SEI_INTEGRATION.md)
**SEI Network Integration Guide**
- Multi-chain SEI token support
- Test network configuration
- Frontend and backend integration
- Network deployment strategies

**Key Topics:**
- SEI test networks (Atlantic-2, Pacific-1, Arctic-1)
- SEI wallet and balance management
- Testnet faucet integration
- Network switching and configuration
- SEI escrow functionality

---

### 📊 **Documentation & Presentations**

#### [PRESENTATION_README.md](./PRESENTATION_README.md)
**Project presentation and overview**
- SafeSplit project introduction
- Key features and benefits
- Technical architecture overview
- Demo and showcase information

**Key Topics:**
- Project overview and goals
- Technical architecture
- Key features demonstration
- Future roadmap

---

## 🎯 **Quick Start Guide**

### For New Developers

1. **Start with the basics:**
   - Read [PRESENTATION_README.md](./PRESENTATION_README.md) for project overview
   - Review [ICP_BACKEND.md](./ICP_BACKEND.md) for backend understanding

2. **Set up development environment:**
   - Follow [EC2_SUBDOMAIN_SETUP.md](./EC2_SUBDOMAIN_SETUP.md) for local development
   - Or use [TERRAFORM_DEPLOYMENT.md](./TERRAFORM_DEPLOYMENT.md) for cloud deployment

3. **Add blockchain integrations:**
   - Implement SEI integration using [SEI_INTEGRATION.md](./SEI_INTEGRATION.md)

### For DevOps Engineers

1. **Infrastructure setup:**
   - Use [TERRAFORM_DEPLOYMENT.md](./TERRAFORM_DEPLOYMENT.md) for automated deployment
   - Configure domains with [EC2_SUBDOMAIN_SETUP.md](./EC2_SUBDOMAIN_SETUP.md)

2. **Backend deployment:**
   - Deploy ICP canisters following [ICP_BACKEND.md](./ICP_BACKEND.md)
   - Configure blockchain integrations

### For Blockchain Developers

1. **Understand the architecture:**
   - Review [ICP_BACKEND.md](./ICP_BACKEND.md) for cross-chain integration
   - Study [SEI_INTEGRATION.md](./SEI_INTEGRATION.md) for multi-chain support

2. **Add new integrations:**
   - Follow the patterns established in SEI integration
   - Extend the backend modules as needed

## 🔗 **Related Documentation**

### Project Structure
```
safesplit/
├── guides/                    # This directory
│   ├── README.md             # This file
│   ├── EC2_SUBDOMAIN_SETUP.md
│   ├── TERRAFORM_DEPLOYMENT.md
│   ├── ICP_BACKEND.md
│   ├── SEI_INTEGRATION.md
│   └── PRESENTATION_README.md
├── icp/                      # Internet Computer backend
├── src/                      # Frontend application
├── terraform/                # Infrastructure as Code
└── scripts/                  # Deployment scripts
```

### External Resources

#### Internet Computer
- [ICP Documentation](https://internetcomputer.org/docs)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/developer-docs/build/languages/motoko/)
- [ICP Dashboard](https://dashboard.internetcomputer.org/)

#### SEI Network
- [SEI Documentation](https://docs.seinetwork.io/)
- [SEI Explorer](https://sei.explorers.guru/)
- [SEI Discord](https://discord.gg/sei)

#### Bitcoin Integration
- [Bitcoin Core Documentation](https://bitcoin.org/en/developer-documentation)
- [Blockstream API](https://blockstream.info/api/)
- [Mempool API](https://mempool.space/api)

## 🛠️ **Development Workflow**

### 1. Local Development
```bash
# Start local development
cd safesplit
npm install
npm run dev

# Start DFX for ICP local development
cd icp
dfx start --background
dfx deploy --network local
```

### 2. Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd icp
dfx canister call split_dapp_test runAllTests
```

### 3. Deployment
```bash
# Deploy to local network
dfx deploy --network local

# Deploy to mainnet
dfx deploy --network ic

# Deploy infrastructure
cd terraform
terraform apply
```

## 📝 **Contributing**

When adding new guides:

1. **Create the guide** in the `guides/` directory
2. **Update this README.md** to include the new guide
3. **Follow the naming convention**: `TOPIC_NAME.md`
4. **Include key topics** and a brief description
5. **Add cross-references** to related guides

### Guide Template
```markdown
# Guide Title

Brief description of what this guide covers.

## Key Topics
- Topic 1
- Topic 2
- Topic 3

## Prerequisites
- Requirement 1
- Requirement 2

## Quick Start
```bash
# Quick start commands
```

## Detailed Instructions
[Detailed content here]

## Related Guides
- [Related Guide 1](./RELATED_GUIDE_1.md)
- [Related Guide 2](./RELATED_GUIDE_2.md)
```

## 🆘 **Support & Troubleshooting**

### Common Issues

1. **DFX Connection Issues**
   - Check if DFX is running: `dfx ping local`
   - Restart DFX: `dfx stop && dfx start --background`

2. **Deployment Failures**
   - Check logs: `dfx canister call split_dapp getLogs`
   - Verify canister status: `dfx canister status split_dapp`

3. **Network Issues**
   - Verify network configuration in `dfx.json`
   - Check firewall and security group settings

### Getting Help

- **GitHub Issues**: Create an issue in the repository
- **Discord**: Join the SEI Discord for community support
- **Documentation**: Check the official ICP and SEI documentation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: SafeSplit Development Team
