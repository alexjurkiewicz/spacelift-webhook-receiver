module "receiver" {
  source = "../"

  hosted_zone_name       = var.hosted_zone_name
  SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
  SLACK_BOT_TOKEN        = var.SLACK_BOT_TOKEN
  SLACK_SIGNING_SECRET   = var.SLACK_SIGNING_SECRET
  function_source        = "${path.module}/../../app/dist/dist.zip"
}
