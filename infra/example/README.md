Example usage:

```bash
terraform apply \
  -var SPACELIFT_SECRET_TOKEN=qwerty \
  -var SLACK_BOT_TOKEN=xoxb-qwerty \
  -var SLACK_SIGNING_SECRET=qwerty \
  -var hosted_zone_name=mydomain.com \
  -var aws_profile=personal \
  -var aws_region=ap-southeast-2 \
  -auto-approve
```
