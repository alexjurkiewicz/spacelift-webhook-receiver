output "url" {
  value       = "https://${aws_route53_record.default.name}/"
  description = "URL for webhook payloads"
}
