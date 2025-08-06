variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
}

variable "aws_account_id" {
  description = "AWS Account ID for resource ARNs"
  type        = string
  default     = "456783087661"
} 