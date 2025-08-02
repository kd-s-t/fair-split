terraform {
  required_version = ">= 1.4.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# SSM Parameter Store Module
module "ssm" {
  source = "./modules/ssm"
  
  canister_id      = var.canister_id
  environment      = var.environment
  blockstream_url  = var.blockstream_url
  mempool_url      = var.mempool_url
  icp_dashboard_url = var.icp_dashboard_url
  icscan_url       = var.icscan_url
}

# Security Module
module "security" {
  source = "./modules/security"
  
  public_key_path = var.public_key_path
  environment     = var.environment
}

# EC2 Module
module "ec2" {
  source = "./modules/ec2"
  
  ami_id            = var.ami_id
  instance_type     = var.instance_type
  key_pair_name     = module.security.key_pair_name
  security_group_id = module.security.security_group_id
  private_key_path  = var.private_key_path
  repo_url          = var.repo_url
  aws_region        = var.aws_region
  environment       = var.environment
  parameter_prefix  = module.ssm.parameter_prefix
  
  depends_on = [module.ssm, module.security]
} 