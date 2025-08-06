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