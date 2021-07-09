# Spacelift Webhook Receiver

This is an example NodeJS application for receiving Spacelift webhook notifications and doing something with them.

You can fork this repository and extend the code as required.

## Usage

This repository has three components:

### Application

Located in `app/`. An AWS Lambda function to receive a Spacelift webhook and verify the signature. You can build it with:

```bash
npm install
npm run-scripts build
```

### Infrastructure

Located in `infra/`. A Terraform module to deploy:

* S3 Bucket to stage function code (if using a local file source)
* The above Lambda function
  * IAM Role
  * CloudWatch Log Group
* API Gateway with a custom domain
  * A route for `POST /` to the Lambda
  * CloudWatch Log Group

### Example

Located in `example/`. Example usage of the infrastructure component. This adds site-specific opinionated DNS configuration:

* Generate a new ACM certificate
* Add the custom domain record to Route 53
