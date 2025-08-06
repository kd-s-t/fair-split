output "parameter_prefix" {
  description = "Parameter prefix for this environment"
  value       = local.parameter_prefix
}

output "next_public_domain_parameter" {
  description = "SSM parameter for Next.js public domain"
  value       = aws_ssm_parameter.next_public_domain.name
}

output "next_public_development_domain_parameter" {
  description = "SSM parameter for Next.js development domain"
  value       = aws_ssm_parameter.next_public_development_domain.name
}

output "next_public_canister_id_parameter" {
  description = "SSM parameter for Next.js public canister ID"
  value       = aws_ssm_parameter.next_public_canister_id.name
}

output "next_public_dfx_host_parameter" {
  description = "SSM parameter for Next.js public DFX host"
  value       = aws_ssm_parameter.next_public_dfx_host.name
}

output "node_env_parameter" {
  description = "SSM parameter for Node.js environment"
  value       = aws_ssm_parameter.node_env.name
} 