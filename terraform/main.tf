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

module "ec2" {
  source = "./modules/ec2"
  
  aws_region      = var.aws_region
  ami_id          = var.ami_id
  instance_type   = var.instance_type
  public_key_path = var.public_key_path
  private_key_path = var.private_key_path
  repo_url        = var.repo_url
  environment     = var.environment
}

module "ecr" {
  source = "./modules/ecr"
  
  environment   = var.environment
  ec2_role_arn = module.ec2.ec2_role_arn
} 