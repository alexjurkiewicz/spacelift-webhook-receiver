module "apigateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "~> 1.1.0"

  name                         = var.name
  description                  = "Spacelift webhook handler"
  domain_name                  = var.domain_name
  domain_name_certificate_arn  = var.domain_certificate_arn
  disable_execute_api_endpoint = true
  integrations = {
    "POST /" = {
      lambda_arn             = aws_lambda_function.this.arn
      payload_format_version = "2.0"
    }
  }
  default_stage_access_log_destination_arn = aws_cloudwatch_log_group.apigateway.arn
  default_stage_access_log_format          = "$context.identity.sourceIp - - [$context.requestTime] \"$context.httpMethod $context.routeKey $context.protocol\" $context.status $context.responseLength $context.requestId $context.integrationErrorMessage"
}

resource "aws_cloudwatch_log_group" "apigateway" {
  name              = "/${var.name}/apigateway"
  retention_in_days = var.log_group_retention
}

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apigateway.default_apigatewayv2_stage_execution_arn}/*"
}
