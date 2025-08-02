# SSM Parameter Store Module
# Handles all environment variables and configuration

locals {
  parameter_prefix = "/splitsafe/${var.environment}"
}

resource "aws_ssm_parameter" "dfx_host" {
  name  = "${local.parameter_prefix}/dfx-host"
  type  = "String"
  value = var.environment == "production" ? "https://ic0.app" : "https://ic0.app"
}

resource "aws_ssm_parameter" "canister_id" {
  name  = "${local.parameter_prefix}/canister-id"
  type  = "String"
  value = var.canister_id
}

resource "aws_ssm_parameter" "node_env" {
  name  = "${local.parameter_prefix}/node-env"
  type  = "String"
  value = var.environment == "production" ? "production" : "staging"
}

resource "aws_ssm_parameter" "port" {
  name  = "${local.parameter_prefix}/port"
  type  = "String"
  value = "3000"
}

resource "aws_ssm_parameter" "blockstream_url" {
  name  = "${local.parameter_prefix}/blockstream-url"
  type  = "String"
  value = var.blockstream_url
}

resource "aws_ssm_parameter" "mempool_url" {
  name  = "${local.parameter_prefix}/mempool-url"
  type  = "String"
  value = var.mempool_url
}

resource "aws_ssm_parameter" "icp_dashboard_url" {
  name  = "${local.parameter_prefix}/icp-dashboard-url"
  type  = "String"
  value = var.icp_dashboard_url
}

resource "aws_ssm_parameter" "icscan_url" {
  name  = "${local.parameter_prefix}/icscan-url"
  type  = "String"
  value = var.icscan_url
} 