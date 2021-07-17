import { APIGatewayProxyEventV2 } from "aws-lambda/trigger/api-gateway-proxy"
import { createHmac, timingSafeEqual } from "crypto"
import { SpaceliftAuditTrailEvent } from "./spacelift"

const SPACELIFT_SIGNATURE_HEADER = 'x-signature-256'

/**
 * Verify the provided event is valid. We check two things:
 *
 * 1. Event shape is correct
 * 2. Payload signature is valid
 *
 * @param event Raw AWS Lambda event
 * @returns Either a parsed event or a string error message.
 */
 export const verifySpaceliftEvent = (event: APIGatewayProxyEventV2, token: string): SpaceliftAuditTrailEvent | string => {
  const claimedSignature = event.headers[SPACELIFT_SIGNATURE_HEADER]
  if (claimedSignature === undefined) {
    return "Missing payload signature"
  }
  const body = event.body
  if (body === undefined) {
    return "Missing payload"
  }
  const bodyHash = createHmac('sha256', token).update(body).digest('hex')
  const actualSignature = `sha256=${bodyHash}`
  if (
    claimedSignature.length !== actualSignature.length ||
    !timingSafeEqual(Buffer.from(claimedSignature), Buffer.from(actualSignature))
  ) {
    return "Payload signature mismatch"
  }
  return JSON.parse(body)
}
