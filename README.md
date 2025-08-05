<!-- <div align="center"> 
	<a href="https://dorahacks.io/hackathon/wchl25-qualification-round/buidl" target="_blank">
		<img src="./event.jpg" width="100%" /> 
	</a>
</div> -->

<div align="center"> 
	<img src="./public/githublogo.png" width="20%" />
	by:  
	<a href="https://dashboard.dorahacks.io/org/3872" target="_blank">
		<img src="./public/team.png" width="5%" /> 
	</a>
</div>

# SplitSafe
A decentralized, trustless Bitcoin escrow and payout system using Internet Computer (ICP) and modern web technologies. It enables secure cross-chain transactions with native Bitcoin integration using cKBTC (Chain-Key Bitcoin), no bridges or wrapped tokens required.

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
	<img src="https://img.shields.io/badge/Motoko-3B00B9?style=for-the-badge" /> 
	<img src="https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white" /> 
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

## Quick Start

### Prerequisites
- Node.js 20.13.1 (use `nvm use` to switch to the correct version)
- Docker (for containerized deployment)
- dfx (for ICP canister deployment)

### Deploy Canisters
```bash
chmod +x scripts/nuke.sh
./scripts/nuke.sh
```

### Run Frontend Development Server
```bash
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

### Staging Deployment with Docker
```bash
# Start staging environment
docker compose -f docker/stage/docker-compose.yml up --build

# Stop the containers
docker compose -f docker/stage/docker-compose.yml down
```

## AWS Infrastructure with Terraform

### Deploy EC2 Instance
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Destroy Infrastructure
```bash
cd terraform
terraform destroy
```

### Terraform Outputs
- `public_ip` - EC2 instance public IP
- `instance_id` - EC2 instance ID


## Configuration

### Environment Variables
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

### Principals
After setting up, a `principals.json` will be generated with sample users for testing.

## Authors

- [@kenn](https://www.linkedin.com/in/kdst/)
- [@don](https://www.linkedin.com/in/carl-john-don-sebial-882430187/)
- [@peter](https://www.linkedin.com/in/petertibon/)
