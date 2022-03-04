variable "hosted_zone_name" {
  type        = string
  description = "The hosted zone name matching var.domain_name"
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

variable "aws_region" {
  type        = string
  description = "AWS region to use."
}

variable "upload_source" {
  type        = bool
  default     = true
  description = "If true, upload local app dist.zip to the bucket. If not true, you'll have to take care of this yourself."
}
