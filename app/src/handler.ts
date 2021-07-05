// import { Context } from "aws-lambda/handler"
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda/trigger/api-gateway-proxy"
import fetch from "node-fetch"
import pino from "pino";

import { isNotificationRule, NotificationRule } from "./notification";
import { eventIsInteresting, eventIsInterestingToRule, parseLabel } from "./rule";
import { generateSlackMessage, sendSlackMessage } from "./slack";
import { SpaceliftWebhookPayload } from "./spacelift"
import { verifySpaceliftEvent } from './verify'

// Once-off setup
export const logger = pino();

/**
 * Lambda handler.
 * @param raw_event
 * @returns
 */
export async function lambdaEntry(raw_event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  const spaceliftSecret = process.env.SPACELIFT_SECRET_TOKEN
  if (spaceliftSecret === undefined) {
    return lambdaError('Internal Error', {msg: "Couldn't load Spacelift secret token"})
  }
  // Validate for later
  if (process.env.SLACK_WEBHOOK_URL === undefined) {
    return lambdaError('Internal Error', {msg: "Couldn't load Slack webhook URL"})
  }

  const event = verifySpaceliftEvent(raw_event, spaceliftSecret)
  if (typeof event === 'string') {
    return lambdaError("Couldn't verify payload", {msg: 'Parsing Spacelift event failed', error: event})
  }

  logger.info({ msg: "Spacelift event", event })

  await processEvent(event)

  return { statusCode: 200 }
}

/**
 * Convenience function to generate an error response.
 * @param clientMessage Message to client
 * @param logData Object to log (should at least include msg)
 * @returns
 */
function lambdaError(clientMessage: string, logData: Record<string, unknown>): APIGatewayProxyStructuredResultV2 {
  if (logData) {
    logger.info({ ...logData, clientMessage })
  }
  return { statusCode: 500, body: JSON.stringify({ message: clientMessage }) }
}


async function processEvent(event: SpaceliftWebhookPayload): Promise<void> {
  if (!eventIsInteresting(event)) {
    logger.info("Event is not interesting")
    return
  }
  const message = generateSlackMessage(event)

  // Iterate over every `slack:` label and parse it
  const labelRules = event.stack.labels.filter((label) => {
    return label.startsWith('slack:')
  }).map(parseLabel).filter(isNotificationRule)
  logger.info(`Found ${labelRules.length} rules`)

  for (const rule of labelRules) {
    if (eventIsInterestingToRule(event, rule)) {
      logger.info({ msg: 'Rule was interested', rule })
      await sendSlackMessage(message, rule.target)
    } else {
      logger.info({ msg: 'Rule was NOT interested', rule })
    }
  }
}
