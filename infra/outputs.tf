output "apigateway_id" {
  value       = module.apigateway.apigatewayv2_api_id
  description = "API Gateway ID"
}
output "apigateway_domain_name_target_domain_name" {
  value       = module.apigateway.apigatewayv2_domain_name_target_domain_name
  description = "Target hostname for your ALIAS custom domain record"
}

output "apigateway_domain_name_hosted_zone_id" {
  value       = module.apigateway.apigatewayv2_domain_name_hosted_zone_id
  description = "Hosted zone ID for your ALIAS custom domain record"
}

output "apigateway_default_invoke_url" {
  value       = module.apigateway.default_apigatewayv2_stage_invoke_url
  description = "Default invoke URL for API Gateway (to bypass custom domain)"
}
