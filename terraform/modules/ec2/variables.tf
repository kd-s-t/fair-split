variable "ami_id" {
  description = "AMI ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
}

variable "key_pair_name" {
  description = "Name of the SSH key pair"
  type        = string
}

variable "security_group_id" {
  description = "ID of the security group"
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

variable "parameter_prefix" {
  description = "SSM parameter prefix for this environment"
  type        = string
} 