variable "aws_region" {}
variable "ami_id" {}
variable "instance_type" {}
variable "public_key_path" {}
variable "private_key_path" {}
variable "repo_url" {}
variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
}

# Domain used to terminate TLS and proxy to the local dfx replica via Caddy
variable "dfx_domain" {
  description = "Public domain that will serve HTTPS and reverse-proxy to dfx (e.g., thesplitsafe.com)"
  type        = string
  default     = "thesplitsafe.com"
}

# Environment URLs
variable "blockstream_url" {
  description = "Blockstream API URL"
  type        = string
  default     = "https://blockstream.info"
}

variable "mempool_url" {
  description = "Mempool API URL"
  type        = string
  default     = "https://mempool.space"
}

variable "icp_dashboard_url" {
  description = "ICP Dashboard URL"
  type        = string
  default     = "https://dashboard.internetcomputer.org"
}

variable "icscan_url" {
  description = "ICScan URL"
  type        = string
  default     = "https://icscan.io"
} 