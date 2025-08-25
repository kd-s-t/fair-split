variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "public_key_path" {
  description = "Path to the public SSH key"
  type        = string
}

variable "private_key_path" {
  description = "Path to the private SSH key"
  type        = string
}

variable "repo_url" {
  description = "GitHub repository URL for the application"
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
}

variable "key_pair_name" {
  description = "Name of the AWS key pair from security module"
  type        = string
}

variable "security_group_id" {
  description = "ID of the security group from security module"
  type        = string
}

variable "private_key_content" {
  description = "Private key content from security module"
  type        = string
  sensitive   = true
}

variable "instance_profile_name" {
  description = "Name of the IAM instance profile from IAM module"
  type        = string
} 

# Enables provisioning of a local Internet Computer (dfx) replica
# on the EC2 instance using a Docker container. Intended to be set
# to true only for the dedicated DFX instance (e.g., environment "*-dfx").
variable "enable_dfx" {
  description = "Whether to start a Dockerized dfx replica on this instance"
  type        = bool
  default     = false
}

# Domain that Caddy should obtain a certificate for and serve
variable "dfx_domain" {
  description = "Public domain that will serve HTTPS and reverse-proxy to dfx (e.g., thesplitsafe.com)"
  type        = string
}

# SSL Configuration
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

variable "enable_ssl" {
  description = "Whether to enable SSL certificate generation with Let's Encrypt"
  type        = bool
  default     = false
}