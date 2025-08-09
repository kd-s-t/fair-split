terraform {
  required_version = ">= 1.0"
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

# Generate house key
resource "random_password" "house_key" {
  length  = 32
  special = true
  upper   = true
  lower   = true
  numeric = true
}

module "security" {
  source = "./modules/security"
  
  environment = var.environment
}

module "iam" {
  source = "./modules/iam"
  
  environment = var.environment
}

module "ssm" {
  source = "./modules/ssm"
  
  environment = var.environment
}

module "ec2" {
  source = "./modules/ec2"
  
  aws_region           = var.aws_region
  ami_id               = var.ami_id
  instance_type        = var.instance_type
  public_key_path      = var.public_key_path
  private_key_path     = var.private_key_path
  repo_url             = var.repo_url
  environment          = var.environment
  key_pair_name        = module.security.key_pair_name
  security_group_id    = module.security.security_group_id
  private_key_content  = module.security.private_key_content
  instance_profile_name = module.iam.ec2_instance_profile_name
}

# Additional EC2 instance dedicated to DFX (local IC network)
module "ec2_dfx" {
  source = "./modules/ec2"

  aws_region            = var.aws_region
  ami_id                = var.ami_id
  instance_type         = var.instance_type
  public_key_path       = var.public_key_path
  private_key_path      = var.private_key_path
  repo_url              = var.repo_url
  environment           = "${var.environment}-dfx"
  key_pair_name         = module.security.key_pair_name
  security_group_id     = module.security.security_group_id
  private_key_content   = module.security.private_key_content
  instance_profile_name = module.iam.ec2_instance_profile_name
  enable_dfx            = true
}

module "ecr" {
  source = "./modules/ecr"
  
  environment   = var.environment
  ec2_role_arn = module.iam.ec2_role_arn
} 