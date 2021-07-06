variable "name" {
  type    = string
  default = "spacelift-webhook-receiver"
}

variable "hosted_zone_name" {
  type = string
}

variable "SPACELIFT_SECRET_TOKEN" {
  type      = string
  sensitive = true
}

variable "SLACK_BOT_TOKEN" {
  type      = string
  sensitive = true
}

variable "SLACK_SIGNING_SECRET" {
  type      = string
  sensitive = true
}

variable "aws_profile" {
  type = string
}

variable "aws_region" {
  type = string
}
