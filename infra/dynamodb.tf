module "dynamodb" {
  source  = "cloudposse/dynamodb/aws"
  version = "0.29.0"

  enabled      = false # for now
  name         = var.name
  hash_key     = "pk"
  range_key    = "sk"
  billing_mode = "PAY_PER_REQUEST"
}
