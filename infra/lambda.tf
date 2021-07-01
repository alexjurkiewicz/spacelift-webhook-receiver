locals {
  lambda_s3_bucket  = local.use_local_function_source ? aws_s3_bucket_object.lambda[0].bucket : var.function_s3_source.bucket
  lambda_s3_key     = local.use_local_function_source ? aws_s3_bucket_object.lambda[0].key : var.function_s3_source.key
  lambda_s3_version = local.use_local_function_source ? aws_s3_bucket_object.lambda[0].version_id : null
}

resource "aws_lambda_function" "this" {
  function_name = var.name
  role          = aws_iam_role.lambda.arn
  description   = "Handler for Spacelift webhook events"
  environment {
    variables = {
      SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
    }
  }
  handler           = "handler.handler"
  runtime           = "nodejs14.x"
  s3_bucket         = local.lambda_s3_bucket
  s3_key            = local.lambda_s3_key
  s3_object_version = local.lambda_s3_version
  timeout           = 30

  depends_on = [
    aws_cloudwatch_log_group.lambda,
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${var.name}"
  retention_in_days = var.log_group_retention
}

resource "aws_iam_role" "lambda" {
  name                = var.name
  assume_role_policy  = data.aws_iam_policy_document.lambda_trust.json
  managed_policy_arns = ["arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"]
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
