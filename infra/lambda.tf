resource "aws_lambda_function" "this" {
  function_name = var.name
  role          = aws_iam_role.lambda.arn
  description   = "Handler for Spacelift webhook events"
  environment {
    variables = {
      # DYNAMODB_TABLE         = module.dynamodb.table_name # Disabled for now
      SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
      SLACK_BOT_TOKEN        = var.SLACK_BOT_TOKEN
      SLACK_SIGNING_SECRET   = var.SLACK_SIGNING_SECRET
    }
  }
  handler   = "handler.lambdaEntry"
  runtime   = "nodejs14.x"
  s3_bucket = var.s3_bucket
  s3_key    = var.s3_key
  timeout   = 30

  depends_on = [
    aws_cloudwatch_log_group.lambda,
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name}"
  retention_in_days = "7"
}

resource "aws_iam_role" "lambda" {
  name                = var.name
  assume_role_policy  = data.aws_iam_policy_document.lambda_trust.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
  # Disabled for now
  # inline_policy {
  #   name   = "DynamoDB"
  #   policy = data.aws_iam_policy_document.lambda_dynamodb_access.json
  # }
}

data "aws_iam_policy_document" "lambda_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

# data "aws_iam_policy_document" "lambda_dynamodb_access" {
#   statement {
#     actions = [
#       "dynamodb:GetItem",
#       "dynamodb:BatchGetItem",
#       "dynamodb:DeleteItem",
#       "dynamodb:PutItem",
#       "dynamodb:UpdateItem",
#       "dynamodb:BatchWriteItem",
#     ]
#     resources = [module.dynamodb.table_arn]
#   }
# }
