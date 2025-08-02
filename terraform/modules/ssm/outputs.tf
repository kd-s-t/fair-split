output "canister_id_parameter" {
  description = "SSM parameter for canister ID"
  value       = aws_ssm_parameter.canister_id.name
}

output "dfx_host_parameter" {
  description = "SSM parameter for DFX host"
  value       = aws_ssm_parameter.dfx_host.name
}

output "parameter_prefix" {
  description = "Parameter prefix for this environment"
  value       = local.parameter_prefix
} 