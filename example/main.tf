locals {
  domain_name = "${var.name}.${var.hosted_zone_name}"
}

module "receiver" {
  source = "../infra"

  name                   = var.name
  domain_name            = local.domain_name
  domain_certificate_arn = module.certificate.arn
  log_group_retention    = 1
  SPACELIFT_SECRET_TOKEN = var.SPACELIFT_SECRET_TOKEN
  function_source_type   = "local"
  function_local_source  = "../src/dist/dist.zip"

  depends_on = [
    module.certificate,
    data.external.build_app
  ]
}

data "external" "build_app" {
  program = ["bash", "-c", "set -eu && cat >/dev/null && cd ${module.path}/../src && npm ci && npm run-script build && echo {}"]

  query = {
    timestamp = timestamp() # Force data source to only run during apply
  }
}

module "certificate" {
  source  = "cloudposse/acm-request-certificate/aws"
  version = "~> 0.13.1"

  domain_name                 = local.domain_name
  zone_name                   = var.hosted_zone_name
  wait_for_certificate_issued = true
}

data "aws_route53_zone" "default" {
  name = var.hosted_zone_name
}

resource "aws_route53_record" "default" {
  zone_id = data.aws_route53_zone.default.id
  name    = local.domain_name
  type    = "A"
  alias {
    name                   = module.receiver.apigateway_domain_name_target_domain_name
    zone_id                = module.receiver.apigateway_domain_name_hosted_zone_id
    evaluate_target_health = false
  }
}
