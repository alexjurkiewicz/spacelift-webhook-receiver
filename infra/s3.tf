locals {
  use_local_function_source = var.function_source_type == "local"
}

module "s3_bucket" {
  count = local.use_local_function_source ? 1 : 0
  source  = "cloudposse/s3-bucket/aws"
  version = "0.38.0"

  name                         = "${var.name}-code-staging"
  allow_encrypted_uploads_only = true
  allow_ssl_requests_only      = true
  force_destroy                = true
  lifecycle_rules = [{
    # Apply to all files
    "enabled" : true,
    "prefix" : "",
    "tags" : {}
    # Don't transition, just expire
    "enable_current_object_expiration" : true,
    "enable_standard_ia_transition" : false,
    "enable_glacier_transition" : false,
    "enable_deeparchive_transition" : false,
    # Expire after two days
    "abort_incomplete_multipart_upload_days" : 2,
    "expiration_days" : 2,
    "noncurrent_version_expiration_days" : 2,
    # Unused
    "standard_transition_days" : 30,
    "noncurrent_version_glacier_transition_days" : 30,
    "glacier_transition_days" : 60,
    "noncurrent_version_deeparchive_transition_days" : 60,
    "deeparchive_transition_days" : 90,
  }]
  sse_algorithm = "AES256"
}

locals {
  function_local_source_path = "${path.module}/${var.function_local_source}"
}

resource "aws_s3_bucket_object" "lambda" {
  count  = var.function_source_type == "local" ? 1 : 0
  bucket = module.s3_bucket[0].bucket_id
  key    = "lambda.zip"
  source = local.function_local_source_path
  etag   = filemd5(local.function_local_source_path)
}
