variable "name" {
  type        = string
  description = "Name of this deployment"
  default     = "spacelift-webhook-receiver"
}

variable "hosted_zone_name" {
  type        = string
  description = "Name of the hosted zone to create the record in"
}

variable "SPACELIFT_SECRET_TOKEN" {
  type        = string
  sensitive   = true
  description = "Secret token used to validate webhook payloads."
}

variable "SLACK_BOT_TOKEN" {
  type        = string
  sensitive   = true
  description = "Slack bot token used to post messages to Slack."
}

variable "SLACK_SIGNING_SECRET" {
  type        = string
  sensitive   = true
  description = "Slack signing secret used to validate Slack webhooks."
}

variable "s3_bucket" {
  type        = string
  default     = ""
  description = "S3 Bucket for Lambda Function."
}

variable "s3_key" {
  type        = string
  default     = ""
  description = "S3 Key for Lambda Function."
}
