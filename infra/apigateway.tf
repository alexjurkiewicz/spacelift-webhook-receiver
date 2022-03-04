module "apigateway" {
  source  = "terraform-aws-modules/apigateway-v2/aws"
  version = "~> 1.5.1"

  name                         = var.name
  description                  = "Spacelift webhook handler"
  domain_name                  = "${var.name}.${var.hosted_zone_name}"
  domain_name_certificate_arn  = module.certificate.arn
  disable_execute_api_endpoint = true
  integrations = {
    "POST /" = {
      lambda_arn             = aws_lambda_function.this.arn
      payload_format_version = "2.0"
    }
  }
  default_stage_access_log_destination_arn = aws_cloudwatch_log_group.apigateway.arn
  default_stage_access_log_format          = "$context.identity.sourceIp - - [$context.requestTime] \"$context.httpMethod $context.routeKey $context.protocol\" $context.status $context.responseLength $context.requestId $context.integrationErrorMessage"

  depends_on = [
    # Need to wait for the whole module to create, which includes waiting for
    # the certificate to get validated.
    module.certificate,
  ]
}

resource "aws_cloudwatch_log_group" "apigateway" {
  name              = "/${var.name}/apigateway"
  retention_in_days = "7"
}

resource "aws_lambda_permission" "this" {
  statement_id  = "AllowExecutionFromApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${module.apigateway.default_apigatewayv2_stage_execution_arn}/*"
}

module "certificate" {
  source  = "cloudposse/acm-request-certificate/aws"
  version = "~> 0.13.1"

  domain_name                 = "${var.name}.${var.hosted_zone_name}"
  zone_name                   = var.hosted_zone_name
  wait_for_certificate_issued = true
}
