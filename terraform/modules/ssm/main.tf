# SSM Parameter Store Module
# Handles all environment variables and configuration for SplitSafe application
# 
# This module manages:
# - Application domain configuration
# - Internet Computer (ICP) settings
# - Bitcoin blockchain service URLs
# - Environment-specific variables

locals {
  parameter_prefix = "/splitsafe/${var.environment}"
}

# =============================================================================
# APPLICATION DOMAIN CONFIGURATION
# =============================================================================

resource "aws_ssm_parameter" "next_public_domain" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_DOMAIN"
  type  = "String"
  value = "thesplitsafe.com"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

resource "aws_ssm_parameter" "next_public_development_domain" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_DEVELOPMENT_DOMAIN"
  type  = "String"
  value = "dev.thesplitsafe.com"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# =============================================================================
# INTERNET COMPUTER (ICP) CONFIGURATION
# =============================================================================

resource "aws_ssm_parameter" "next_public_canister_id" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_CANISTER_ID_SPLIT_DAPP"
  type  = "String"
  value = "uxrrr-q7777-77774-qaaaq-cai"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

resource "aws_ssm_parameter" "next_public_dfx_host" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_DFX_HOST"
  type  = "String"
  value = "http://54.164.242.192:4943"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# =============================================================================
# BITCOIN BLOCKCHAIN SERVICES
# =============================================================================

resource "aws_ssm_parameter" "next_public_blockstream_url" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_BLOCKSTREAM_URL"
  type  = "String"
  value = "https://blockstream.info"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

resource "aws_ssm_parameter" "next_public_mempool_url" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_MEMPOOL_URL"
  type  = "String"
  value = "https://mempool.space"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# =============================================================================
# ICP DASHBOARD AND EXPLORER SERVICES
# =============================================================================

resource "aws_ssm_parameter" "next_public_icp_dashboard_url" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_ICP_DASHBOARD_URL"
  type  = "String"
  value = "https://dashboard.internetcomputer.org"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

resource "aws_ssm_parameter" "next_public_icscan_url" {
  name  = "${local.parameter_prefix}/NEXT_PUBLIC_ICSCAN_URL"
  type  = "String"
  value = "https://icscan.io"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
}

# =============================================================================
# APPLICATION ENVIRONMENT
# =============================================================================

resource "aws_ssm_parameter" "node_env" {
  name  = "${local.parameter_prefix}/NODE_ENV"
  type  = "String"
  value = "development"
  tags = {
    Environment = var.environment
    Project     = "SplitSafe"
  }
} 