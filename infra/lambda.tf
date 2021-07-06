resource "aws_lambda_function" "this" {
  function_name = var.name
  role          = aws_iam_role.lambda.arn
  description   = "Handler for Spacelift webhook events"
  environment {
    variables = {
      SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
      SLACK_BOT_TOKEN = var.SLACK_BOT_TOKEN
      SLACK_SIGNING_SECRET = var.SLACK_SIGNING_SECRET
    }
  }
  handler          = "handler.lambdaEntry"
  runtime          = "nodejs14.x"
  filename         = var.function_source
  source_code_hash = filebase64sha256(var.function_source)
  timeout          = 30

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
