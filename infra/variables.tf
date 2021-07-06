variable "name" {
  type        = string
  description = "Name of this deployment"
}

variable "domain_name" {
  type        = string
  description = "The domain name to use for API gateway"
}

variable "domain_certificate_arn" {
  type        = string
  description = "The ARN of an AWS-managed certificate that will be used by the endpoint for the domain name"
}

variable "log_group_retention" {
  type        = number
  description = "Number of days to retain log events for Lambda."
  default     = 1
}

variable "SPACELIFT_SECRET_TOKEN" {
  type        = string
  sensitive   = true
  description = "Secret token used to validate webhook payloads."
}

variable "SLACK_BOT_TOKEN" {
  type      = string
  sensitive = true
}

variable "SLACK_SIGNING_SECRET" {
  type      = string
  sensitive = true
}

variable "function_source" {
  type        = string
  description = "Function source path."
}
