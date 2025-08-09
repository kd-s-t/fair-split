variable "canister_id" {
  description = "ICP canister ID for the SplitSafe application"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment (staging, production)"
  type        = string
  default     = "staging"
}

variable "blockstream_url" {
  description = "Blockstream URL for Bitcoin transactions"
  type        = string
  default     = "https://blockstream.info"
}

variable "mempool_url" {
  description = "Mempool URL for Bitcoin transactions"
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

variable "dfx_host" {
  description = "DFX replica host URL (e.g., https://thesplitsafe.com)"
  type        = string
  default     = ""
}