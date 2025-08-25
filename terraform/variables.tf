variable "aws_region" {}
variable "ami_id" {}
variable "instance_type" {}
variable "public_key_path" {}
variable "private_key_path" {}
variable "repo_url" {}
variable "environment" {
  description = "Environment (production)"
  type        = string
  default     = "production"
}

# Domain variable (not used for IC mainnet deployment)
variable "dfx_domain" {
  description = "Domain variable (kept for compatibility, not used for IC mainnet)"
  type        = string
  default     = "localhost"
}

# Environment URLs
variable "blockstream_url" {
  description = "Blockstream API URL"
  type        = string
  default     = "https://blockstream.info"
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

# SSL Configuration
variable "enable_ssl" {
  description = "Whether to enable SSL certificate generation with Let's Encrypt"
  type        = bool
  default     = false
}

variable "ssl_domains" {
  description = "List of domains for SSL certificates (e.g., ['thesplitsafe.com', 'www.thesplitsafe.com'])"
  type        = list(string)
  default     = []
}

variable "ssl_email" {
  description = "Email address for Let's Encrypt SSL certificate notifications"
  type        = string
  default     = "admin@thesplitsafe.com"
} 