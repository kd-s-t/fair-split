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