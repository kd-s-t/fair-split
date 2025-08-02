variable "public_key_path" {
  description = "Path to the public SSH key"
  type        = string
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
} 