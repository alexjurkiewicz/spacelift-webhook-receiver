module "receiver" {
  source = "../"

  hosted_zone_name       = var.hosted_zone_name
  SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
  SLACK_BOT_TOKEN        = var.SLACK_BOT_TOKEN
  SLACK_SIGNING_SECRET   = var.SLACK_SIGNING_SECRET
  s3_bucket              = aws_s3_bucket.lambda_storage.id
  s3_key                 = "dist.zip"

  # Source file needs to be uploaded, if that's enabled.
  depends_on = [aws_s3_bucket_object.name]
}

resource "aws_s3_bucket" "lambda_storage" {
  bucket_prefix = "spacelift-webhook-receiver-"
}

resource "aws_s3_bucket_object" "name" {
  count  = var.upload_source ? 1 : 0
  bucket = aws_s3_bucket.lambda_storage.id
  key    = "dist.zip"
  source = "${path.module}/../../app/dist/dist.zip"
}
