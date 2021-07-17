data "aws_route53_zone" "default" {
  name = var.hosted_zone_name
}

resource "aws_route53_record" "default" {
  zone_id = data.aws_route53_zone.default.id
  name    = "${var.name}.${var.hosted_zone_name}"
  type    = "A"
  alias {
    name                   = module.apigateway.apigatewayv2_domain_name_target_domain_name
    zone_id                = module.apigateway.apigatewayv2_domain_name_hosted_zone_id
    evaluate_target_health = false
  }
}
