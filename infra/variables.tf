variable "name" {
  type = string
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
  validation {
    condition     = contains([0, 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_group_retention)
    error_message = "Invalid log_group_retention value."
  }
}

variable "SPACELIFT_SECRET_TOKEN" {
  type = string
  sensitive = true
  description = "Secret token used to validate webhook payloads."
}

variable "function_source_type" {
  type = string
  description = <<-EOT
    Where the Lambda function source is stored. Valid values:

    * `local`: also specify `var.function_local_source`
    * `s3`: also specify `var.function_s3_source`
  EOT
  validation {
    condition = var.function_source_type == "s3" || var.function_source_type == "local"
    error_message = "The function source must be s3 or local."
  }
}
variable "function_s3_source" {
  type = object({
    bucket = string
    key = string
  })
  default = {
    bucket = ""
    key = ""
  }
  description = "Function source if `var.function_source_type` is s3"
}

variable "function_local_source" {
  type = string
  default = ""
  description = "Function source if `var.function_source_type` is local. Path relative to Terraform directory"
}
